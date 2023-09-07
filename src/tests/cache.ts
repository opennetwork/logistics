import {caches} from "../fetch";
import {ok} from "../is";
import {dispatchEvent} from "../events";
import {v4} from "uuid";

{
    const name = v4();
    const cache = await caches.open("test");

    let response;
    if (!(response = await cache.match("https://example.com"))) {
        response = await fetch("https://example.com");
        await cache.put(response.url, response);
    }
    console.log(await response.text());

    ok(await cache.match("https://example.com"));

    await caches.delete(name)
}

{
    const name = v4();
    const cache = await caches.open(name);
    const url = "https://example.com";

    const initial = await cache.match(url);

    ok(!initial);

    await dispatchEvent({
        type: "fetch",
        schedule: {
            immediate: true
        },
        request: {
            url
        },
        cache: {
            name
        }
    });

    const match = await cache.match(url);

    ok(match);
    ok(match.ok);

    await caches.delete(name);

    const deleted = await cache.match(url);

    ok(!deleted);
}