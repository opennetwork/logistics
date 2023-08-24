import {DurableEventData} from "../../data";
import {getConfig} from "../../config";
import {union} from "@virtualstate/union";
import {isAsyncIterable, isIterable, isPromise, ok} from "../../is";
import {v4} from "uuid";

type EventLike = DurableEventData | Iterable<DurableEventData>;
type AsyncEventLike = EventLike | Promise<EventLike> | AsyncIterable<EventLike>;

export interface VirtualEventFn {
    (): AsyncEventLike
}

export type VirtualEventSource = VirtualEventFn | VirtualEventFn[] | Record<string, VirtualEventFn>;

export interface VirtualEventConfig {
    events?: VirtualEventSource;
}

export async function *generateVirtualEvents() {
    const { events } = getConfig();

    if (!events) return;

    const seen = new WeakSet<DurableEventData>();

    for await (const events of generate()) {
        const yieldingEvents = events.filter(event => !seen.has(event));
        if (!yieldingEvents.length) continue;
        for (const event of yieldingEvents) {
            if (!event.eventId) {
                // Provide it or have it mutated...
                event.eventId = v4();
            }
        }
        yield yieldingEvents;
        for (const event of yieldingEvents) {
            seen.add(event);
        }
    }

    function generate() {
        if (isVirtualEventFn(events)) {
            return functionSource(events);
        }

        if (Array.isArray(events)) {
            return arraySource(events);
        }

        return arraySource(Object.values(events));
    }


    function isVirtualEventFn(value: unknown): value is VirtualEventFn {
        return typeof value === "function";
    }

    async function *asyncIterableSource(source: AsyncIterable<EventLike>): AsyncIterable<DurableEventData[]> {
        for await (const values of source) {
            if (isDurableEventDataIterable(values)) {
                yield [...values];
            } else {
                yield [values];
            }
        }
    }

    async function *functionSource(fn: VirtualEventFn): AsyncIterable<DurableEventData[]> {
        let result = fn();
        if (isPromise(result)) {
            result = await result;
        }
        if (isDurableEventDataArray(result)) {
            return yield result;
        }
        if (isDurableEventDataIterable(result)) {
            return yield [...result];
        }
        if (isAsyncIterable(result)) {
            return yield * asyncIterableSource(result);
        }
        ok(!Array.isArray(result));
        yield [result];
    }

    function isDurableEventDataArray(value: unknown): value is DurableEventData[] {
        return Array.isArray(value);
    }

    function isDurableEventDataIterable(value: unknown): value is Iterable<DurableEventData> {
        return isIterable(value);
    }

    async function *arraySource(events: VirtualEventFn[]): AsyncIterable<DurableEventData[]> {
        for await (const allEvents of union([...new Set(events)].map(functionSource))) {
            const yieldingEvents = allEvents
                .filter(Boolean)
                .flatMap<DurableEventData>(events => events.filter(event => !seen.has(event)))
            if (yieldingEvents.length) {
                yield yieldingEvents;
            }
        }
    }
}