import {on} from "../schedule";
import {dispatchScheduledDurableEvents} from "../schedule/dispatch-scheduled";
import {DurableEventData, UnknownEvent} from "../../data";
import {isLike} from "../../is";

const DISPATCH = "dispatch" as const;
type DispatchEventType = typeof DISPATCH;

export interface DispatchEvent {
    type: DispatchEventType;
    dispatch: DurableEventData;
}

function isDispatchEvent(event?: UnknownEvent): event is DispatchEvent {
    return (
        isLike<DispatchEvent>(event) &&
        !!event.dispatch
    );
}

export async function onDispatchEvent(event: UnknownEvent) {
    if (!isDispatchEvent(event)) return;
    await dispatchScheduledDurableEvents({
        event: event.dispatch
    });
}

export const removeDispatchScheduledFunction = on(DISPATCH, onDispatchEvent);