import {dispatcher} from "../events/schedule/schedule";
import {isSignalled} from "../is";
import {createWaitUntil} from "../fetch";

export const removeSyncDispatcherFunction = dispatcher("sync", async (event, dispatch) => {
    const { signal, controller } = getSignal();
    const {
        wait,
        waitUntil
    } = createWaitUntil();
    try {
        await dispatch({
            tag: "",
            lastChance: false,
            ...event,
            signal,
            waitUntil
        });
        await wait();
    } catch (error) {
        if (!signal.aborted) {
            controller?.abort(error);
        }
    } finally {
        if (!signal.aborted) {
            controller?.abort();
        }
        await wait();
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