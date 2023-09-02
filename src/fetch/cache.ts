import {
    DurableRequest,
    DurableRequestData,
    DurableResponseData,
    getKeyValueStore,
    KeyValueStore,
    getDurableRequestStore as getBaseRequestStore,
    RequestQuery
} from "../data";
import {ok} from "../is";
import {HeaderList} from "http-header-list";
import {getOrigin} from "../listen";
import {getConfig} from "../config";
import {fromDurableRequest, fromDurableResponse, fromRequestResponse} from "../data/durable-request/from";

export interface DurableCacheStorageConfig {
    getDurableCacheStorageOrigin?(): string
}

function getDurableCacheStorageOrigin() {
    const config = getConfig();
    return (
        config.getDurableCacheStorageOrigin?.() ??
        getOrigin()
    );
}

function getRequest(request: RequestQuery, getOrigin?: () => string) {
    if (typeof request === "string" || request instanceof URL) {
        return new Request(
            new URL(
                request,
                getOrigin?.()
            )
        );
    }
    if (request instanceof Request) {
        return request;
    }
    return fromDurableRequest(request, getOrigin);
}

function getRequestQueryURL(requestQuery: RequestQuery, getOrigin?: () => string) {
    if (typeof requestQuery === "string") {
        return new URL(requestQuery, getOrigin?.()).toString();
    }
    if (requestQuery instanceof URL) {
        return requestQuery.toString();
    }
    return requestQuery.url;
}

// https://w3c.github.io/ServiceWorker/#query-cache
function isQueryCacheMatch(requestQuery: RequestQuery | undefined, request: DurableRequest, options?: CacheQueryOptions) {

    return (
        isMethodMatch() &&
        isURLMatch() &&
        isVaryMatch()
    );

    function isMethodMatch() {
        if (options?.ignoreMethod) {
            return true;
        }
        return (
            request.method === "GET" ||
            request.method === "HEAD"
        );
    }

    function isURLMatch() {
        if (!requestQuery) {
            return true;
        }
        const queryUrl = getRequestQueryURL(requestQuery, () => request.url);
        return getCacheURLString(queryUrl, options) === getCacheURLString(request.url, options)
    }

    function isVaryMatch() {
        if (!request.response) {
            return true;
        }

        if (options?.ignoreVary) {
            return true;
        }

        const responseHeaders = new Headers(request.response.headers);
        const vary = responseHeaders.get("Vary");

        if (vary) {
            return true;
        }

        const { list } = new HeaderList(vary);

        const values = list.map(({ value }) => value);

        ok(values.length, "Unexpected Vary list")

        const requestHeaders = getRequestQueryHeaders(requestQuery);

        if (!requestHeaders) {
            // No headers no match, not gonna match
            return false;
        }

        for (const name of values) {
            if (name === "*") {
                return false;
            }

            const requestHeader = requestHeaders.get(name);
            const responseHeader = responseHeaders.get(name);

            if (requestHeader !== responseHeader) {
                return false;
            }
        }

        return true;
    }
}

function getCacheURLString(string: string, options?: CacheQueryOptions) {
    const instance = new URL(string);
    if (options?.ignoreSearch) {
        instance.search = "";
    }
    if (instance.hash) {
        instance.hash = "";
    }
    return instance.toString();
}



function getRequestQueryHeaders(requestQuery: RequestQuery) {
    if (typeof requestQuery === "string" || requestQuery instanceof URL) {
        return undefined
    }
    return new Headers(requestQuery.headers);
}

function assertVaryValid(vary: string) {
    if (!vary) {
        return true;
    }
    /*
If innerResponse’s header list contains a header named `Vary`, then:

Let fieldValues be the list containing the items corresponding to the Vary header’s field-values.

For each fieldValue in fieldValues:

If fieldValue matches "*", return a promise rejected with a TypeError.
     */
    const { list } = new HeaderList(vary);
    const wildcard = list.find(({ value }) => value === "*");
    if (wildcard) {
        throw new TypeError(`Unsupported header "Vary: *"`);
    }
}

