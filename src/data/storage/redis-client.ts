import {KeyValueStore, KeyValueStoreOptions, MetaKeyValueStore} from "./types";
import { ok } from "../../is";
import { RedisClientType } from "@redis/client";
import type { createClient } from "redis";
import { RedisClient } from "./redis-types";
import {getRedisPrefix, getRedisPrefixedKey, getRedisUrl, isNumberString} from "./redis-client-helpers";

export { RedisClient }

const GLOBAL_CLIENTS = new Map();
const GLOBAL_CLIENTS_PROMISE = new Map();
const GLOBAL_CLIENT_CONNECTION_PROMISE = new WeakMap();

export function getGlobalRedisClient(): Promise<RedisClient> {
  const url = getRedisUrl();
  // Give a stable promise result so it can be used to cache on too
  const existing = GLOBAL_CLIENTS_PROMISE.get(url);
  if (existing) {
    return existing;
  }
  const promise = getClient();
  GLOBAL_CLIENTS_PROMISE.set(url, promise);
  return promise;

  async function getClient(): Promise<RedisClient> {
    const { createClient } = await import("redis");
    const client: unknown = createClient<Record<string, never>, Record<string, never>, Record<string, never>>({
      url,
    });
    ok<RedisClient>(client);
    client.on("error", console.warn);
    GLOBAL_CLIENTS.set(url, client);
    return client;
  }
}

export async function connectGlobalRedisClient(
    clientPromise: Promise<RedisClient> = getGlobalRedisClient()
): Promise<RedisClient> {
  const client: RedisClient = await clientPromise;
  if (client.isOpen) {
    return client;
  }
  const existingPromise = GLOBAL_CLIENT_CONNECTION_PROMISE.get(client);
  if (existingPromise) return existingPromise;
  const promise = client.connect().then(() => client);
  GLOBAL_CLIENT_CONNECTION_PROMISE.set(client, promise);
  promise.finally(() => {
    if (promise === GLOBAL_CLIENT_CONNECTION_PROMISE.get(client)) {
      GLOBAL_CLIENT_CONNECTION_PROMISE.delete(client);
    }
  });
  return promise;
}

// export async function getRedisClient() {
//     const client = getGlobalRedisClient();
//     await connectGlobalRedisClient(client);
//     return client;
// }

export function createRedisKeyValueStore<T>(name: string, options?: KeyValueStoreOptions): KeyValueStore<T> {
  const clientPromise = getGlobalRedisClient();

  const isCounter = name.endsWith("Counter");

  function parseValue(value: unknown): T | undefined {
    if (isCounter) {
      return parseCounterValue(value);
    }

    if (typeof value !== "string") {
      return undefined;
    }

    return JSON.parse(value);

    function parseCounterValue(value: unknown): T {
      let returnValue = 0;
      if (isNumberString(value)) {
        returnValue = +value;
      }
      ok<T>(returnValue);
      return returnValue;
    }
  }

  function getPrefix() {
    return getRedisPrefix(name, options);
  }

  function getKey(key: string): string {
    return getRedisPrefixedKey(name, key, options);
  }

  async function connect() {
    return connectGlobalRedisClient(clientPromise);
  }

  async function get(key: string): Promise<T | undefined> {
    return internalGet(getKey(key));
  }

  async function internalGet(actualKey: string): Promise<T | undefined> {
    const client = await connect();
    const value = await client.get(actualKey);
    return parseValue(value);
  }

  async function set(key: string, value: T): Promise<void> {
    if (isCounter) {
      ok(typeof value === "number", "Expected number value for counter store");
    }
    const client = await connect();
    const json = JSON.stringify(value);
    await client.set(getKey(key), json);
  }

  async function values(): Promise<T[]> {
    const client = await connect();
    const keys = await client.keys(`${getPrefix()}*`);
    return await Promise.all(keys.map((key: string) => internalGet(key)));
  }

  async function* asyncIterable(): AsyncIterable<T> {
    for (const key of await keys()) {
      const value = await internalGet(key);
      // Could return as deleted in between fetching
      if (value) {
        yield value;
      }
    }
  }

  async function deleteFn(key: string): Promise<void> {
    const client = await connect();
    await client.del(getKey(key));
  }

  async function has(key: string): Promise<boolean> {
    const client = await connect();
    return !!await client.exists(getKey(key));
  }

  async function keys(): Promise<string[]> {
    const client = await connect();
    return await client.keys(`${getPrefix()}*`);
  }

  async function clear(): Promise<void> {
    await Promise.all(
        (
            await keys()
        ).map(async (key) => {
          await deleteFn(key);
        })
    );
  }

  async function increment(key: string): Promise<number> {
    const client = await connect();
    ok(isCounter, "Expected increment to be used with a counter store only");
    await connect();
    const returnedValue = await client.incr(getKey(key));
    ok(
        isNumberString(returnedValue),
        "Expected redis to return number when incrementing"
    );
    return +returnedValue;
  }

  function meta<M>(key?: string): MetaKeyValueStore<M> {
    const fn = options?.meta;
    ok(fn, "expected meta option to be provided if meta is used");
    return fn<M>(key);
  }

  return {
    name,
    get,
    set,
    values,
    delete: deleteFn,
    has,
    keys,
    clear,
    increment,
    meta,
    [Symbol.asyncIterator]() {
      return asyncIterable()[Symbol.asyncIterator]();
    },
  };
}

export async function stopRedis() {
  for (const [key, promise] of GLOBAL_CLIENTS_PROMISE.entries()) {
    const client = GLOBAL_CLIENTS.get(key)
    deleteKey(key);
    if (client?.isOpen) {
      await client.disconnect();
    } else {
      // If we didn't yet set the client, but we have a promise active
      // reset all the clients again
      //
      // Its okay if we over do this, we will "just" make a new client
      promise.then(
          (client: RedisClientType) => {
            // If it resolved but it's not set, we made a new promise over the top already
            // so we don't want to reset it
            if (GLOBAL_CLIENTS.get(key) === client) {
              deleteKey(key);
            }
          },
          () => {
            // If we got an error, delete either way
            deleteKey(key);
          }
      )
    }

    function deleteKey(key: string) {
      GLOBAL_CLIENTS.delete(key);
      GLOBAL_CLIENTS_PROMISE.delete(key);
      GLOBAL_CLIENT_CONNECTION_PROMISE.delete(client);
    }
  }
}


