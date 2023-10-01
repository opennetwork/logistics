import {virtual} from "../events/virtual/virtual";
import {listDurableEventIds} from "../data/durable-event/list-durable-event-ids";
import {DurableEventSchedule, getDurableEvent} from "../data";
import {isMatchingObjects} from "../is";
import {getPeriodicSyncSchedule} from "./schedule";

async function * generatePeriodicSyncVirtualEvents() {
    const schedules = await getPeriodicSyncSchedule();
    const type = "periodicsync"
    const existingTags = await listDurableEventIds({
        type
    });
    const tags = schedules.map(({ tag }) => tag);
    const tagsToDelete = existingTags.filter(tag => !tags.includes(tag));
    const { deleteDispatchEvent } = await import("../events");
    console.log({ tagsToDelete, schedules, existingTags })
    for (const tag of tagsToDelete) {
        const existing = await getDurableEvent({
            type,
            durableEventId: tag
        });
        if (existing) {
            await deleteDispatchEvent(existing);
        }
    }
    for (const { tag, schedule } of schedules) {
        const dispatch = {
            durableEventId: tag,
            type,
            tag,
            schedule
        };
        const existing = await getDurableEvent(dispatch)
        if (existing) {
            if (isMatchingDurableEventSchedule(existing.schedule, dispatch.schedule)) {
                continue;
            }
            // Ensure we delete the old schedule before defining a new one
            // This shouldn't happen often if periodicSync is staying the same
            await deleteDispatchEvent(existing);
        }
        yield {
            type: "dispatch",
            dispatch
        };
    }
}

export const removePeriodicSyncVirtualFunction = virtual(generatePeriodicSyncVirtualEvents);

export function isMatchingDurableEventSchedule(a: DurableEventSchedule, b: DurableEventSchedule) {
    return isMatchingObjects(a, b);
}