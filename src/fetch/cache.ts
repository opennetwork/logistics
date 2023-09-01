import {getKeyValueStore, KeyValueStore} from "../data";
import {DurableRequest, DurableResponse} from "./types";
import {ok} from "../is";
import {v4} from "uuid";
import { HeaderList } from "http-header-list";

export interface CachedResponse {

}

function getRequest(request: RequestInfo | URL) {
    if (typeof request === "string" || request instanceof URL) {
        return new Request(request);
    }
    return request;
}

function getRequestQueryURL(requestQuery: RequestInfo | URL) {
    if (typeof requestQuery === "string") {
        return requestQuery;
    }
    if (requestQuery instanceof URL) {
        return requestQuery.toString();
    }
    return requestQuery.url;
}

// https://w3c.github.io/ServiceWorker/#query-cache
function isQueryCacheRequestMatch(requestQuery: RequestInfo | URL, request: DurableRequest, options?: CacheQueryOptions) {

    return (
        isMethodMatch() &&
        isURLMatch() &&
        isVaryMatch()
    );

    function isURLMatch() {
        const queryUrl = getRequestQueryURL(requestQuery);
        return getCacheURLString(queryUrl, options) === getCacheURLString(request.url, options)
    }

    function isMethodMatch() {
        if (options?.ignoreMethod) {
            return true;
        }
        return (
            request.method === "GET" ||
            request.method === "HEAD"
        );
    }

    function isVaryMatch() {
        if (options?.ignoreVary) {
            return true;
        }
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

function fromDurableRequest(durableRequest: DurableRequest) {
    const { url, ...init } = durableRequest;
    return new Request(
        url,
        init
    );
}

function fromDurableResponse(durableResponse: DurableResponse) {
    const { body, ...init } = durableResponse;
    return new Response(
        body,
        init
    );
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

export class DurableCache implements Cache {

    name: string;

    private readonly requests: Record<string, KeyValueStore<DurableRequest>>;
    private readonly responses: KeyValueStore<DurableResponse>;

    constructor(cacheName: string) {
        this.name = cacheName;
        this.requests = {};
        this.responses = getDurableResponseStore(cacheName);
    }

    async add(info: RequestInfo | URL): Promise<void> {
        const request = getRequest(info);
        const response = await fetch(request);
        return this.put(request, response);
    }

    async addAll(requests: RequestInfo[]): Promise<void> {
        await Promise.all(
            requests.map(request => this.add(request))
        );
    }

    async delete(requestQuery: RequestInfo | URL, options?: DurableCacheQueryOptions): Promise<boolean> {
        const durableRequest = await matchDurableRequest(this.name, requestQuery, options);
        if (!durableRequest) {
            return false;
        }
        const store = getDurableRequestStore(this.name, getRequestQueryURL(requestQuery), this.requests);
        await Promise.all([
            await store.delete(durableRequest.durableRequestId),
            // Matching request/response id
            await this.responses.delete(durableRequest.durableRequestId)
        ]);
        return true;
    }

    async match(requestQuery: RequestInfo | URL, options?: DurableCacheQueryOptions): Promise<Response | undefined> {
        const durableRequest = await matchDurableRequest(this.name, requestQuery)
        if (!durableRequest) {
            return undefined;
        }
        const durableResponse = await this.responses.get(durableRequest.durableRequestId);
        if (!durableResponse) {
            return undefined;
        }
        return fromDurableResponse(durableResponse);
    }

    async matchAll(requestQuery?: RequestInfo | URL, options?: DurableCacheQueryOptions): Promise<ReadonlyArray<Response>> {
        const responses = [];
        for await (const durableRequest of matchDurableRequests(this.name, requestQuery, options)) {
            const durableResponse = await this.responses.get(durableRequest.durableRequestId);
            if (durableResponse) {
                responses.push(fromDurableResponse(durableResponse));
            }
        }
        return responses;
    }

    // https://w3c.github.io/ServiceWorker/#cache-put
    async put(requestQuery: RequestInfo | URL, response: Response): Promise<void> {
        const url = getRequestQueryURL(requestQuery);
        const store = getDurableRequestStore(this.name, url, this.requests);

        ok(!response.bodyUsed);

        assertVaryValid(response.headers.get("Vary"));

        const clonedResponse = response.clone();

        const existingDurableRequest = await matchDurableRequest(this.name, requestQuery);

        const durableRequestId = existingDurableRequest?.durableRequestId || v4();

        const method = getRequestMethod();

        ok(method === "GET" || method === "HEAD", "Requests that aren't GET or HEAD will not be matchable")

        const durableRequest: DurableRequest = {
            durableRequestId,
            headers: getRequestHeaders(),
            method,
            url,
        };

        const durableResponse: DurableResponse = {
            durableResponseId: durableRequestId,
            headers: getResponseHeaders(),
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            // TODO investigate non string responses and storage
            // we could just use something like
            // await save(`fetch/cache/${durableRequestId}`, Buffer.from(await clonedResponse.arrayBuffer()))
            body: await clonedResponse.text()
        }

        await Promise.all([
            store.set(durableRequest.durableRequestId, durableRequest),
            this.responses.set(durableResponse.durableResponseId, durableResponse)
        ]);

        return Promise.resolve(undefined);

        function getHeadersObject(headers: Headers) {
            const output: Record<string, string> = {};
            headers.forEach((value, key) => {
                output[key] = value;
            })
            return output;
        }

        function getRequestMethod() {
            if (typeof requestQuery === "string" || requestQuery instanceof URL) {
                return "GET";
            }
            return requestQuery.method;
        }

        function getRequestHeaders() {
            if (typeof requestQuery === "string" || requestQuery instanceof URL) {
                return {}
            }
            return getHeadersObject(requestQuery.headers);
        }

        function getResponseHeaders() {
            const headers = new Headers(response.headers);
            headers.delete("Set-Cookie");
            return getHeadersObject(headers);
        }
    }

    async keys(requestQuery?: RequestInfo | URL, options?: CacheQueryOptions): Promise<ReadonlyArray<Request>> {
        const requests: Request[] = [];
        for await (const durableRequest of matchDurableRequests(this.name, requestQuery, options)) {
            requests.push(fromDurableRequest(durableRequest));
        }
        return requests;
    }

}

function getDurableCacheStore<T>(prefix?: string) {
    return getKeyValueStore<T>(`fetch:cache`, {
        counter: false,
        prefix
    });
}

export function getDurableResponseStore(name: string) {
    return getDurableCacheStore<DurableResponse>(`${name}:response`);
}

export function getDurableRequestStore(name: string, url: string, mutableStoreCache?: Record<string, KeyValueStore<DurableRequest>>) {
    const parsedUrl = getCacheURLString(url, {
        ignoreSearch: true
    });
    if (mutableStoreCache) {
        const existing = mutableStoreCache[parsedUrl];
        if (existing) {
            return existing;
        }
    }
    const store = getDurableCacheStore<DurableRequest>(`${name}:request:${parsedUrl}`);
    if (mutableStoreCache) {
        mutableStoreCache[parsedUrl] = store;
    }
    return store;
}

async function firstNext<T>(iterable: AsyncIterable<T>): Promise<IteratorResult<T>> {
    const iterator = iterable[Symbol.asyncIterator]();
    const next = await iterator.next();
    await iterator.return?.();
    return next;
}

async function matchDurableRequest(cacheName: string, requestQuery?: RequestInfo | URL, options?: DurableCacheQueryOptions): Promise<DurableRequest | undefined> {
    const next = await firstNext(
        matchDurableRequests(cacheName, requestQuery, options)
    );
    return next.value;
}

async function * matchDurableRequests(cacheName: string, requestQuery?: RequestInfo | URL, options?: DurableCacheQueryOptions) {
    const store = getDurableRequestStore(cacheName, getRequestQueryURL(requestQuery), this.requests);
    for await (const request of store) {
        if (isQueryCacheRequestMatch(requestQuery, request, options)) {
            yield request;
        }
    }
}

interface DurableCacheReference {
    cacheName: string;
    createdAt: string;
    lastOpenedAt: string;
}

export class DurableCacheStorage implements CacheStorage {

    store: KeyValueStore<DurableCacheReference>;
    caches: Map<string, Cache>;

    constructor() {
        this.caches = new Map();
    }

    async open(cacheName: string) {
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
        const cache = new DurableCache(cacheName);
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

    async match(requestQuery: RequestInfo | URL, options?: MultiCacheQueryOptions): Promise<Response | undefined> {
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

export const caches = new DurableCacheStorage();