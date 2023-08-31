import {
    getDispatcherFunction, getScheduledCorrelation,
    getScheduledFunctionCorrelation,
    getScheduledFunctions,
    ScheduledFunctionOptions,
    ScheduledOptions
} from "./schedule";

import {DurableEventData, getDurableEvent, listDurableEvents, deleteDurableEvent, lock} from "../../data";
import {limited} from "../../limited";
import {ok} from "../../is";

export interface BackgroundScheduleOptions extends ScheduledFunctionOptions {

}

export async function dispatchScheduledDurableEvents(options: BackgroundScheduleOptions) {

    const event = getEventOption();

    const matching = getScheduledFunctions(options);
    const dispatcher = getDispatcherFunction(options);
    const correlation = getScheduledCorrelation(options);

    const done = await lock(`${correlation}:limited => dispatchEvent`);

    try {
        await limited(
            matching.map(options => () => dispatchEvent(event, options))
        );
    } finally {
        await done();
    }

    async function dispatchEvent(event: DurableEventData, { handler }: ScheduledOptions) {
        if (event.eventId) {
            const schedule = (await getDurableEvent(event)) ?? (event.virtual ? event : undefined);
            if (!isMatchingSchedule(schedule)) {
                return;
            }
            await dispatchScheduledEvent(schedule);
        } else if (event.type !== "background") {
            const schedules = await listDurableEvents(event);
            await limited(
                schedules
                    .filter(isMatchingSchedule)
                    .map(schedule => () => dispatchScheduledEvent(schedule))
            );
        } else {
            await dispatchEventToHandler(event);
        }

        async function dispatchScheduledEvent(event: DurableEventData) {
            ok(event.eventId, "Expected dispatching event to have an id");
            const done = await lock(`dispatchEvent:${event.type}:${event.eventId}`);
            // TODO detect if this event tries to dispatch again
            try {
                await dispatchEventToHandler(event);
                if (!event.retain) {
                    await deleteDurableEvent(event);
                }
            } finally {
                await done();
            }
        }

        async function dispatchEventToHandler(event: DurableEventData) {
            if (dispatcher) {
                // This allows a dispatcher to create an event that has deeper functionality
                await dispatcher.handler(event, async (dispatching) => {
                    // Hide the implementation function inside an anonymous function
                    return handler(dispatching);
                });
            } else {
                await handler(event);
            }
        }
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

        return { type: "background" }
    }
}