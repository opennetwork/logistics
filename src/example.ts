import "./index";
import {
    run,
    addEventListener,
    getStore,
    setEnvironmentConfig,
    FSStore
} from "@opennetwork/environment";
import {getProductStore, getPersonStore, getOrganizationStore, StoreKey, LogisticsStorageKeyPrefix} from "./storage";
import { promises } from "fs";

const cache = new FSStore<string>({
    space: '  ',
    replacer: undefined,
    interface: {
        promises
    }
});


async function getFromCache(key: string) {
    try {
        return await cache.get(key);
    } catch {
        return undefined;
    }
}

const storeKey = "./node_modules/.store";

addEventListener("configure", async () => {

    await setEnvironmentConfig({
        [LogisticsStorageKeyPrefix]: process.env.LOGISTICS_STORAGE_PREFIX || "https://logistics.opennetwork.dev/"
    })

    const stored = await getFromCache(storeKey);
    if (isEntries(stored)) {
        const store = getStore();
        for (const [key, value] of stored) {
            await store.set(key, value);
        }
    }
    function isEntries(stored: unknown): stored is [StoreKey, unknown][] {
        return Array.isArray(stored);
    }
});

addEventListener("complete", async () => {
    const entries: [StoreKey, unknown][] = [];
    const store = getStore();
    for await (const [identifier, item] of store.entries()) {
        entries.push([identifier, item])
    }
    await cache.set(storeKey, entries);
})

addEventListener("execute", async () => {
    console.log("Execute");

    const store = await getStore();

    const eventKey = `${Math.random()}.execute`;

    await store.set(eventKey, {
        createdAt: new Date().toISOString()
    });

    const users = getPersonStore();
    const organizations = getOrganizationStore();
    const items = getProductStore();

    for await (const [identifier, item] of items.store.entries()) {
        console.log({ identifier, item });
    }

    for await (const [identifier, user] of users.store.entries()) {
        console.log({ identifier, user });
    }

    const network = organizations.getKey('network');

    if (!await organizations.store.has(network)) {
        await organizations.store.set(network, {
            "@type": "Organization",
            identifier: network
        });
        console.log({ network });
    }

    const admin = users.getKey('admin');

    if (!await users.store.has(admin)) {
        await users.store.set(admin, {
            "@type": "Person",
            identifier: admin
        });
        console.log({ admin });
    }


    for await (const [identifier, user] of users.store.entries()) {
        console.log({ identifier, user });
    }

});

try {
    await run({
        "https://logistics.opennetwork.dev/#prefix": "http://localhost:3000/"
    });
    console.log("Complete");
} catch (error) {
    console.error({ error });
}
