import {on} from "../schedule";
import type {DurableEventData, UnknownEvent} from "../../data";
import {isLike} from "../../is";

const DISPATCH = "dispatch" as const;
type DispatchEventType = typeof DISPATCH;

export interface DispatchEvent extends DurableEventData {
    type: DispatchEventType;
    dispatch: DurableEventData | DurableEventData[];
}

export function isDispatchEvent(event?: UnknownEvent): event is DispatchEvent {
    return !!(
        isLike<Partial<DispatchEvent>>(event) &&
        event.type === "dispatch" &&
        event.dispatch
    );
}

export async function onDispatchEvent(event: UnknownEvent) {
    if (!isDispatchEvent(event)) return;
    if (Array.isArray(event.dispatch)) {
        // Allows parallel dispatch with one main event
        // If serial dispatches are wanted this can be done with just multiple
        // immediate dispatches using `dispatchEvent` directly
        //
        // Parallel dispatch is useful in a service worker with many fetch events
        // at once, say for `.addAll(urls)`
        await Promise.all(event.dispatch.map(dispatch => ({
            ...event,
            dispatch
        })));
        return;
    }
    if (event.dispatch.type === "dispatch") {
        // This is to prevent infinite loops
        console.warn("dispatch cannot be used to dispatch additional events");
        return;
    }
    const dispatching: DurableEventData = {
        ...event.dispatch,
        // Dispatched events are all virtual
        virtual: true,
    };
    const {dispatchScheduledDurableEvents} = await import("../schedule/dispatch-scheduled");
    await dispatchScheduledDurableEvents({
        event: dispatching
    });
}

export const removeDispatchScheduledFunction = on(DISPATCH, onDispatchEvent);