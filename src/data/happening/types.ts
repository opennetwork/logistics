import {Attendee, AttendeeData} from "../attendee";
import {Partner} from "../partner";
import {User} from "../user";
import {Organisation} from "../organisation";

export type HappeningType = (
    | "event"
    | "ticket"
    | "appointment"
    | "poll"
    | "payment"
    | "bill"
    | "activity"
    | "report"
    | "availability"
    | "intent"
    | "swap"
);

export interface HappeningTreeData extends HappeningEventData {
    type?: HappeningType | string;
    attendees?: (string | AttendeeData)[]
    children?: (string | HappeningTreeData)[]
}

export interface HappeningOptionData extends Record<string, unknown> {
    type?: HappeningType | string;
}

export interface HappeningEventData extends Record<string, unknown> {
    startAt?: string // Intended start time
    startedAt?: string // Actual start time
    endAt?: string // Intended end time
    endedAt?: string // Actual end time
    createdAt?: string
    type?: HappeningType | string;
    reference?: string;
    url?: string;
    title?: string;
    description?: string;
    options?: HappeningOptionData[];
}

export interface HappeningData extends HappeningEventData {
    type?: HappeningType | string;
    parent?: string
    children?: string[];
    attendees?: string[];
    timezone?: string;
    partnerId?: string;
    organisationId?: string;
    userId?: string;
}

export interface Happening extends HappeningData {
    type: HappeningType | string;
    happeningId: string;
}

export type PartialHappening = HappeningData & Partial<Happening>

export interface HappeningTreeNoKey extends HappeningEventData {
    type: string;
    parent?: HappeningTree;
    children: HappeningTree[];
    attendees: Attendee[];
    partnerId?: string;
    partner?: Partner;
    organisation?: Organisation;
    userId?: string;
}

export interface HappeningTree extends HappeningTreeNoKey {
    id: string;
    type: HappeningType | string;
}
