import {Expiring} from "../expiring";

export interface DurableEventSchedule {
    timezone?: string;
    // For cases where we want an event triggered after a specific time
    after?: string;
    // For cases where we want an event triggered before a specific time
    before?: string;
    immediate?: boolean;
    cron?: string;
}

export interface UnknownEvent {
    type: unknown;
}

export interface DurableEventTypeData extends UnknownEvent {
    type: string;
}

export interface DurableEventData extends Record<string, unknown>, DurableEventTypeData, Expiring {
    timeStamp?: number;
    durableEventId?: string;
    schedule?: DurableEventSchedule;
    retain?: boolean;
    virtual?: boolean;
}

export interface DurableEvent extends DurableEventData {
    durableEventId: string
}