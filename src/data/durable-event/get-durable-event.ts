import {DurableEventData} from "./types";
import {getDurableEventStore} from "./store";

export function getDurableEvent(event: DurableEventData) {
    if (!event.eventId) return undefined;
    const store = getDurableEventStore(event);
    return store.get(event.eventId);
}