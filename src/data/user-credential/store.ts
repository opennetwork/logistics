import { getKeyValueStore } from "../kv";
import { UserCredential } from "./types";

const STORE_NAME = "userCredential" as const;

export function getUserCredentialStore(userId: string) {
  return getKeyValueStore<UserCredential>(STORE_NAME, {
    counter: false,
    // Partition by userId
    prefix: `userId::${userId}::`
  });
}