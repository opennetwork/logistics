import type {DurableEventSchedule} from "../data";
import type {DurablePeriodicSyncManager} from "./manager";
import {getConfig} from "../config";
import {getPeriodicSyncTagRegistration} from "./manager";
import {DAY_MS, HOUR_MS, MINUTE_MS, MONTH_MS} from "../data";

export interface PeriodicSyncSchedule {
    tag: string;
    schedule: DurableEventSchedule
}

export interface GetPeriodicSyncScheduleFn {
    (manager: DurablePeriodicSyncManager): Promise<PeriodicSyncSchedule[]>
}

export interface PeriodicSyncScheduleConfig {
    getPeriodicSyncSchedule?: GetPeriodicSyncScheduleFn;
}

export async function getPeriodicSyncSchedule(manager?: DurablePeriodicSyncManager) {
    if (!manager) {
        const { periodicSync } = await import("./manager");
        return getPeriodicSyncSchedule(periodicSync);
    }
    const config = getConfig();
    const fn: GetPeriodicSyncScheduleFn = config.getPeriodicSyncSchedule ?? getDefaultPeriodicSyncSchedule;
    return fn(manager);
}

function getCronExpressionFromInterval(interval: number) {
    if (interval < HOUR_MS) {
        return "0,15,30,45 * * * *";
    }
    if (interval <= DAY_MS) {
        return "0 0 * * *";
    }
    if (interval <= MONTH_MS) {
        return "0 0 1 * *";
    }
    return undefined;
}

export async function getDefaultDurableEventScheduleForPeriodicSyncTag(tag: string): Promise<DurableEventSchedule> {
    const { minInterval, createdAt } = await getPeriodicSyncTagRegistration(tag);
    if (!minInterval) {
        return {
            immediate: true
        };
    }
    if (minInterval <= MONTH_MS) {
        const cron = getCronExpressionFromInterval(minInterval);
        if (cron) {
            return {
                cron
            }
        }
    }
    const createdAtTime = new Date(createdAt).getTime();
    const timeSince = Date.now() - createdAtTime;
    const intervalsSince = Math.floor(timeSince / minInterval);
    const nextInterval = intervalsSince + 1;
    const nextIntervalTime = createdAtTime + (nextInterval * minInterval);
    const nextIntervalAt = new Date(nextIntervalTime).toISOString();
    return {
        after: nextIntervalAt
    };
}

export async function getDefaultPeriodicSyncSchedule(manager: DurablePeriodicSyncManager): Promise<PeriodicSyncSchedule[]> {
    const tags = await manager.getTags();
    return await Promise.all(
        tags.map(
            async (tag): Promise<PeriodicSyncSchedule> => {
                return {
                    tag,
                    schedule: await getDefaultDurableEventScheduleForPeriodicSyncTag(tag)
                }
            }
        )
    )
}