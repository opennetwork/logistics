import {virtual} from "../virtual/virtual";
import {DURABLE_EVENTS_INDEX_SCHEDULE, getConfig, KEY_VALUE_STORE_INDEX, DURABLE_EVENTS_IMMEDIATE} from "../../config";
import {DurableEventData, getDurableEventStore, listDurableEventTypes} from "../../data";

export interface EventScheduleConfig {
    dispatchSchedules?(): Promise<void>
    dispatchSchedule?(event: DurableEventData): Promise<void>
}

export function isDurableEventDefaultSchedule() {
    return !!DURABLE_EVENTS_IMMEDIATE
}

export async function dispatchDefaultSchedule(event: DurableEventData) {
    const {dispatchScheduledDurableEvents} = await import("./dispatch-scheduled");
    const {dispatchQStash, isQStash} = await import("./qstash");
    if (event.schedule.immediate) {
        await dispatchScheduledDurableEvents({
            event
        });
    } else if (isQStash()) {
        await dispatchQStash(event);
    } else if (DURABLE_EVENTS_IMMEDIATE) {
        await dispatchScheduledDurableEvents({
            event
        });
    }
}

export async function dispatchSchedule(event: DurableEventData) {
    const config = getConfig();
    const fn = config.dispatchSchedule ?? dispatchDefaultSchedule;
    return fn(event);
}

function isDurableEventIndexScheduleEnabled() {
    return DURABLE_EVENTS_INDEX_SCHEDULE && KEY_VALUE_STORE_INDEX
}

/**
 * Note that this is only usable if KEY_VALUE_STORE_INDEX is enabled
 */
async function dispatchDefaultIndexSchedules() {
    for (const type of await listDurableEventTypes()) {
        for await (const event of getDurableEventStore({
            type
        })) {
            if (!event.schedule) continue;
            await dispatchSchedule(event);
        }
    }
}

async function dispatchDefaultSchedules() {
    if (isDurableEventIndexScheduleEnabled()) {
        await dispatchDefaultIndexSchedules();
    }
}

export async function dispatchSchedules() {
    const config = getConfig();
    const fn = config.dispatchSchedules ?? dispatchDefaultSchedules;
    return fn();
}

export const removeScheduleVirtualFunction = virtual(dispatchSchedules);