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
    return schedule({
        cron,
        handler
    })
}

export function on(on: string, handler: ScheduleFn) {
    return schedule({
        on,
        handler
    });
}

export const scheduled: ScheduleOptions[] = [];

export function schedule(options: ScheduleOptions | ScheduleFn) {
    if (isScheduleFn(options)) {
        options = {
            handler: options
        };
    }
    scheduled.push(options);

    function isScheduleFn(options:  ScheduleOptions | ScheduleFn): options is ScheduleFn {
        return typeof options === "function";
    }
}