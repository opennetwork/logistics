import {getScheduledFunctions, ScheduledFunctionOptions, ScheduledOptions} from "./schedule";

import {DurableEvent, DurableEventData, getDurableEvent, listDurableEvents, deleteDurableEvent} from "../data";
import {limited} from "../limited";

export interface BackgroundScheduleOptions extends ScheduledFunctionOptions {

}

export async function dispatchScheduledDurableEvents(options: BackgroundScheduleOptions) {

    const event = getEventOption();

    const matching = getScheduledFunctions(options);

    await limited(
        matching.map(options => () => dispatchEvent(event, options))
    );

    async function dispatchEvent(event: DurableEventData, { handler }: ScheduledOptions) {
        if (event.eventId) {
            const schedule = await getDurableEvent(event);
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

        async function dispatchScheduledEvent(event: DurableEvent) {
            await dispatchEventToHandler(event);
            await deleteDurableEvent(event);
        }

        async function dispatchEventToHandler(event: DurableEventData) {
            await handler(event);
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