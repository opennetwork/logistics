import {getKeyValueStore, KeyValueStore} from "../data";
import {DurableRequest, DurableRequestData, DurableResponseData} from "./types";
import {ok} from "../is";
import {HeaderList} from "http-header-list";
import {getOrigin} from "../listen";
import {getConfig} from "../config";

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

function getRequest(request: RequestQuery) {
    if (typeof request === "string" || request instanceof URL) {
        return new Request(request);
    }
    if (request instanceof Request) {
        return request;
    }
    return fromDurableRequest(request);
}

function getRequestQueryURL(requestQuery: RequestQuery) {
    if (typeof requestQuery === "string") {
        return requestQuery;
    }
    if (requestQuery instanceof URL) {
        return requestQuery.toString();
    }
    return requestQuery.url;
}

export interface RequestQueryInfo extends DurableRequestData {

}

export type RequestQuery = RequestQueryInfo | RequestInfo | URL

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
        const queryUrl = getRequestQueryURL(requestQuery);
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

function fromDurableRequest(durableRequest: DurableRequestData) {
    const { url, ...init } = durableRequest;
    return new Request(
        url,
        init
    );
}

function fromDurableResponse(durableResponse: DurableResponseData) {
    const { body, ...init } = durableResponse;
    return new Response(
        body,
        init
    );
}

function getRequestQueryHeaders(requestQuery: RequestQuery) {
    if (typeof requestQuery === "string" || requestQuery instanceof URL) {
        return undefined
    }
    return new Headers(requestQuery.headers);
}

function getHeadersObject(headers?: Headers) {
    const output: Record<string, string> = {};
    if (!headers) {
        return output;
    }
    headers.forEach((value, key) => {
        output[key] = value;
    })
    return output;
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
        const request = getRequest(info);
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
        const requestStore = getDurableRequestStore(this.name);
        for await (const durableRequest of matchDurableRequests(this.name, requestQuery, options)) {
            await requestStore.delete(durableRequest.durableRequestId);
            deleted = true;
        }
        return deleted;
    }

    async match(requestQuery: RequestQuery, options?: DurableCacheQueryOptions): Promise<Response | undefined> {
        return matchResponse(this.name, requestQuery, options);
    }

    async matchAll(requestQuery?: RequestQuery, options?: DurableCacheQueryOptions): Promise<ReadonlyArray<Response>> {
        const responses = [];
        for await (const response of matchResponses(this.name, requestQuery, options)) {
            responses.push(response);
        }
        return responses;
    }

    // https://w3c.github.io/ServiceWorker/#cache-put
    async put(requestQuery: RequestInfo | URL, response: Response): Promise<void> {
        const url = getRequestQueryURL(requestQuery);
        const requestStore = getDurableRequestStore(this.name);

        ok(!response.bodyUsed);

        assertVaryValid(response.headers.get("Vary"));

        const clonedResponse = response.clone();

        const method = getRequestMethod();

        ok(method === "GET" || method === "HEAD", "Requests that aren't GET or HEAD will not be matchable")

        const durableResponse: DurableResponseData = {
            headers: getResponseHeadersObject(),
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            // TODO investigate non string responses and storage
            // we could just use something like
            // await save(`fetch/cache/${durableRequestId}`, Buffer.from(await clonedResponse.arrayBuffer()))
            body: await clonedResponse.text()
        }

        const durableRequest: DurableRequest = {
            durableRequestId: `${method}:${url}`,
            method,
            url,
            response: durableResponse
        };

        // TODO ... need to double check if put really means... delete anything matching the same request
        await this.delete(fromDurableRequest(durableRequest));
        await requestStore.set(durableRequest.durableRequestId, durableRequest);

        function getRequestMethod() {
            if (typeof requestQuery === "string" || requestQuery instanceof URL) {
                return "GET";
            }
            return requestQuery.method;
        }

        function getResponseHeadersObject() {
            const headers = new Headers(response.headers);
            // Not sure if we ever get this header in node fetch
            // https://developer.mozilla.org/en-US/docs/Web/API/Cache#cookies_and_cache_objects
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

export function getDurableRequestStore(name: string) {
    return getDurableCacheStore<DurableRequest>(`${name}:request`);
}

async function firstNext<T>(iterable: AsyncIterable<T>): Promise<IteratorResult<T>> {
    const iterator = iterable[Symbol.asyncIterator]();
    const next = await iterator.next();
    await iterator.return?.();
    return next;
}

async function matchResponse(cacheName: string, requestQuery?: RequestQuery, options?: DurableCacheQueryOptions): Promise<Response | undefined> {
    const next = await firstNext(
        matchResponses(cacheName, requestQuery, options)
    );
    return next.value;
}

async function * matchResponses(cacheName: string, requestQuery?: RequestQuery, options?: DurableCacheQueryOptions) {
    for await (const { response } of matchDurableRequests(cacheName, requestQuery, options)) {
        if (response) {
            yield fromDurableResponse(response);
        }
    }
}

async function * matchDurableRequests(cacheName: string, requestQuery?: RequestQuery, options?: DurableCacheQueryOptions) {
    for await (const request of getDurableRequestStore(cacheName)) {
        if (isQueryCacheMatch(requestQuery, request, options)) {
            yield request;
        }
    }
}

interface DurableCacheReference {
    cacheName: string;
    createdAt: string;
    lastOpenedAt: string;
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
        this.store = getDurableCacheStore<DurableCacheReference>()
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
