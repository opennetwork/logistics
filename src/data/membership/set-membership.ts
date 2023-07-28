import {getMembershipStore} from "./store";
import {Membership, PartialMembership} from "./types";
import {createHash} from "crypto";
import {getMembership} from "./get-membership";
import {entries} from "../entries";
import {getMaybePartner, getMaybeUser, isUnauthenticated} from "../../authentication";
import {v4} from "uuid";
import {ok} from "../../is";

const {
    ATTENDEE_DISABLE_PARTITION,
    ATTENDEE_PARTITION,
} = process.env;

function getPartitionPrefix() {
    if (ATTENDEE_PARTITION) {
        return ATTENDEE_PARTITION;
    }
    const partner = getMaybePartner();
    // If authenticated, membership information will be retained across happenings
    if (partner?.partnerId) {
        return `partner:${partner.partnerId}:`
    }
    const user = getMaybeUser();
    if (user?.userId) {
        // Users can create their own memberships
        return `user:${user.userId}:`
    }
    ok(isUnauthenticated(), "Expected user or partner if not anonymous");
    // Random every time if no authentication :)
    // If creating a happening tree, each new tree request will have a new set of memberships
    return v4();
}

/**
 * Allows partial update of an membership, retains existing properties
 * @param data
 */
export async function setMembership(data: PartialMembership) {
    const store = getMembershipStore();
    let reference = data.reference,
        membershipId = data.membershipId;
    // Allows for either reference or membershipId to be provided as a reference string
    if (!membershipId) {
        const existing = await getMembership(reference);
        if (existing) {
            reference = existing.reference;
            membershipId = existing.membershipId;
        }
    }
    if (!membershipId) {
        membershipId = createMembershipId();
    }
    const existing = await getMembership(membershipId);
    if (existing && !isDifferent(existing)) {
        return existing;
    }
    const createdAt = data.createdAt || new Date().toISOString();
    const createdByPartnerId = getMaybePartner()?.partnerId;
    const createdByUserId = getMaybeUser()?.userId;
    const membership: Membership = {
        ...existing,
        ...data,
        reference,
        membershipId,
        createdAt,
        createdByPartnerId,
        createdByUserId
    };
    await store.set(membershipId, membership);
    return membership;

    function isDifferent(value: Membership) {
        return !!entries(data).find(entry => value[entry[0]] !== entry[1]);
    }

    function createMembershipId() {
        if (ATTENDEE_DISABLE_PARTITION) {
            return data.reference;
        }
        const hash = createHash("sha512");
        hash.update(getPartitionPrefix());
        hash.update(data.reference);
        return hash.digest().toString("hex");
    }
}

export async function addMembership(data: PartialMembership) {
    return setMembership(data);
}