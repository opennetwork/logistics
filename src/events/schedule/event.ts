import {addDurableEvent, deleteDurableEvent, DurableEventData, getDurableEvent} from "../../data";
import {getConfig} from "../../config";

export interface DispatchEventConfig {
    dispatchEvent?(event: DurableEventData): void | unknown | Promise<void | unknown>
}

const {
    DURABLE_EVENTS_IMMEDIATE
} = process.env;

async function hasDurableEvent(event: DurableEventData) {
    const existing = await getDurableEvent(event);
    return !!existing;
}

export async function dispatchEvent(event: DurableEventData) {

    let durable = event;

    if (!event.virtual) {
        if (!event.durableEventId || !(await hasDurableEvent(event))) {
            durable = await addDurableEvent(event);
        }
    }

    const config = getConfig();
    const {dispatchQStash, isQStash} = await import("./qstash");
    if (config.dispatchEvent) {
        await config.dispatchEvent(durable);
    } else if (event.virtual) {
        const {dispatchScheduledDurableEvents} = await import("./dispatch-scheduled");
        await dispatchScheduledDurableEvents({
            event
        });
    } else if (isQStash()) {
        await dispatchQStash(durable);
    } else if (DURABLE_EVENTS_IMMEDIATE || durable.schedule?.immediate) {
        const { background } = await import("../../background");
        // Note that background is locking, so if an event is already running
        // with the same type, it will wait until all prior immediate events are
        // completed
        await background({
            query: {
                event: durable.type,
                eventId: durable.durableEventId
            },
            quiet: true
        });
    }

    return durable;
}

export async function deleteDispatchEvent(event: DurableEventData) {
    const {deleteDispatchQStash, isQStash} = await import("./qstash.v1");
    if (isQStash()) {
        await deleteDispatchQStash(event);
    }
    await deleteDurableEvent(event);
}