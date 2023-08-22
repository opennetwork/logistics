import {v4} from "uuid";
import {ScheduledEvent, ScheduledEventData} from "./types";
import {getEventStore} from "./store";

export async function addEvent(event: ScheduledEventData) {
    const createdAt = new Date().toISOString();
    const eventId = event.eventId || v4();
    const scheduled: ScheduledEvent = {
        timeStamp: Date.now(),
        createdAt,
        updatedAt: createdAt,
        eventId,
        ...event
    };
    const store = getEventStore(scheduled);
    await store.set(eventId, scheduled);
}