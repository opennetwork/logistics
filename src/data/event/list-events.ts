import {getEventStore} from "./store";
import {ScheduledEventTypeData} from "./types";

export function listEvents(event: ScheduledEventTypeData) {
    const store = getEventStore(event);
    return store.values();
}