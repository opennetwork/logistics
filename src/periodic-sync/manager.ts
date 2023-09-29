import {getKeyValueStore} from "../data";
import {ok} from "../is";
import {SyncTag, SyncTagRegistrationState} from "../sync";

export interface PeriodicSyncTag extends SyncTag {

}

const STORE_NAME = "syncTag";

function getPeriodicSyncTagStore() {
    return getKeyValueStore<PeriodicSyncTag>(STORE_NAME, {
        counter: false
    })
}

export async function getPeriodicSyncTagRegistrationState(tag: string) {
    const store = getPeriodicSyncTagStore();
    const existing = await store.get(tag);
    ok(existing, "Expected to find registered sync tag");
    return existing.registrationState;
}

export async function setPeriodicSyncTagRegistrationState(tag: string, registrationState: SyncTagRegistrationState) {
    const store = getPeriodicSyncTagStore();
    const existing = await store.get(tag);
    ok(existing, "Expected to find registered sync tag");
    const next: SyncTag = {
        ...existing,
        registrationState,
        registrationStateAt: new Date().toISOString()
    };
    await store.set(tag, next);
    return next;
}

export async function deregisterPeriodicSyncTag(tag: string) {
    const store = await getPeriodicSyncTagStore();
    await store.delete(tag);
}

export class DurablePeriodicSyncManager {
    async register(tag: string) {
        const store = getPeriodicSyncTagStore();
        const existing = await store.get(tag);
        const isFiring = existing?.registrationState === "firing"
        if (existing && !isFiring) {
            return;
        }
        let registrationState: SyncTagRegistrationState = "pending";
        if (isFiring) {
            registrationState = "reregisteredWhileFiring";
        }
        const registeredAt = new Date().toISOString();
        await store.set(tag, {
            tag,
            createdAt: existing?.createdAt || registeredAt,
            registeredAt,
            registrationState,
            registrationStateAt: registeredAt
        });
    }

    async getTags() {
        const store = getPeriodicSyncTagStore();
        return await store.keys();
    }
}

export const periodicSync = new DurablePeriodicSyncManager();

