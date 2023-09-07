import {dispatcher} from "../events/schedule/schedule";
import {isLike, isSignalled, ok} from "../is";
import {createWaitUntil} from "../fetch";
import {DurableEventData} from "../data";
import {deregisterSyncTag, getSyncTagRegistrationState, setSyncTagRegistrationState} from "./manager";

export interface SyncDurableEventData extends DurableEventData {
    tag: string;
    lastChance?: boolean;
}

export function isSyncDurableEventData(event: unknown): event is SyncDurableEventData {
    return !!(
        isLike<Partial<SyncDurableEventData>>(event) &&
        event.type === "sync" &&
        typeof event.tag === "string"
    );
}

export const removeSyncDispatcherFunction = dispatcher("sync", async (event, dispatch) => {
    ok(isSyncDurableEventData(event), "Expected sync event with tag");
    return dispatchSyncEvent(event);

    async function dispatchSyncEvent(event: SyncDurableEventData) {
        const { tag, lastChance = false } = event;
        const initialState = await getSyncTagRegistrationState(tag);
        // Note that waiting or pending are allowed initial states
        ok(initialState === "pending" || initialState === "waiting", "Expected sync event to be in pending state");
        const { signal, controller } = getSignal();
        const {
            wait,
            waitUntil
        } = createWaitUntil();
        try {
            await setSyncTagRegistrationState(tag, "firing");
            await dispatch({
                lastChance,
                ...event,
                signal,
                waitUntil
            });
            await wait();
        } catch (error) {
            if (!signal.aborted) {
                controller?.abort(error);
            }
            if (await dispatchAgainIfReregistered()) {
                return;
            }
            if (lastChance) {
                throw await Promise.reject(error);
            }
            await setSyncTagRegistrationState(tag, "waiting");
        } finally {
            if (!signal.aborted) {
                controller?.abort();
            }
            await wait();
        }

        if (await dispatchAgainIfReregistered()) {
            return;
        }

        await deregisterSyncTag(tag);

        async function dispatchAgainIfReregistered() {
            const state = await getSyncTagRegistrationState(tag);
            if (state !== "reregisteredWhileFiring") {
                return false;
            }
            await dispatchSyncEvent(event);
            return true;
        }
    }

    function getSignal() {
        if (isSignalled(event)) {
            return { signal: event.signal, controller: undefined } as const;
        }
        const controller = new AbortController();
        return {
            signal: controller.signal,
            controller
        } as const;
    }
})