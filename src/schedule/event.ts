
export interface ScheduleEvent extends Record<string, unknown> {
    type: string;
    timeStamp?: number;
    key?: string;
}