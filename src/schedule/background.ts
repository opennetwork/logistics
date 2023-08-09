import { scheduled } from "./schedule";
import {ScheduleEvent} from "./event";


export interface BackgroundScheduleOptions {
    cron?: string;
    event?: ScheduleEvent;
    serial?: boolean;
    prior?: Record<string, unknown>
}

export async function backgroundSchedule(options: BackgroundScheduleOptions) {
    const matching = getMatchingScheduled();
    const event = getEvent();

    const meta = {
        ...options.prior
    };

    if (options.serial) {
        for (const { handler } of matching) {
            await handler(event);
        }
    } else if (matching.length) {
        await Promise.all(
            matching.map(async ({ handler }) => handler(event))
        );
    }

    return meta;

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
        return scheduled.filter(value => value.on === event);
    }

    function getCronScheduled(cron: string) {
        return scheduled.filter(value => value.cron === cron);
    }

    function getDefaultScheduled() {
        return scheduled.filter(value => !(value.on || value.cron))
    }

}