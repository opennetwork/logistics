import {DurableEventData, getKeyValueStore} from "../data";
import {virtual} from "../events/virtual/virtual";
import {ok} from "../is";

type SyncTagRegistrationState = "pending" | "waiting" | "firing" | "reregisteredWhileFiring";

interface SyncTag {
    tag: string;
    registrationState: SyncTagRegistrationState;
    registrationStateAt: string;
    createdAt: string;
    registeredAt: string;
    /**
     * false if the user agent will retry this sync event if it fails, or true if no further attempts will be made after the current attempt.
     */
    lastChance?: boolean;
}

const STORE_NAME = "syncTag";

function getSyncTagStore() {
    return getKeyValueStore<SyncTag>(STORE_NAME, {
        counter: false
    })
}

export async function getSyncTagRegistrationState(tag: string) {
    const store = getSyncTagStore();
    const existing = await store.get(tag);
    ok(existing, "Expected to find registered sync tag");
    return existing.registrationState;
}

export async function setSyncTagRegistrationState(tag: string, registrationState: SyncTagRegistrationState) {
    const store = getSyncTagStore();
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

export async function deregisterSyncTag(tag: string) {
    const store = await getSyncTagStore();
    await store.delete(tag);
}

export class DurableSyncManager {
    async register(tag: string) {
        const store = getSyncTagStore();
        const existing = await store.get(tag);
        const isFiring = existing?.registrationState === "firing"
        if (!existing || !isFiring) {
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
        const store = getSyncTagStore();
        return await store.keys();
    }

    [Symbol.asyncIterator]() {
        const store = getSyncTagStore();
        return store[Symbol.asyncIterator]();
    }
}

export const sync = new DurableSyncManager();

export async function * generateVirtualSyncEvents(): AsyncIterable<DurableEventData> {
    const store = getSyncTagStore();
    for await (const { tag, lastChance } of store) {
        yield {
            // Utilise a durableEventId so that a lock is created per tag
            durableEventId: `${STORE_NAME}:${tag}`,
            type: "sync",
            tag,
            lastChance
        };

        if (lastChance) {
            const existing = await store.get(tag);
            if (existing)
            // TODO is this what lastChance mean for durable syncing... is it lastChance for this process?
            //
            // Returns true if the user agent will not make further synchronization attempts after the current attempt.
            await store.delete(tag);
        }
    }
}

export const removeSyncVirtualFunction = virtual(generateVirtualSyncEvents);
