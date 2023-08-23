import {getDurableEventStore} from "./store";
import {DurableEventTypeData} from "./types";

export function listDurableEvents(event: DurableEventTypeData) {
    const store = getDurableEventStore(event);
    return store.values();
}