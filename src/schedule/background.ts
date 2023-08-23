import {SCHEDULED_FUNCTIONS, ScheduledOptions} from "./schedule";

import {isNumberString} from "../is";
import Bottleneck from "bottleneck";
import {DurableEvent, DurableEventData, getDurableEvent, listDurableEvents, deleteDurableEvent} from "../data";

export interface BackgroundScheduleOptions {
    cron?: string;
    event?: DurableEventData;
}

export async function backgroundSchedule(options: BackgroundScheduleOptions) {
    const matching = getMatchingScheduled();

    const event = getEventOption();

    await limitedHandlers(
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
            await limitedHandlers(
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

    function getMatchingScheduled() {
        if (options.event) {
            return getEventScheduled(options.event.type)
        }
        let matching = getDefaultScheduled();
        if (options.cron) {
            matching = matching.concat(
                getCronScheduled(options.cron)
            );
        }
        return matching;
    }

    function getEventScheduled(event: string) {
        return SCHEDULED_FUNCTIONS.filter(value => value.on === event);
    }

    function getCronScheduled(cron: string) {
        return SCHEDULED_FUNCTIONS.filter(value => value.cron === cron);
    }

    function getDefaultScheduled() {
        return SCHEDULED_FUNCTIONS.filter(value => !(value.on || value.cron))
    }
}

async function limitedHandlers(fns: (() => Promise<void>)[]) {
    const {
        SCHEDULE_SERIAL,
        SCHEDULE_BOTTLENECK,
        SCHEDULE_BOTTLENECK_MAX_CONCURRENT,
        SCHEDULE_BOTTLENECK_MIN_TIME,
        SCHEDULE_BOTTLENECK_RESERVOIR,
        SCHEDULE_BOTTLENECK_RESERVOIR_INCREASE_AMOUNT,
        SCHEDULE_BOTTLENECK_RESERVOIR_INCREASE_INTERVAL,
        SCHEDULE_BOTTLENECK_RESERVOIR_INCREASE_MAXIMUM,
    } = process.env;

    if (!fns.length) {
        return;
    }

    if (SCHEDULE_SERIAL) {
        for (const fn of fns) {
            await fn();
        }
        return;
    }

    if (!SCHEDULE_BOTTLENECK) {
        return await Promise.all(
            fns.map(fn => fn())
        );
    }

    const maxConcurrent = isNumberString(SCHEDULE_BOTTLENECK_MAX_CONCURRENT) ?
        +SCHEDULE_BOTTLENECK_MAX_CONCURRENT : 1;
    const minTime = isNumberString(SCHEDULE_BOTTLENECK_MIN_TIME) ?
        +SCHEDULE_BOTTLENECK_MIN_TIME : 1000;
    const reservoir = isNumberString(SCHEDULE_BOTTLENECK_RESERVOIR) ?
        +SCHEDULE_BOTTLENECK_RESERVOIR : undefined;
    const reservoirIncreaseAmount = isNumberString(SCHEDULE_BOTTLENECK_RESERVOIR_INCREASE_AMOUNT) ?
        +SCHEDULE_BOTTLENECK_RESERVOIR_INCREASE_AMOUNT : undefined;
    const reservoirIncreaseInterval = isNumberString(SCHEDULE_BOTTLENECK_RESERVOIR_INCREASE_INTERVAL) ?
        +SCHEDULE_BOTTLENECK_RESERVOIR_INCREASE_INTERVAL : undefined;
    const reservoirIncreaseMaximum = isNumberString(SCHEDULE_BOTTLENECK_RESERVOIR_INCREASE_MAXIMUM) ?
        +SCHEDULE_BOTTLENECK_RESERVOIR_INCREASE_MAXIMUM : undefined;

    const bottleneck = new Bottleneck({
        maxConcurrent,
        minTime,
        reservoir,
        reservoirIncreaseAmount,
        reservoirIncreaseInterval,
        reservoirIncreaseMaximum
    });

    await Promise.all(
        fns.map(fn => bottleneck.schedule(() => fn()))
    );
}