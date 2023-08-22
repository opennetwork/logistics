import {addEvent, ScheduledEventData} from "../data";

export async function dispatchEvent(event: ScheduledEventData) {
    return addEvent(event);
}