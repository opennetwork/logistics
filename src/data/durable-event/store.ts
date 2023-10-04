import {getHappeningStore} from "../happening";
import {DurableEvent, DurableEventTypeData} from "./types";

export function getDurableEventStore({ type }: DurableEventTypeData) {
    return getHappeningStore<DurableEvent>(`event:${type}`, {
        counter: false
    });
}
