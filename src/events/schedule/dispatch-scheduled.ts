import {
    getDispatcherFunction, getScheduledCorrelation,
    getScheduledFunctionCorrelation,
    getScheduledFunctions,
    ScheduledFunctionOptions,
    ScheduledOptions
} from "./schedule";

import {DurableEventData, getDurableEvent, listDurableEvents, deleteDurableEvent, lock} from "../../data";
import {limited} from "../../limited";
import {isSignalled} from "../../is";

export interface BackgroundScheduleOptions extends ScheduledFunctionOptions {

}

function notAborted(signal?: AbortSignal) {
    if (signal?.aborted) {
        throw new Error("Aborted");
    }
}

export async function dispatchScheduledDurableEvents(options: BackgroundScheduleOptions) {

    const event = getEventOption();

    const matching = getScheduledFunctions(options);
    const dispatcher = getDispatcherFunction(options);
    const correlation = getScheduledCorrelation(options);

    const done = await lock(`${correlation}:limited => dispatchEvent`);

    const controller = new AbortController();
    const { signal } = controller;

    try {
        await dispatchScheduledEvent(event);
    } catch (error) {
        if (!signal.aborted) {
            controller.abort(error);
        }
    } finally {
        if (!signal.aborted) {
            controller.abort("dispatchScheduledEvent finalised");
        }
        await done();
    }

    async function dispatchScheduledEvent(event: DurableEventData) {
        if (event.eventId) {
            const schedule = (await getDurableEvent(event)) ?? (event.virtual ? event : undefined);
            if (!isMatchingSchedule(schedule)) {
                return;
            }
            await dispatchEvent(schedule);
        } else if (event.type === "background") {
            await dispatchEvent(event);
        } else {
            const schedules = await listDurableEvents(event);
            await limited(
                schedules
                    .filter(isMatchingSchedule)
                    .map(schedule => () => dispatchEvent(schedule))
            );
        }
    }

    async function dispatchEvent(event: DurableEventData) {
        const done = await lock(`dispatchEvent:${event.type}:${event.eventId || "no-event-id"}`);
        // TODO detect if this event tries to dispatch again
        try {
            await dispatchEventToHandlers(event);
            if (!event.retain) {
                await deleteDurableEvent(event);
            }
        } finally {
            await done();
        }
    }

    async function dispatchEventToHandlers(event: DurableEventData) {
        const signalledEvent = {
            ...event,
            signal
        }
        if (dispatcher) {
            // This allows a dispatcher to create an event that has deeper functionality
            await dispatcher.handler(signalledEvent, dispatchLimited);
        } else {
            await dispatchLimited(signalledEvent);
        }

        async function dispatchLimited(event: DurableEventData) {
            await limited(
                matching.map(options => () => dispatchEventToHandler(event, options))
            )
        }
    }

    async function dispatchEventToHandler(event: DurableEventData, { handler }: ScheduledOptions) {
        notAborted(signal);
        if (isSignalled(event) && event.signal !== signal) {
            notAborted(event.signal);
        }
        await handler(event);
    }

    function isMatchingSchedule(event?: DurableEventData) {
        if (!event) return false;
        if (!event.schedule) return true;
        const { before, after } = event.schedule;
        if (before) {
            const date = new Date(before);
            // If the current date is larger, we are no longer before
            if (Date.now() > date.getTime()) {
                return false;
            }
        }
        if (after) {
            const date = new Date(after);
            // If the current date is smaller, we are not yet after
            if (Date.now() < date.getTime()) {
                return false;
            }
        }
        return true;
    }

    function getEventOption(): DurableEventData {
        if (options.event) {
            return options.event;
        }

        return { type: "background", virtual: true, retain: true }
    }
}