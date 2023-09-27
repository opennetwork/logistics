import type {DurableServiceWorkerScope} from "../../../worker/service-worker/types";
import type {FetchEvent} from "../../../fetch";

declare var self: DurableServiceWorkerScope;

self.addEventListener("fetch", event => {
    console.log("Fetch event", event);
    event.respondWith(onFetchEvent(event));
});


async function onFetchEvent(event: FetchEvent): Promise<Response> {

    console.log(event.request.url);

    return new Response("Hello");
}