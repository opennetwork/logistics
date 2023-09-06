import {DurableEventData, DurableRequestData, setDurableRequestForEvent} from "../data";
import {dispatchEvent, on} from "../events";
import {dispatcher} from "../events/schedule/schedule";
import {defer} from "@virtualstate/promise";
import {isLike, isPromise, isSignalled, ok} from "../is";
import {fromDurableRequest, fromRequestResponse} from "../data/durable-request/from";
import {v4} from "uuid";

const FETCH = "fetch" as const;
type ScheduleFetchEventType = typeof FETCH;

export interface DurableFetchEventData extends DurableEventData {
    type: ScheduleFetchEventType;
    request: DurableRequestData;
    dispatch?: DurableEventData;
}

export interface FetchEvent extends Omit<DurableFetchEventData, "request"> {
    handled: Promise<void>;
    request: Request;
    respondWith(response: Response | Promise<Response>): void;
    waitUntil(promise: Promise<void | unknown>): void;
}

function isFetchEvent(event: unknown): event is FetchEvent {
    return !!(
        isLike<FetchEvent>(event) &&
        event.type === FETCH &&
        event.request &&
        event.respondWith
    )
}

export const removeFetchScheduledFunction = on(FETCH, async (event) => {
    ok(isFetchEvent(event));
    event.respondWith(
        fetch(
            event.request
        )
    );
});

function createRespondWith() {
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
    const request = fromDurableRequest(event.request);
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
        if (durableEventDispatch || (event.durableEventId && (event.virtual || event.retain))) {
            const durableRequest = await fromRequestResponse(request, response);
            await setDurableRequestForEvent(durableRequest, durableEventDispatch || event);
            if (durableEventDispatch) {
                await dispatchEvent(durableEventDispatch);
            }
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