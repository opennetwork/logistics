import { SCHEDULED_FUNCTIONS } from "./schedule";
import {ScheduleEvent} from "./event";
import {isNumberString} from "../is";
import Bottleneck from "bottleneck";

export interface BackgroundScheduleOptions {
    cron?: string;
    event?: ScheduleEvent;
}


export async function backgroundSchedule(options: BackgroundScheduleOptions) {
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

    const matching = getMatchingScheduled();
    const event = getEvent();

    if (SCHEDULE_SERIAL) {
        for (const { handler } of matching) {
            await handler(event);
        }
    } else if (matching.length) {
        if (SCHEDULE_BOTTLENECK) {
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
                matching.map(({ handler }) => bottleneck.schedule(async () => handler(event)))
            );
        } else {
            await Promise.all(
                matching.map(async ({ handler }) => handler(event))
            );
        }
    }

    function getEvent() {
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