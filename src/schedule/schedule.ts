import {ScheduledEvent} from "./event";

export interface ScheduledFn {
    (event: ScheduledEvent): Promise<void> | void;
}

export interface ScheduledOptions {
    cron?: string;
    on?: string;
    handler: ScheduledFn;
}

export function cron(cron: string, handler: ScheduledFn) {
    return createScheduledFunction({
        cron,
        handler
    });
}

export function on(on: string, handler: ScheduledFn) {
    return createScheduledFunction({
        on,
        handler
    });
}

export const SCHEDULED_FUNCTIONS: ScheduledOptions[] = [];

export function createScheduledFunction(options: ScheduledOptions | ScheduledFn) {
    if (isScheduleFn(options)) {
        options = {
            handler: options
        };
    }
    SCHEDULED_FUNCTIONS.push(options);

    function isScheduleFn(options:  ScheduledOptions | ScheduledFn): options is ScheduledFn {
        return typeof options === "function";
    }
}