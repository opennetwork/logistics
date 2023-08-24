import {DurableEventData} from "../data";
import {getConfig} from "../config";
import {union} from "@virtualstate/union";
import {isAsyncIterable, isIterable, isPromise, ok} from "../is";
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

export function generateVirtualEvents() {
    const { events } = getConfig();

    if (!events) return;

    if (isVirtualEventFn(events)) {
        return functionSource(events);
    }

    if (Array.isArray(events)) {
        return arraySource(events.map(fn => [fn.name, fn]));
    }

    return arraySource(Object.entries(events));

    function isVirtualEventFn(value: unknown): value is VirtualEventFn {
        return typeof value === "function";
    }

    async function *asyncIterableSource(source: AsyncIterable<EventLike>): AsyncIterable<DurableEventData[]> {
        const seen = new WeakSet<DurableEventData>();
        for await (const values of source) {
            let yielding: DurableEventData[];
            if (isDurableEventDataIterable(values)) {
                yielding = [...values];
            } else {
                yielding = [values];
            }
            yielding = yielding.filter(value => !seen.has(value));
            if (yielding.length) {
                yield yielding;
            }
            for (const yielded of yielding) {
                seen.add(yielded);
            }
        }
    }

    async function *functionSource(fn: VirtualEventFn, name?: string): AsyncIterable<DurableEventData[]> {
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

    async function *arraySource(events: [string, VirtualEventFn][]): AsyncIterable<DurableEventData[]> {
        const seen = new WeakSet<DurableEventData>();
        for await (const allEvents of union(
            events.map(
                ([name, fn]) => functionSource(fn, name)
            )
        )) {
            const yieldingEvents = allEvents
                .filter(Boolean)
                .flatMap<DurableEventData>(events => events.filter(event => !seen.has(event)))
            if (yieldingEvents.length) {
                for (const yieldingEvent of yieldingEvents) {
                    if (!yieldingEvent.eventId) {
                        // Provide it or have it mutated...
                        yieldingEvent.eventId = v4();
                    }
                }
                yield yieldingEvents;
                for (const yieldedEvent of yieldingEvents) {
                    seen.add(yieldedEvent);
                }
            }
        }
    }
}