export interface DurableCacheQueryOptions extends CacheQueryOptions {

}

export interface DurableCacheOptions {
    name: string;
    url(): string;
}

export class DurableCache implements Cache {

    name: string;
    url: () => string;

    constructor({ name, url }: DurableCacheOptions) {
        this.name = name;
        this.url = url;
    }

    async add(info: RequestQuery, init?: Pick<RequestInit, "signal">): Promise<void> {
        const request = getRequest(info, this.url);
        const response = await fetch(request, init);
        return this.put(request, response);
    }

    async addAll(requests: RequestQuery[]): Promise<void> {
        const controller = new AbortController();
        const { signal } = controller;
        try {
            await Promise.all(
                requests.map(request => this.add(request, {
                    signal
                }))
            );
        } catch (error) {
            if (!signal.aborted) {
                controller.abort(error)
            }
            throw error;
        } finally {
            if (!signal.aborted) {
                controller.abort()
            }
        }
    }

    async delete(requestQuery: RequestQuery, options?: DurableCacheQueryOptions): Promise<boolean> {
        let deleted = false;
        for await (const durableRequest of matchDurableRequests(this.name, requestQuery, options, this.url)) {
            const requestStore = getDurableRequestStore(this.name, getRequestQueryURL(durableRequest, this.url));
            await requestStore.delete(durableRequest.durableRequestId);
            deleted = true;
        }
        return deleted;
    }

    async match(requestQuery: RequestQuery, options?: DurableCacheQueryOptions): Promise<Response | undefined> {
        return matchResponse(this.name, requestQuery, options, this.url);
    }

    async matchAll(requestQuery?: RequestQuery, options?: DurableCacheQueryOptions): Promise<ReadonlyArray<Response>> {
        const responses = [];
        for await (const response of matchResponses(this.name, requestQuery, options, this.url)) {
            responses.push(response);
        }
        return responses;
    }

    // https://w3c.github.io/ServiceWorker/#cache-put
    async put(requestQuery: RequestInfo | URL, response: Response): Promise<void> {
        const url = getRequestQueryURL(requestQuery, this.url);
        const requestStore = getDurableRequestStore(this.name, url);

        ok(!response.bodyUsed);
        assertVaryValid(response.headers.get("Vary"));

        const method = getRequestMethod();
        ok(method === "GET" || method === "HEAD", "Requests that aren't GET or HEAD will not be matchable")

        const cacheUrl = getCacheURLString(url);

        const clonedRequest = new Request(cacheUrl, {
            method,
            headers: getRequestQueryHeaders(requestQuery)
        });

        const durableRequest = await fromRequestResponse(
            clonedRequest,
            response
        );

        await requestStore.set(durableRequest.durableRequestId, durableRequest);

        function getRequestMethod() {
            if (typeof requestQuery === "string" || requestQuery instanceof URL) {
                return "GET";
            }
            return requestQuery.method;
        }
    }

    async keys(requestQuery?: RequestInfo | URL, options?: CacheQueryOptions): Promise<ReadonlyArray<Request>> {
        const requests: Request[] = [];
        for await (const durableRequest of matchDurableRequests(this.name, requestQuery, options, this.url)) {
            requests.push(fromDurableRequest(durableRequest, this.url));
        }
        return requests;
    }

}

const CACHE_STORE_NAME = "fetch:cache";

function getDurableRequestPrefix(name: string) {
    return `${name}:request`;
}

function getDurableRequestStore(name: string, url: string) {
    const cacheUrl = getCacheURLString(url, {
        ignoreSearch: true
    })
    // This allows narrowing in on a search ignored url directly
    // All mutation should be made against this store
    const prefix = getDurableRequestPrefix(name);
    return getDurableRequestStoreWithPrefix(`${prefix}:${cacheUrl}`);
}

function getReadonlyDurableRequestStoreWithoutURL(name: string) {
    // Note that this allows reading across multiple urls
    // Only reads should be made against this store, unless full prefixed keys are used
    const prefix = getDurableRequestPrefix(name);
    return getDurableRequestStoreWithPrefix(prefix);
}

