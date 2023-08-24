
export interface DurableEventSchedule {
    // For cases where we want an event triggered after a specific time
    after?: string | number;
    // For cases where we want an event triggered before a specific time
    before?: string | number;
    immediate?: boolean;
}

export interface UnknownEvent {
    type: unknown;
}

export interface DurableEventTypeData extends UnknownEvent {
    type: string;
}

export interface DurableEventData extends Record<string, unknown>, DurableEventTypeData {
    timeStamp?: number;
    eventId?: string;
    schedule?: DurableEventSchedule;
    retain?: boolean;
}

export interface DurableEvent extends DurableEventData {
    eventId: string;
}