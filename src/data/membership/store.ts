import {getKeyValueStore} from "../kv";
import {Membership} from "./types";

const STORE_NAME = "membership" as const;

export function getMembershipStore() {
    return getKeyValueStore<Membership>(STORE_NAME, {
        counter: true
    });
}