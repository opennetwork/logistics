import {DurableEventData} from "../data";
import {getConfig} from "../config";

export interface ScheduledFn {
    (event: DurableEventData): Promise<void> | void;
}

export type ScheduledFunctionsRecord = Record<string, ScheduledFn>;

export interface ScheduledConfig {
    functions?: ScheduledOptions[] | ScheduledFunctionsRecord;
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

export interface ScheduledFunctionOptions {
    cron?: string;
    event?: DurableEventData;
}

export function getScheduledFunctions(options: ScheduledFunctionOptions): ScheduledOptions[] {
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
    return getFilteredScheduledFunctions(value => value.on === event);
}

function getCronScheduled(cron: string) {
    return getFilteredScheduledFunctions(value => value.cron === cron);
}

function getDefaultScheduled() {
    return getFilteredScheduledFunctions(value => !(value.on || value.cron), true)
}

function getFilteredScheduledFunctions(filter: (options: ScheduledOptions) => boolean, isDefault?: boolean) {
    const { functions } = getConfig();
    const internal = SCHEDULED_FUNCTIONS.filter(filter);
    if (!functions) return internal;
    if (Array.isArray(functions)) {
        return internal.concat(functions.filter(filter));
    }
    if (isDefault) {
        return internal;
    }
    const results = internal;
    for (const [on, handler] of Object.entries(functions)) {
        const options: ScheduledOptions = {
            on,
            cron: on,
            handler,
        };
        if (filter(options)) {
            results.push(options);
        }
    }
    return results;
}