function getDurableRequestStoreWithPrefix(prefix: string) {
    return getBaseRequestStore({
        name: CACHE_STORE_NAME,
        prefix,
    });
}

interface DurableCacheReference {
    cacheName: string;
    createdAt: string;
    lastOpenedAt: string;
}

function getDurableCacheReferenceStore() {
    return getKeyValueStore<DurableCacheReference>(CACHE_STORE_NAME, {
        prefix: "reference",
        counter: false
    });
}

async function firstNext<T>(iterable: AsyncIterable<T>): Promise<IteratorResult<T>> {
    const iterator = iterable[Symbol.asyncIterator]();
    const next = await iterator.next();
    await iterator.return?.();
    return next;
}

async function matchResponse(cacheName: string, requestQuery?: RequestQuery, options?: DurableCacheQueryOptions, getOrigin?: () => string): Promise<Response | undefined> {
    const next = await firstNext(
        matchResponses(cacheName, requestQuery, options, getOrigin)
    );
    return next.value;
}

async function * matchResponses(cacheName: string, requestQuery?: RequestQuery, options?: DurableCacheQueryOptions, getOrigin?: () => string) {
    for await (const { response } of matchDurableRequests(cacheName, requestQuery, options, getOrigin)) {
        if (response) {
            yield fromDurableResponse(response);
        }
    }
}

async function * matchDurableRequests(cacheName: string, requestQuery?: RequestQuery, options?: DurableCacheQueryOptions, getOrigin?: () => string) {
    for await (const request of getStore()) {
        if (isQueryCacheMatch(requestQuery, request, options)) {
            yield request;
        }
    }

    function getStore() {
        // Note that this is allowing matching across multiple url prefixes
        if (!requestQuery) {
            return getReadonlyDurableRequestStoreWithoutURL(cacheName);
        }
        return getDurableRequestStore(cacheName, getRequestQueryURL(requestQuery, getOrigin))
    }
}

export interface DurableCacheStorageOptions {
    url(): string;
}

export class DurableCacheStorage implements CacheStorage {

    store: KeyValueStore<DurableCacheReference>;
    caches: Map<string, DurableCache>;
    url: () => string;

    constructor(options: DurableCacheStorageOptions) {
        this.url = options.url
        this.caches = new Map();
        this.store = getDurableCacheReferenceStore();
    }

    async open(cacheName: string): Promise<DurableCache> {
        const existing = this.caches.get(cacheName);
        if (existing) {
            return existing;
        }
        const existingReference = await this.store.get(cacheName);
        const lastOpenedAt = new Date().toISOString();
        const reference: DurableCacheReference = {
            createdAt: existingReference?.createdAt || lastOpenedAt,
            cacheName,
            lastOpenedAt
        };
        await this.store.set(cacheName, reference);
        const cache = new DurableCache({
            name: cacheName,
            url: this.url
        });
        this.caches.set(cacheName, cache);
        return cache;
    }

    async has(cacheName: string): Promise<boolean> {
        if (this.caches.has(cacheName)) {
            return true;
        }
        return this.store.has(cacheName);
    }

    async keys(): Promise<string[]> {
        return await this.store.keys();
    }

    async delete(cacheName: string): Promise<boolean> {
        if (!(await this.has(cacheName))) {
            return false;
        }
        // open as we are wanting to clear it
        const cache = await this.open(cacheName);
        const keys = await cache.keys();
        for (const key of keys) {
            await cache.delete(key);
        }
        await this.store.delete(cacheName);
        this.caches.delete(cacheName);
        return true;
    }

    async match(requestQuery: RequestQuery, options?: MultiCacheQueryOptions): Promise<Response | undefined> {
        for (const cacheName of await this.keys()) {
            const cache = await this.open(cacheName);
            const match = await cache.match(requestQuery, options);
            if (match) {
                return match;
            }
        }
        return undefined;
    }

}

export const caches = new DurableCacheStorage({
    url: getDurableCacheStorageOrigin
});
