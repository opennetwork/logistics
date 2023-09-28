import {defer} from "@virtualstate/promise";
import {isLike, isPromise, isSignalled, ok} from "../is";
import {
    DurableBody,
    DurableEventData,
    DurableRequest,
    fromDurableRequest,
    fromRequestResponse,
    setDurableRequestForEvent
} from "../data";
import {dispatcher} from "../events/schedule/schedule";
import {v4} from "uuid";
import {caches} from "./cache";
import {dispatchEvent} from "../events";
import {getConfig} from "../config";
import {DurableFetchEventCache, DurableFetchEventData, FETCH} from "./events";

export function isDurableFetchEventCache(value: unknown): value is DurableFetchEventCache {
    return !!(
        isLike<DurableFetchEventCache>(value) &&
        typeof value.name === "string"
    );
}

export function createRespondWith() {
    const { promise: handled, resolve, reject } = defer<Response>();

    function respondWith(response: Response | Promise<Response>) {
        if (isPromise(response)) {
            return response.then(resolve, reject);
        }
        return resolve(response);
    }

    return {
        handled,
        respondWith
    }
}

export function createWaitUntil() {
    let promises: Promise<unknown>[] = [];

    function waitUntil(promise: Promise<unknown>) {
        promises.push(
            promise.catch(error => void error)
        );
    }

    async function wait(): Promise<void> {
        if (!promises.length) {
            return;
        }
        const current = promises;
        promises = [];
        await Promise.all(current);
        return wait();
    }

    return {
        wait,
        waitUntil
    }
}


function isDurableFetchEventData(event?: DurableEventData): event is DurableFetchEventData {
    return !!(
        isLike<DurableFetchEventData>(event) &&
        event.type === FETCH &&
        event.request &&
        event.request.url
    );
}

export const removeFetchDispatcherFunction = dispatcher(FETCH, async (event, dispatch) => {
    const { signal, controller } = getSignal();
    ok(isDurableFetchEventData(event));
    const {
        handled,
        respondWith
    } = createRespondWith();
    const {
        wait,
        waitUntil
    } = createWaitUntil();
    const request = await fromDurableRequest(event.request);
    try {
        await dispatch({
            ...event,
            signal,
            request,
            handled,
            respondWith,
            waitUntil
        });
        const response = await handled;
        let durableEventDispatch: DurableEventData;
        if (event.dispatch) {
            durableEventDispatch = {
                durableEventId: v4(),
                ...event.dispatch
            };
        }
        const isRetain = durableEventDispatch || (event.durableEventId && event.retain !== false);
        let body: DurableBody;
        const givenCache = typeof event.cache === "string" ? { name: event.cache } : isDurableFetchEventCache(event.cache) ? event.cache : undefined;
        const cache =  givenCache ?? (isRetain ? { name: FETCH } : undefined);
        if (cache) {
            const { name, always } = cache;
            if (response.ok || always) {
                const store = await caches.open(name);
                await store.put(request, response);
                body = {
                    type: "cache",
                    value: name,
                    url: request.url
                };
            }
        }
        let durableRequest: DurableRequest;
        if (isRetain) {
            const durableRequestData = await fromRequestResponse(request, response, {
                body
            });
            durableRequest = await setDurableRequestForEvent(durableRequestData, durableEventDispatch || event);
            if (durableEventDispatch) {
                const { response, ...request } = durableRequest;
                await dispatchEvent({
                    ...durableEventDispatch,
                    request,
                    response
                });
            }
        }
        const { response: givenFns } = getConfig();
        const responseFns = Array.isArray(givenFns) ? givenFns : (givenFns ? [givenFns] : []);
        if (responseFns.length) {
            await Promise.all(
                responseFns.map(async (fn) => fn(response.clone(), request, durableRequest))
            );
        }
    } catch (error) {
        if (!signal.aborted) {
            controller?.abort(error);
        }
    } finally {
        if (!signal.aborted) {
            controller?.abort();
        }
        await wait();
    }

    function getSignal() {
        if (isSignalled(event)) {
            return { signal: event.signal, controller: undefined } as const;
        }
        const controller = new AbortController();
        return {
            signal: controller.signal,
            controller
        } as const;
    }
})