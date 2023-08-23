import {addDurableEvent, DurableEventData} from "../data";

const {
    DURABLE_EVENTS_IMMEDIATE
} = process.env;

export async function dispatchEvent(event: DurableEventData) {

    const durable = await addDurableEvent(event);

    if (DURABLE_EVENTS_IMMEDIATE || durable.schedule?.immediate) {
        const { background } = await import("../background");
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