import {addDurableEvent, DurableEventData} from "../data";

export async function dispatchEvent(event: DurableEventData) {
    return addDurableEvent(event);
}