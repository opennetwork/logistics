import {on} from "../schedule";
import {dispatchScheduledDurableEvents} from "../schedule/dispatch-scheduled";
import {DurableEventData, UnknownEvent} from "../../data";
import {isLike} from "../../is";
import {v4} from "uuid";

const DISPATCH = "dispatch" as const;
type DispatchEventType = typeof DISPATCH;

export interface DispatchEvent extends DurableEventData {
    type: DispatchEventType;
    dispatch: DurableEventData;
}

export function isDispatchEvent(event?: UnknownEvent): event is DispatchEvent {
    return !!(
        isLike<Partial<DispatchEvent>>(event) &&
        event.type === "dispatch" &&
        event.dispatch?.type
    );
}

export async function onDispatchEvent(event: UnknownEvent) {
    if (!isDispatchEvent(event)) return;
    if (event.dispatch.type === "dispatch") {
        // This is to prevent infinite loops
        console.warn("dispatch cannot be used to dispatch additional events");
        return;
    }
    const dispatching: DurableEventData = {
        ...event.dispatch,
        // Dispatched events are virtual, no need to delete, mark as retain
        retain: true,
        virtual: true,
    };
    // If the instance has no id, give it one
    if (!dispatching.durableEventId) {
        dispatching.durableEventId = v4();
    }
    await dispatchScheduledDurableEvents({
        event: dispatching
    });
}

export const removeDispatchScheduledFunction = on(DISPATCH, onDispatchEvent);