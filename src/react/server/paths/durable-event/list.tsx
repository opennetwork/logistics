import {useData, useInput} from "../../data";
import {listDurableEvents} from "../../../../data";
import {DispatchEvent} from "../../../../events";
import {path as createPath} from "./schedule";

export const path = "/durable-events";
export const anonymous = true;
export const cached = true;

const LINK_CLASS = "text-blue-600 hover:bg-white underline hover:underline-offset-2";

export async function handler() {
    return {
        events: await listDurableEvents({
            type: "dispatch"
        }),
    }
}

export function ListDurableEvents() {
    const { events } = useInput<{ events: DispatchEvent[] }>();
    const { isUnauthenticated } = useData();
    return (
        <div className="flex flex-col">
            {!isUnauthenticated ? <a href={createPath} className={LINK_CLASS}>Schedule Event</a> : undefined}
            <div className="flex flex-col divide-y">
                {events.map(event => (
                    <div key={event.eventId} className="flex flex-row justify-between">
                        <div>{event.dispatch.type}</div>
                        {
                            !isUnauthenticated ? (
                                <div>
                                    <a href={`${path}?dispatch=${event.eventId}`} className={LINK_CLASS}>
                                        Dispatch
                                    </a>
                                </div>
                            ) : undefined
                        }
                    </div>
                ))}
            </div>
        </div>
    )
}

export const Component = ListDurableEvents;