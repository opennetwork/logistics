import {ServiceWorkerWorkerData} from "./worker";
import {getWorkerPoolForImportURL} from "../pool";
import {SHARE_ENV} from "node:worker_threads";
import {getNodeWorkerForImportURL} from "../worker";
import {Push} from "@virtualstate/promise";
import {PushAsyncIterableIterator} from "@virtualstate/promise/src/push";
import {isLike, ok} from "../../is";
import {WORKER_BREAK, WORKER_INITIATED, WORKER_MESSAGE, WORKER_TERMINATE} from "./constants";
import {anAsyncThing, TheAsyncThing} from "@virtualstate/promise/the-thing";

export function getServiceWorkerWorkerWorker() {
    return getNodeWorkerForImportURL("./default-worker.js", import.meta.url, {

    });
}

function assertPushAsyncIterableIterator<T>(iterator: AsyncIterableIterator<T>): asserts iterator is PushAsyncIterableIterator<T> {
    ok(
        isLike<PushAsyncIterableIterator<T>>(iterator) &&
        typeof iterator.clone === "function"
    )
}

export async function executeServiceWorkerWorkerMessage(data?: ServiceWorkerWorkerData): Promise<unknown> {
    const iterator = executeServiceWorkerWorker(data)[Symbol.asyncIterator]();
    const next = await iterator.next();
    await iterator.return?.();
    return next.value; // Could be void :)
}

export interface Pushable<T, R> {
    push(data: T): TheAsyncThing<R>
    close(): Promise<void>
}

export async function createServiceWorkerWorker<T, R>(): Promise<Pushable<T, R>> {
    const worker = await getServiceWorkerWorkerWorker();

    await onInitiated();

    return {
        push,
        close
    }

    function push(data: T): TheAsyncThing<R> {
        const messages = new Push<R>();

        function pushClose() {
            worker.off("message", onMessage);
            messages.close();
        }

        function onMessage(message: unknown) {
            if (message === WORKER_TERMINATE) {
                pushClose();
                return close();
            }
            if (!messages.open || message === WORKER_BREAK) {
                return pushClose();
            }
            ok<R>(message);
            messages.push(message);
        }
        worker.on("message", onMessage);

        worker.postMessage(data);

        return anAsyncThing(onMessages());

        async function *onMessages() {
            try {
                yield * messages;
            } finally {
                pushClose();
            }
        }
    }

    // await new Promise(resolve => worker.addEventListener("connect", resolve));
    // console.log("Connected");

    async function close() {
        worker.postMessage(WORKER_TERMINATE);
        await worker.terminate();
    }

    function onInitiated() {
        return new Promise<void>(resolve => {
            worker.on("message", onMessage)
            function onMessage(message: unknown) {
                if (message !== WORKER_INITIATED) return;
                worker.off("message", onMessage);
                resolve();
            }
        })
    }

}

export async function * executeServiceWorkerWorker(data?: ServiceWorkerWorkerData): AsyncIterable<unknown> {
    const worker = await createServiceWorkerWorker();

    try {
        yield * worker.push(data);
    } finally {
        await worker.close();
    }

}