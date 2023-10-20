import {virtual} from "../events/virtual/virtual";
import {listDurableEventIds} from "../data/durable-event/list-durable-event-ids";
import {DurableEventSchedule, getDurableEvent, setDurableEvent} from "../data";
import {isMatchingObjects} from "../is";
import {getPeriodicSyncSchedule} from "./schedule";
import {isScheduleRepeating} from "../events/schedule/update";

async function * generatePeriodicSyncVirtualEvents() {
    const schedules = await getPeriodicSyncSchedule();
    const type = "periodicsync"
    const existingTags = await listDurableEventIds({
        type
    });
    const tags = schedules.map(({ tag }) => tag);
    const tagsToDelete = existingTags.filter(tag => !tags.includes(tag));
    const { deleteDispatchEvent } = await import("../events");
    // console.log({ tagsToDelete, schedules, existingTags })
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
        yield {
            type: "dispatch",
            dispatch: await setDurableEvent({
                durableEventId: tag,
                type,
                tag,
                schedule,
                retain: isScheduleRepeating(schedule)
            })
        };
    }
}

export const removePeriodicSyncVirtualFunction = virtual(generatePeriodicSyncVirtualEvents);

export function isMatchingDurableEventSchedule(a: DurableEventSchedule, b: DurableEventSchedule) {
    return isMatchingObjects(a, b);
}