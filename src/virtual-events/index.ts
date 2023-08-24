import { generateVirtualEvents } from "./virtual";
import {on} from "../schedule";
import {limited} from "../limited";
import {dispatchScheduledDurableEvents} from "../schedule/dispatch-scheduled";
import {DurableEventData, UnknownEvent} from "../data";

const VIRTUAL = "virtual" as const;
type VirtualEventType = typeof VIRTUAL;

export interface VirtualEventLike extends UnknownEvent {
    type: VirtualEventType;
}

export interface VirtualDispatchEvent extends VirtualEventLike {
    dispatch: DurableEventData;
}

export type VirtualEvent = VirtualDispatchEvent | VirtualEventLike

function isVirtualEventLike<E extends VirtualEventLike = VirtualEvent>(event?: UnknownEvent): event is E {
    return event.type === VIRTUAL;
}

function isVirtualDispatch(event?: UnknownEvent): event is VirtualDispatchEvent {
    return (
        isVirtualEventLike<VirtualDispatchEvent>(event) &&
        !!event.dispatch
    );
}

export async function virtualEvents(event?: DurableEventData) {
    if (isVirtualDispatch(event)) {
        return await dispatchScheduledDurableEvents({
            event: event.dispatch
        });
    } else {
        for await (const events of generateVirtualEvents()) {
            await limited(
                events.map(event => () => dispatchScheduledDurableEvents({
                    event
                }))
            );
        }
    }
}

export const removeVirtualScheduledFunction = on(VIRTUAL, async (event) => {
    await virtualEvents(event);
});