import {
    BACKGROUND_STATIC,
    getIdentifiedBackground,
    seed,
} from "../data";
import {isLike, isNumberString} from "../is";
import type {BackgroundScheduleOptions} from "../schedule/background";

export interface BackgroundInput extends Record<string, unknown> {

}

export interface QueryInput extends BackgroundInput {
    query: Record<string, string>
}

function isQueryInput(input: BackgroundInput): input is QueryInput {
    return isLike<QueryInput>(input) && !!input.query;
}

export async function background(input: BackgroundInput = {}) {

    const backgroundId = getBackgroundIdentifier();
    console.log(`Running background tasks for ${backgroundId}`, input);

    const complete = await getIdentifiedBackground(backgroundId);

    if (isQueryInput(input) && input.query.seed) {
        await seed();
    }

    await backgroundScheduleWithOptions(input);

    await complete();

    function getBackgroundIdentifier() {
        if (isQueryInput(input)) {
            if (input.query.cron) {
                return `background:cron:${input.query.cron}`;
            }
            if (input.query.event) {
                // Note this is locking per event type
                // This is expected here
                return `background:event:${input.query.event}`;
            }
        }
        return BACKGROUND_STATIC;
    }
}

async function backgroundScheduleWithOptions(input: BackgroundInput) {
    const options: BackgroundScheduleOptions = {};
    if (isQueryInput(input)) {
        const {
            cron,
            event
        } = input.query;
        if (cron) {
            options.cron = cron;
        } else if (event) {
            const {
                eventId,
                eventTimeStamp: timeStamp
            } = input.query;
            options.event = {
                type: event,
                timeStamp: isNumberString(timeStamp) ? +timeStamp : undefined,
                eventId
            }
        }
    }
    const { backgroundSchedule } = await import("../schedule/background");
    return backgroundSchedule(options);
}