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

export interface ServiceWorkerWorkerData {
    serviceWorkerId: string;
}

export async function onServiceWorkerWorkerData(data: ServiceWorkerWorkerData): Promise<void> {
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
    console.log({ registration });
    if (registration.durable.registrationState === "pending" || registration.durable.registrationState === "installing") {
        try {
            console.log("Installing service worker");
            await setRegistrationStatus( "installing");
            await dispatchEvent({
                type: "install",
                virtual: true
            });
            console.log("Installed service worker");
            await setRegistrationStatus( "installed");
        } catch (error) {
            console.error("Error installing service worker", error);
            await setRegistrationStatus( "pending");
        }
    }
    if (registration.durable.registrationState === "installed" || registration.durable.registrationState === "activating") {
        try {
            await setRegistrationStatus( "activating");
            await dispatchEvent({
                type: "activate",
                virtual: true
            });
            await setRegistrationStatus( "activated");
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
    console.log({ registration });

    async function setRegistrationStatus(status: DurableServiceWorkerRegistrationState) {
        const next = await setServiceWorkerRegistrationState(registration.durable.serviceWorkerId, status);
        // TODO change to an event
        await registration.update();
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