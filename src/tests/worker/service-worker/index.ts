import {DurableServiceWorkerRegistration, serviceWorker} from "../../../worker/service-worker/container";
import {dirname, join} from "node:path";
import {executeServiceWorkerWorker, executeServiceWorkerWorkerMessage} from "../../../worker/service-worker/execute";

export {};

const instance = new URL(import.meta.url);
const { pathname } = instance;
const directory = dirname(pathname);
instance.pathname = join(directory, "./worker.js");
const worker = instance.toString();

async function waitForServiceWorker(registration: DurableServiceWorkerRegistration) {
    if (registration.active) {
        return registration.active;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    await registration.update();
    return waitForServiceWorker(registration);
}


{
    try {


        const registration = await serviceWorker.register(worker);

        console.log({
            executed: await executeServiceWorkerWorkerMessage(registration.durable)
        });

        console.log("Finished service worker");
    } catch (error) {
        console.log("Error service worker");
        console.dir(error);
    }


}