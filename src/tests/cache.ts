import {caches} from "../fetch";
import {ok} from "../is";

const cache = await caches.open("test");

let response;
if (!(response = await cache.match("https://example.com"))) {
    response = await fetch("https://example.com");
    await cache.put(response.url, response);
}
console.log(await response.text());

ok(await cache.match("https://example.com"));