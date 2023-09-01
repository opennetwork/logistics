import {DurableEventData, UnknownEvent} from "../data";
import {on} from "../events";
import {dispatcher} from "../events/schedule/schedule";
import {defer} from "@virtualstate/promise";
import {isLike, isPromise, isSignalled, ok} from "../is";
import {DurableRequestData} from "./types";

const FETCH = "fetch" as const;
type ScheduleFetchEventType = typeof FETCH;



export interface DurableFetchEventData extends DurableEventData {
    type: ScheduleFetchEventType;
    request: DurableRequestData;
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

function createWaitUntil() {
    const promises: Promise<unknown>[] = [];

    function waitUntil(promise: Promise<unknown>) {
        promises.push(
            promise.catch(error => void error)
        );
    }

    async function wait() {
        if (promises.length) {
            await Promise.all(promises);
        }
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
    const { url, ...init } = event.request;
    const request = new Request(
        url,
        {
            ...init,
            signal
        }
    );
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

        // no response usage
        // we don't care if its resolved etc
        void response;

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