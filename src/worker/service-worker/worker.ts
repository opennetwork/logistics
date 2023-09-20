import { ThreadWorker } from "poolifier";
import {
    dispatchDurableServiceWorkerRegistrationUpdate,
    DurableServiceWorkerRegistrationData,
    DurableServiceWorkerRegistrationState,
    getDurableServiceWorkerRegistration,
    getDurableServiceWorkerRegistrationData,
    setServiceWorkerRegistrationState
} from "./container";
import {caches} from "../../fetch";
import {index} from "../../content-index";
import {sync} from "../../sync";
import {serviceWorker} from "./container";
import {getOrigin} from "../../listen";
import {addEventListener, removeEventListener} from "../../events/schedule/schedule";
import {dispatchEvent} from "../../events";
import {dispatchScheduledDurableEvents} from "../../events/schedule/dispatch-scheduled";

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
    if (registration.durable.registrationState === "pending") {
        try {
            await setRegistrationStatus( "installing");
            await dispatchEvent({
                type: "install",
                virtual: true
            });
            await setRegistrationStatus( "installed");
        } catch {
            await setRegistrationStatus( "pending");
        }
    }
    if (registration.durable.registrationState === "installed" || registration.durable.registrationState === "reregisteredWhileActivating") {
        try {
            await setRegistrationStatus( "activating");
            await dispatchEvent({
                type: "activate",
                virtual: true
            });
            const { registrationState } = await getDurableServiceWorkerRegistrationData(registration.durable.serviceWorkerId);
            if (registrationState !== "reregisteredWhileActivating") {
                await setRegistrationStatus( "activated");
            }
        } catch {
            await setRegistrationStatus("installed");
        }
    }
    if (registration.durable.registrationState === "activated") {
        await dispatchEvent({
            type: "activated",
            virtual: true
        });
        await dispatchEvent({
            type: "virtual",
            virtual: true
        });
    }

    async function setRegistrationStatus(status: DurableServiceWorkerRegistrationState) {
        const next = await setServiceWorkerRegistrationState(registration.durable.serviceWorkerId, status);
        return dispatchRegistrationUpdate(next);
    }

    async function dispatchRegistrationUpdate(update?: DurableServiceWorkerRegistrationData) {
        await dispatchDurableServiceWorkerRegistrationUpdate(
            update ?? await getDurableServiceWorkerRegistrationData(registration.durable.serviceWorkerId),
            {
                virtual: true
            }
        );
    }
}

export default new ServiceWorkerWorker();