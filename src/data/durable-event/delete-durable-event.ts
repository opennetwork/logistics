import {getDurableEventStore} from "./store";
import {DurableEvent} from "./types";

export function deleteDurableEvent(event: DurableEvent) {
    const store = getDurableEventStore(event);
    if (!event.eventId) return undefined;
    return store.delete(event.eventId);
}