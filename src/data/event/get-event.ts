import {ScheduledEventData} from "./types";
import {getEventStore} from "./store";

export function getEvent(event: ScheduledEventData) {
    if (!event.eventId) return undefined;
    const store = getEventStore(event);
    return store.get(event.eventId);
}