import {getDurableRequestStore} from "./store";
import {DurableEvent} from "../durable-event";

export function getDurableRequest(durableRequestId: string) {
    const store = getDurableRequestStore();
    return store.get(durableRequestId);
}

export function getDurableRequestIdForEvent(event: DurableEvent) {
    return `${event.type}:request:${event.durableEventId}`;
}

export function getDurableRequestForEvent(event: DurableEvent) {
    return getDurableRequest(
        getDurableRequestIdForEvent(event)
    );
}