export interface MembershipData extends Record<string, unknown> {
    reference: string;
    name?: string;
    email?: string;
}

export interface Membership extends MembershipData {
    membershipId: string;
    createdAt: string;
    createdByPartnerId?: string;
    createdByUserId?: string;
}

export type PartialMembership = MembershipData & Partial<Membership>;