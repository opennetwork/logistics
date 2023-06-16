import {AuthenticationState, InviteeData} from "./types";
import {v4} from "uuid";
import {addAuthenticationState} from "./add-authentication-state";
import {hash} from "bcrypt";
import {getConfig} from "../../config";
import {isNumberString} from "../../is";
import {getOrigin} from "../../listen/config";

const {
    INVITEE_BCRYPT_SALT,
    INVITEE_BCRYPT_ROUNDS,
    INVITEE_URL
} = process.env;

const DEFAULT_INVITEE_URL = "/invites/accept"
const DEFAULT_ROUNDS = 13;

function getSaltOrRounds() {
    if (isNumberString(INVITEE_BCRYPT_ROUNDS)) {
        return +INVITEE_BCRYPT_ROUNDS;
    } else if (INVITEE_BCRYPT_SALT) {
        return INVITEE_BCRYPT_SALT;
    }
    return DEFAULT_ROUNDS;
}

export async function addInvitee(data: InviteeData): Promise<AuthenticationState & { url: string }> {

    const inviteSecret = v4();

    const inviteSecretHashed = await hash(inviteSecret, getSaltOrRounds());

    const intendedUrl = new URL(INVITEE_URL || DEFAULT_INVITEE_URL, getOrigin());

    const state = await addAuthenticationState({
        ...data,
        type: "invitee",
        inviteSecretHashed,
        inviteUrl: intendedUrl.toString()
    });

    const inviteUrl = new URL(intendedUrl);

    // Set the token AFTER storing the url in the database
    inviteUrl.searchParams.set("token", inviteSecret);

    return {
        ...state,
        url: inviteUrl.toString()
    };
}