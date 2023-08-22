
export interface ScheduledEventSchedule {
    // For cases where we want an event triggered after a specific time
    after?: string | number;
    // For cases where we want an event triggered before a specific time
    before?: string | number;
}

export interface ScheduledEventTypeData {
    type: string;
}

export interface ScheduledEventData extends Record<string, unknown>, ScheduledEventTypeData {
    timeStamp?: number;
    eventId?: string;
    schedule?: ScheduledEventSchedule
}



export interface ScheduledEvent extends ScheduledEventData {
    eventId: string;
}