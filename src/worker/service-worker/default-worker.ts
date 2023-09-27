import { DurableServiceWorkerScope } from "./types";
import { Push } from "@virtualstate/promise";
import {WORKER_BREAK, WORKER_INITIATED, WORKER_TERMINATE} from "./constants";
import {parentPort} from "node:worker_threads";
import {onServiceWorkerWorkerData, ServiceWorkerWorkerData} from "./worker";
import { ok } from "../../is";

console.log("Default worker!");

try {

    const messages = new Push();

    async function cleanup() {
        parentPort.off("message", onMessage);
        messages.close();
    }

    function onMessage(message: unknown) {
        if (!messages.open || message === WORKER_TERMINATE) {
            return cleanup();
        }
        messages.push(message);
    }
    parentPort.on("message", onMessage);


    parentPort.postMessage(WORKER_INITIATED);

    for await (const message of messages) {
        if (message === WORKER_BREAK) {
            continue;
        }

        console.log({ message });

        ok<ServiceWorkerWorkerData>(message);
        ok(message.serviceWorkerId);
        await onServiceWorkerWorkerData(message);

        parentPort.postMessage(message.serviceWorkerId);
    }

    parentPort.postMessage(WORKER_TERMINATE);



} catch (error) {
    console.error("Error in worker", error)
}