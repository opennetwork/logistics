import {ScheduleEvent} from "./event";

export interface ScheduleFn {
    (event: ScheduleEvent): Promise<void> | void;
}

export interface ScheduleOptions {
    cron?: string;
    on?: string;
    handler: ScheduleFn;
}

export function cron(cron: string, handler: ScheduleFn) {
    return createScheduledFunction({
        cron,
        handler
    });
}

export function on(on: string, handler: ScheduleFn) {
    return createScheduledFunction({
        on,
        handler
    });
}

export const SCHEDULED_FUNCTIONS: ScheduleOptions[] = [];

export function createScheduledFunction(options: ScheduleOptions | ScheduleFn) {
    if (isScheduleFn(options)) {
        options = {
            handler: options
        };
    }
    SCHEDULED_FUNCTIONS.push(options);

    function isScheduleFn(options:  ScheduleOptions | ScheduleFn): options is ScheduleFn {
        return typeof options === "function";
    }
}