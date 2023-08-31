import {DurableEventData} from "../../data";
import {getConfig} from "../../config";

export interface ScheduledFn {
    (event: DurableEventData): Promise<void> | void;
}

export interface DispatcherFn extends ScheduledFn {
    (event: DurableEventData, dispatch: (event: DurableEventData) => Promise<void>): Promise<void> | void;
}

export type ScheduledFunctionsRecord<F extends ScheduledFn = ScheduledFn> = Record<string, F>;

type ScheduledFunctionsConfig<F extends ScheduledFn = ScheduledFn> = ScheduledOptions<F>[] | ScheduledFunctionsRecord<F>;

export interface ScheduledOptions<F extends ScheduledFn = ScheduledFn> {
    cron?: string;
    on?: string;
    handler: F;
}

export interface ScheduledConfig {
    functions?: ScheduledFunctionsConfig;
    dispatchers?: ScheduledFunctionsConfig<DispatcherFn>;
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

export function dispatcher(on: string, handler: DispatcherFn) {
    return createDispatcherFunction({
        on,
        handler
    });
}

export const SCHEDULED_FUNCTIONS: ScheduledOptions[] = [];
export const DISPATCHER_FUNCTIONS = new Map<string, ScheduledOptions<DispatcherFn>>();

export function createScheduledFunction(optionsOrFn: ScheduledOptions | ScheduledFn) {
    const options = parseScheduleOptions(optionsOrFn);
    SCHEDULED_FUNCTIONS.push(options);
    return createRemoveFn(SCHEDULED_FUNCTIONS, options);
}

export function createDispatcherFunction(optionsOrFn: ScheduledOptions<DispatcherFn> | DispatcherFn) {
    const options = parseScheduleOptions(optionsOrFn);
    const id = getScheduledFunctionCorrelation(options);
    DISPATCHER_FUNCTIONS.set(id, options);
    return () => {
        if (DISPATCHER_FUNCTIONS.get(id) === options) {
            DISPATCHER_FUNCTIONS.delete(id);
        }
    }
}

export function getScheduledFunctionCorrelation(options: ScheduledOptions) {
    if (options.on) {
        return `event:${options.on}`;
    }
    if (options.cron) {
        return `cron:${options.cron}`;
    }
    return "default";
}

function createRemoveFn<T>(array: T[], value: T) {
    return () => {
        const index = array.indexOf(value);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
}

function parseScheduleOptions<F extends ScheduledFn>(optionsOrFn: ScheduledOptions<F> | F): ScheduledOptions<F> {
    if (isScheduleFn(optionsOrFn)) {
        return {
            handler: optionsOrFn
        };
    } else {
        return optionsOrFn;
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
    const config = getConfig();
    return filterScheduledFunctions(config.functions, SCHEDULED_FUNCTIONS, options);
}

export function getDispatcherFunction(options: ScheduledFunctionOptions): ScheduledOptions<DispatcherFn> | undefined {
    const config = getConfig();
    const configMatch = getMatchingDispatcher(
        filterScheduledFunctions(config.dispatchers, [], options),
        "config"
    );
    if (configMatch) {
        return configMatch;
    }
    return getMatchingDispatcher(
        filterScheduledFunctions([], [...DISPATCHER_FUNCTIONS.values()], options),
        "internal"
    );

    function getMatchingDispatcher(dispatchers: ScheduledOptions<DispatcherFn>[], name: string) {
        if (!dispatchers.length) {
            return undefined;
        }
        if (dispatchers.length === 1) {
            return dispatchers[0];
        }
        const match = dispatchers.filter(dispatcher => {
            return (
                (options.event && dispatcher.on === options.event.type) ||
                (options.cron && dispatcher.cron === options.cron)
            );
        });
        if (match.length === 1) {
            return match[0];
        }
        throw new Error(`Unexpected dispatchers for ${name} state`);
    }
}

function filterScheduledFunctions<F extends ScheduledFn>(config: ScheduledFunctionsConfig<F> | undefined, fns: ScheduledOptions<F>[], options: ScheduledFunctionOptions) {
    if (options.event) {
        return filterEventScheduled(config, fns, options.event.type)
    }
    let matching = filterDefaultScheduled(config, fns);
    if (options.cron) {
        matching = matching.concat(
            filterCronScheduled(config, fns, options.cron)
        );
    }
    return matching;
}

function filterEventScheduled<F extends ScheduledFn>(config: ScheduledFunctionsConfig<F> | undefined, fns: ScheduledOptions<F>[], event: string) {
    return filteredScheduledFunctionsWithFn(config, fns, value => value.on === event);
}

function filterCronScheduled<F extends ScheduledFn>(config: ScheduledFunctionsConfig<F> | undefined, fns: ScheduledOptions<F>[], cron: string) {
    return filteredScheduledFunctionsWithFn(config, fns, value => value.cron === cron);
}

function filterDefaultScheduled<F extends ScheduledFn>(config: ScheduledFunctionsConfig<F> | undefined, fns: ScheduledOptions<F>[]) {
    return filteredScheduledFunctionsWithFn(config, fns, value => !(value.on || value.cron), true)
}

function filteredScheduledFunctionsWithFn<F extends ScheduledFn>(config: ScheduledFunctionsConfig<F> | undefined, fns: ScheduledOptions<F>[], filter: (options: ScheduledOptions) => boolean, isDefault?: boolean): ScheduledOptions<F>[] {
    const internal = fns.filter(filter);
    if (!config) return internal;
    if (Array.isArray(config)) {
        return internal.concat(config.filter(filter));
    }
    if (isDefault) {
        return internal;
    }
    const results: ScheduledOptions<F>[] = internal;
    for (const [on, handler] of Object.entries(config)) {
        const options: ScheduledOptions<F> = {
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