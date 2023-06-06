import {HappeningEventData} from "../../../../client";
import {DateTime} from "luxon";
import {useHappening, useTimezone} from "./context";


export function HappeningAt() {
    const happening = useHappening();
    const timezone = useTimezone();
    let message = "This event is happening";
    if (happening.startAt) {

    } else if (happening.startedAt) {

    }
    return (
        <div>
            {message}
        </div>
    )
}