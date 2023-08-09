import {v4} from "uuid";
import {getHappeningStore, Happening} from "../data";
import {ok} from "../is";

export interface ScheduledEventSchedule {

}

export interface ScheduledEvent extends Record<string, unknown> {
    type: string;
    timeStamp?: number;
    key?: string;
    schedule?: ScheduledEventSchedule
}

export async function dispatchEventSchedule(event: ScheduledEvent) {
    const createdAt = new Date().toISOString();
    const key = v4();
    const scheduled: Happening = {
        timeStamp: Date.now(),
        createdAt,
        updatedAt: createdAt,
        happeningId: key,
        key,
        ...event
    };
    const store = getScheduledEventStore(scheduled);
    await store.set(key, scheduled);
}

function getScheduledEventStore(event: ScheduledEvent) {
    return getHappeningStore(`event:schedule:${event.type}`, {
        counter: true // free event counter
    })
}

export function listEventSchedule(event: ScheduledEvent) {
    const store = getScheduledEventStore(event);
    return store.values();
}

export function getEventSchedule(event: ScheduledEvent) {
    if (!event.key) return undefined;
    const store = getScheduledEventStore(event);
    return store.get(event.key);
}

export function deleteEventSchedule(event: ScheduledEvent) {
    const store = getScheduledEventStore(event);
    if (!event.key) return undefined;
    return store.delete(event.key);
}