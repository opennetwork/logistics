import {getDurableEventStore} from "./store";
import {DurableEvent, DurableEventData} from "./types";

export function deleteDurableEvent(event: DurableEventData) {
    const store = getDurableEventStore(event);
    if (!event.eventId) return undefined;
    return store.delete(event.eventId);
}