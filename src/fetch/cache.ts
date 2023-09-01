import {getKeyValueStore, KeyValueStore} from "../data";
import {DurableRequest, DurableResponse} from "./types";
import {ok} from "../is";
import {v4} from "uuid";
import {HeaderList, HeaderValue} from "http-header-list";

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
function isQueryCacheMatch(requestQuery: RequestInfo | URL | undefined, request: DurableRequest, response: DurableResponse | undefined, options?: CacheQueryOptions) {

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
        if (!response) {
            return true;
        }

        if (options?.ignoreVary) {
            return true;
        }

        const responseHeaders = new Headers(response.headers);
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

function getRequestQueryHeaders(requestQuery: RequestInfo | URL) {
    if (typeof requestQuery === "string" || requestQuery instanceof URL) {
        return undefined
    }
    return requestQuery.headers;
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

export class DurableCache implements Cache {

    name: string;

    constructor(cacheName: string) {
        this.name = cacheName;
    }

    async add(info: RequestInfo | URL, init?: Pick<RequestInit, "signal">): Promise<void> {
        const request = getRequest(info);
        const response = await fetch(request, init);
        return this.put(request, response);
    }

    async addAll(requests: RequestInfo[]): Promise<void> {
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

    async delete(requestQuery: RequestInfo | URL, options?: DurableCacheQueryOptions): Promise<boolean> {
        let deleted = false;
        const durableRequests = new Set();
        for await (const { durableRequest, durableResponse } of matchDurableRequestResponses(this.name, requestQuery, options)) {
            const responseStore = getDurableResponseStore(this.name, durableRequest);
            durableRequests.add(durableRequest);
            await responseStore.delete(durableResponse.durableResponseId);
            deleted = true;
        }
        for (const durableRequest of durableRequests) {
            const requestStore = getDurableRequestStore(this.name, durableRequest.url);
            await requestStore.delete(durableRequest.durableRequestId);
            deleted = true;
        }
        return deleted;
    }

    async match(requestQuery: RequestInfo | URL, options?: DurableCacheQueryOptions): Promise<Response | undefined> {
        return matchResponse(this.name, requestQuery, options);
    }

    async matchAll(requestQuery?: RequestInfo | URL, options?: DurableCacheQueryOptions): Promise<ReadonlyArray<Response>> {
        const responses = [];
        for await (const response of matchResponses(this.name, requestQuery, options)) {
            responses.push(response);
        }
        return responses;
    }

    // https://w3c.github.io/ServiceWorker/#cache-put
    async put(requestQuery: RequestInfo | URL, response: Response): Promise<void> {
        const url = getRequestQueryURL(requestQuery);
        const requestStore = getDurableRequestStore(this.name, url);

        ok(!response.bodyUsed);

        assertVaryValid(response.headers.get("Vary"));

        const clonedResponse = response.clone();

        const existingDurableRequest = await matchDurableRequest(this.name, requestQuery);

        const durableRequestId = existingDurableRequest?.durableRequestId || v4();

        const method = getRequestMethod();

        ok(method === "GET" || method === "HEAD", "Requests that aren't GET or HEAD will not be matchable")

        const durableRequest: DurableRequest = {
            durableRequestId,
            headers: getHeadersObject(getRequestQueryHeaders(requestQuery)),
            method,
            url,
        };

        const responseStore = getDurableResponseStore(this.name, durableRequest);

        const durableResponse: DurableResponse = {
            durableResponseId: v4(),
            headers: getResponseHeadersObject(),
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            // TODO investigate non string responses and storage
            // we could just use something like
            // await save(`fetch/cache/${durableRequestId}`, Buffer.from(await clonedResponse.arrayBuffer()))
            body: await clonedResponse.text()
        }

        await Promise.all([
            requestStore.set(durableRequest.durableRequestId, durableRequest),
            responseStore.set(durableResponse.durableResponseId, durableResponse)
        ]);

        return Promise.resolve(undefined);

        function getRequestMethod() {
            if (typeof requestQuery === "string" || requestQuery instanceof URL) {
                return "GET";
            }
            return requestQuery.method;
        }

        function getResponseHeadersObject() {
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

export function getDurableResponseStore(name: string, request: DurableRequest) {
    return getDurableCacheStore<DurableResponse>(`${name}:${request.durableRequestId}:response`);
}

export function getDurableRequestStore(name: string, url: string) {
    const parsedUrl = getCacheURLString(url, {
        ignoreSearch: true
    });
    return getDurableCacheStore<DurableRequest>(`${name}:request:${parsedUrl}`);
}

async function firstNext<T>(iterable: AsyncIterable<T>): Promise<IteratorResult<T>> {
    const iterator = iterable[Symbol.asyncIterator]();
    const next = await iterator.next();
    await iterator.return?.();
    return next;
}

async function matchResponse(cacheName: string, requestQuery?: RequestInfo | URL, options?: DurableCacheQueryOptions): Promise<Response | undefined> {
    const next = await firstNext(
        matchResponses(cacheName, requestQuery, options)
    );
    return next.value;
}

async function * matchResponses(cacheName: string, requestQuery?: RequestInfo | URL, options?: DurableCacheQueryOptions) {
    for await (const { durableResponse } of matchDurableRequestResponses(cacheName, requestQuery, options)) {
        yield fromDurableResponse(durableResponse);
    }
}

async function * matchDurableRequestResponses(cacheName: string, requestQuery?: RequestInfo | URL, options?: DurableCacheQueryOptions) {
    for await (const durableRequest of matchDurableRequests(this.name, requestQuery, options)) {
        const responseStore = getDurableResponseStore(this.name, durableRequest);
        for await (const durableResponse of responseStore) {
            if (isQueryCacheMatch(requestQuery, durableRequest, durableResponse, options)) {
                yield {
                    durableRequest,
                    durableResponse,
                } as const;
            }
        }
    }
}

async function matchDurableRequest(cacheName: string, requestQuery?: RequestInfo | URL, options?: DurableCacheQueryOptions): Promise<DurableRequest | undefined> {
    const next = await firstNext(
        matchDurableRequests(cacheName, requestQuery, options)
    );
    return next.value;
}

async function * matchDurableRequests(cacheName: string, requestQuery?: RequestInfo | URL, options?: DurableCacheQueryOptions) {
    const store = getDurableRequestStore(cacheName, getRequestQueryURL(requestQuery));
    for await (const request of store) {
        if (isQueryCacheMatch(requestQuery, request, undefined, options)) {
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
        this.store = getDurableCacheStore<DurableCacheReference>()
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