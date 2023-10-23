import {DurableEventData, DurableEventSchedule} from "../../data";
import {DURABLE_EVENTS_INTERNAL_SCHEDULE, DURABLE_EVENTS_INTERNAL_SCHEDULE_DEFAULT_DELAY} from "../../config";
import { Cron } from "croner";
import {isNumberString} from "../../is";
import timestring from "timestring";

export function isInternalSchedule() {
    return DURABLE_EVENTS_INTERNAL_SCHEDULE;
}

interface InternalSchedule {
    schedule: DurableEventSchedule
    close(): void;
}

const SCHEDULES = new Map<string, InternalSchedule>();

function getInternalScheduleKey(event: DurableEventData) {
    const key: string[] = [
        event.type
    ];
    if (event.durableEventId) {
        key.push(event.durableEventId);
    }
    return key.join(":");
}

export async function dispatchInternalSchedule(event: DurableEventData) {
    const { schedule } = event;
    const key = getInternalScheduleKey(event);

    closeInternalSchedule(key);

    const close = createSchedule();

    const internal: InternalSchedule = {
        schedule,
        close
    };

    SCHEDULES.set(key, internal);

    async function onRunEvent() {
        try {
            const {dispatchScheduledDurableEvents} = await import("./dispatch-scheduled");
            await dispatchScheduledDurableEvents({
                event
            });
        } catch (error) {
            // TODO do something with this error
            console.error("Error while dispatching internally scheduled event", event.type, event.durableEventId);
            console.error(error);
            void error;
        }
    }

    function createSchedule() {
        if (!schedule || schedule.immediate) {
            return scheduleImmediate()
        } else if (schedule.cron) {
            return scheduleCron(schedule.cron);
        } else if (schedule.after) {
            return scheduleDate(new Date(schedule.after));
        } else if (schedule.delay) {
            return scheduleDelay(schedule.delay);
        }
        return scheduleImmediate();
    }

    function createClose(job: Cron) {
        return function closeSchedule() {
            if (job.isRunning()) {
                console.warn(`Warning, function for event ${event.type} is currently running, but job is being stopped`);
            }
            job.stop();
        }
    }

    function scheduleCron(cron: string) {
        const job = Cron(cron, onRunEvent);
        return createClose(job);
    }

    function scheduleDate(after: Date) {
        const job = Cron(after, onRunEvent);
        return createClose(job);
    }

    function scheduleDelay(givenDelay: string | number) {
        let delay = 0;
        if (isNumberString(givenDelay)) {
            delay = +givenDelay;
        } else {
            delay = timestring(givenDelay, "ms");
        }
        return scheduleMillisecondDelay(delay);
    }

    function scheduleMillisecondDelay(givenDelay: number) {
        return scheduleDate(
            new Date(
                Date.now() + givenDelay
            )
        );
    }

    function scheduleImmediate() {
        let delay = 250;
        if (isNumberString(DURABLE_EVENTS_INTERNAL_SCHEDULE_DEFAULT_DELAY)) {
            delay = +DURABLE_EVENTS_INTERNAL_SCHEDULE_DEFAULT_DELAY;
        }
        return scheduleMillisecondDelay(delay);
    }

}

function closeInternalSchedule(key: string) {
    const existing = SCHEDULES.get(key);
    if (!existing) return;
    existing.close();
}

export async function deleteDispatchInternalSchedule(event: DurableEventData) {
    const key = getInternalScheduleKey(event);
    closeInternalSchedule(key);
}

export async function clearDispatchInternalSchedule() {
    for (const key of SCHEDULES.keys()) {
        closeInternalSchedule(key);
    }
}
