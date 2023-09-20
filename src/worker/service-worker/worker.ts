import { ThreadWorker } from "poolifier";
import {getDurableServiceWorkerRegistration} from "./container";
import {caches} from "../../fetch";
import {index} from "../../content-index";
import {sync} from "../../sync";
import {serviceWorker} from "./container";
import {getOrigin} from "../../listen";
import {addEventListener, removeEventListener} from "../../events/schedule/schedule";

export interface ServiceWorkerWorkerData {
    serviceWorkerId: string;
}

class ServiceWorkerWorker extends ThreadWorker<ServiceWorkerWorkerData> {
    constructor() {
        super(data => onServiceWorkerWorkerData(this, data));
    }
}

async function onServiceWorkerWorkerData(worker: ServiceWorkerWorker, data: ServiceWorkerWorkerData): Promise<void> {
    const registration = await getDurableServiceWorkerRegistration(data.serviceWorkerId, {
        isCurrentGlobalScope: true
    });
    const { protocol, origin } = new URL(registration.durable.url);
    Object.assign(globalThis, {
        registration,
        caches,
        index,
        sync,
        serviceWorker,
        self: globalThis,
        isSecureContext: protocol === "https:",
        origin: origin || getOrigin(),
        addEventListener,
        removeEventListener
    });
}

export default new ServiceWorkerWorker();