import {ScheduledEventData} from "../data";

export interface ScheduledFn {
    (event: ScheduledEventData): Promise<void> | void;
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

export function createScheduledFunction(optionsOrFn: ScheduledOptions | ScheduledFn) {
    let options: ScheduledOptions;
    if (isScheduleFn(optionsOrFn)) {
        options = {
            handler: optionsOrFn
        };
    } else {
        options = optionsOrFn;
    }
    SCHEDULED_FUNCTIONS.push(options);
    return () => {
        const index = SCHEDULED_FUNCTIONS.indexOf(options);
        if (index > -1) {
            SCHEDULED_FUNCTIONS.splice(index, 1);
        }
    }

    function isScheduleFn(options:  ScheduledOptions | ScheduledFn): options is ScheduledFn {
        return typeof options === "function";
    }
}