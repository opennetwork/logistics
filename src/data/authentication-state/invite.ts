import {AuthenticationState, AuthenticationStateData, InviteeData, UntypedAuthenticationStateData} from "./types";
import {v4} from "uuid";
import {addAuthenticationState} from "./add-authentication-state";
import {compare, hash} from "bcrypt";
import {getConfig} from "../../config";
import {isLike, isNumberString} from "../../is";
import {getOrigin} from "../../listen/config";
import {getAuthenticationState} from "./get-authentication-state";

const {
    INVITEE_BCRYPT_SALT,
    INVITEE_BCRYPT_ROUNDS,
    INVITEE_URL
} = process.env;

const DEFAULT_INVITEE_URL = "/invite/accept"
const DEFAULT_ROUNDS = 13;

function getSaltOrRounds() {
    if (isNumberString(INVITEE_BCRYPT_ROUNDS)) {
        return +INVITEE_BCRYPT_ROUNDS;
    } else if (INVITEE_BCRYPT_SALT) {
        return INVITEE_BCRYPT_SALT;
    }
    return DEFAULT_ROUNDS;
}

export function getInviteURL() {
    return new URL(INVITEE_URL || DEFAULT_INVITEE_URL, getOrigin());
}

export interface InviteeStateData {
    inviteSecretHashed: string;
    inviteUrl: string;
}

export interface InviteeState extends AuthenticationState, InviteeStateData {

}

export async function addInviteeState(data: UntypedAuthenticationStateData): Promise<InviteeState> {
    const inviteSecret = v4();
    const inviteSecretHashed = await hash(inviteSecret, getSaltOrRounds());
    const intendedUrl = getInviteURL();
    const inviteeState: InviteeStateData = {
        inviteSecretHashed,
        inviteUrl: intendedUrl.toString()
    }
    const state = await addAuthenticationState({
        ...data,
        type: "invitee",
        ...inviteeState
    });
    const inviteUrl = new URL(intendedUrl);
    // Set the token AFTER storing the target url in the database
    inviteUrl.searchParams.set("token", inviteSecret);
    inviteUrl.searchParams.set("state", state.stateKey);
    return {
        ...state,
        ...inviteeState,
        inviteUrl: inviteUrl.toString()
    };
}

export interface GetInviteeOptions {
    stateId: string;
    token: string;
}

export async function getInviteeState({ stateId, token }: GetInviteeOptions): Promise<InviteeState | undefined> {
    const state = await getAuthenticationState(stateId);
    if (!state) return undefined;
    if (!isInviteeState(state)) return undefined;
    const matched = await compare(token, state.inviteSecretHashed);
    if (!matched) return undefined;
    return state;
}

export function isInviteeState(state: AuthenticationState): state is InviteeState {
    if (!state.type) return false;
    return !!(
        isLike<InviteeState>(state) &&
        state.inviteUrl &&
        state.inviteSecretHashed
    );
}