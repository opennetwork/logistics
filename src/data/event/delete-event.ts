import {getEventStore} from "./store";
import {ScheduledEvent} from "./types";

export function deleteEvent(event: ScheduledEvent) {
    const store = getEventStore(event);
    if (!event.eventId) return undefined;
    return store.delete(event.eventId);
}