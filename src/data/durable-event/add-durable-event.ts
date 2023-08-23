import {v4} from "uuid";
import {DurableEvent, DurableEventData} from "./types";
import {getDurableEventStore} from "./store";

export async function addDurableEvent(event: DurableEventData) {
    const createdAt = new Date().toISOString();
    const eventId = event.eventId || v4();
    const durable: DurableEvent = {
        timeStamp: Date.now(),
        createdAt,
        updatedAt: createdAt,
        eventId,
        ...event
    };
    const store = getDurableEventStore(durable);
    await store.set(eventId, durable);
    return durable;
}