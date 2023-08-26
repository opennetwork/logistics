import {addDurableEvent, deleteDurableEvent, DurableEventData} from "../../data";
import {deleteDispatchQStash, dispatchQStash, isQStash} from "./qstash";

const {
    DURABLE_EVENTS_IMMEDIATE
} = process.env;

export async function dispatchEvent(event: DurableEventData) {

    const durable = event.eventId ? event : await addDurableEvent(event);

    if (isQStash()) {
        await dispatchQStash(durable);
    } else if (DURABLE_EVENTS_IMMEDIATE || durable.schedule?.immediate) {
        const { background } = await import("../../background");
        // Note that background is locking, so if an event is already running
        // with the same type, it will wait until all prior immediate events are
        // completed
        await background({
            query: {
                event: durable.type,
                eventId: durable.eventId
            },
            quiet: true
        });
    }

    return durable;
}

export async function deleteDispatchEvent(event: DurableEventData) {
    if (isQStash()) {
        await deleteDispatchQStash(event);
    }
    await deleteDurableEvent(event);
}