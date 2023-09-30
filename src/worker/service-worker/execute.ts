import {ServiceWorkerWorkerData} from "./worker";
import {getWorkerPoolForImportURL} from "../pool";
import {SHARE_ENV, WorkerOptions} from "node:worker_threads";
import {getNodeWorkerForImportURL} from "../worker";
import {Push} from "@virtualstate/promise";
import {PushAsyncIterableIterator} from "@virtualstate/promise/src/push";
import {isLike, ok} from "../../is";
import {WORKER_BREAK, WORKER_INITIATED, WORKER_MESSAGE, WORKER_TERMINATE} from "./constants";
import {anAsyncThing, TheAsyncThing} from "@virtualstate/promise/the-thing";

export function getServiceWorkerWorkerWorker(options?: WorkerOptions) {
    return getNodeWorkerForImportURL("./default-worker.js", import.meta.url, {
        ...options
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
    console.log("Getting worker");
    const { MessageChannel } = await import("node:worker_threads");
    const { port1, port2 } = new MessageChannel();
    const worker = await getServiceWorkerWorkerWorker({
        workerData: port2,
        transferList: [
            port2
        ]
    });

    console.log("Waiting for initiation of worker");
    await onInitiated();
    console.log("Initiated worker");

    return {
        push,
        close
    }

    function push(data: T): TheAsyncThing<R> {
        const messages = new Push<R>();

        function pushClose() {
            port2.off("message", onMessage);
            messages.close();
            port2.close();
            port1.close();
        }

        function onMessage(message: unknown) {
            console.log("Message from worker", message);
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
        console.log("Listening on worker message");
        port1.on("message", onMessage);

        console.log("Posting worker message");
        worker.postMessage(data);
        console.log("Posted worker message");

        return anAsyncThing(onMessages());

        async function *onMessages() {
            console.log("Waiting on worker messages");
            try {
                yield * messages;
            } finally {
                console.log("Finished listening to worker messages");
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
            port1.on("message", onMessage)
            worker.on("message", onMessage)
            console.log("Listening on initiation worker message");

            const interval = setInterval(() => {
                console.log("Parent interval")
            }, 250);

            function onMessage(message: unknown) {
                console.log("message received", message);
                if (message !== WORKER_INITIATED) return;
                port1.off("message", onMessage);
                clearInterval(interval);
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