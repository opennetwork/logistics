import {getHappeningStore} from "../happening";
import {ScheduledEvent, ScheduledEventTypeData} from "./types";

export function getEventStore({ type }: ScheduledEventTypeData) {
    return getHappeningStore<ScheduledEvent>(`event:${type}`, {
        counter: true // free event counter
    });
}
