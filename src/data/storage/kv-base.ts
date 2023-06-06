import { requestContext } from "@fastify/request-context";
import { KVS, StorageSchema } from "@kvs/types";
import { kvsEnvStorage } from "@kvs/env";
import { KeyValueStore, KeyValueStoreOptions, MetaKeyValueStore } from "./types";
import { createRedisKeyValueStore, isRedis } from "./redis-client";
import { ok } from "../../is";

const DATABASE_VERSION = 1;

const META_STORE_PREFIX = "meta";

interface GenericStorageFn {
  (): Promise<KVS<StorageSchema>>;
}

export const STORE_NAMES = new Set<string>();

export function getBaseKeyValueStore<T>(name: string, options?: KeyValueStoreOptions): KeyValueStore<T> {
  STORE_NAMES.add(name);
  const key = `kvStore#${name}`;
  const store = get();
  if (store) return store;
  return create();

  function get(): KeyValueStore<T> | undefined {
    return requestContext.get(key);
  }

  function create() {
    let store: Promise<KVS<StorageSchema>>;
    let kv;
    const nextOptions: KeyValueStoreOptions = {
      ...options,
      meta: options?.meta ?? meta
    };
    if (isRedis()) {
      kv = createRedisKeyValueStore<T>(name, nextOptions);
    } else {
      kv = createKeyValueStore<T>(name, nextOptions, () => {
        if (store) {
          return store;
        }
        return (store = kvsEnvStorage({
          name,
          version: DATABASE_VERSION,
        }));
      });
    }
    requestContext.set(key, kv);
    return kv;

    function meta<M>(key?: string): MetaKeyValueStore<M> {
      return getBaseKeyValueStore(
          `${name}::${META_STORE_PREFIX}`,
          {
            ...options,
            prefix: [options?.prefix, key]
                .filter(Boolean)
                .join(":")
          }
      )
    }
  }
}

function createKeyValueStore<T>(
  name: string,
  options: KeyValueStoreOptions,
  storage: GenericStorageFn
): KeyValueStore<T> {
  const isCounter = name.endsWith("Counter");

  async function get(key: string): Promise<T | undefined> {
    const store = await storage();
    return store.get(key);
  }

  async function set(key: string, value: T): Promise<void> {
    if (isCounter) {
      ok(typeof value === "number", "Expected number value for counter store");
    }
    const store = await storage();
    await store.set(key, value);
  }

  async function values(): Promise<T[]> {
    const values = [];
    const store = await storage();
    for await (const [, value] of store) {
      values.push(value);
    }
    return values;
  }

  async function* asyncIterable(): AsyncIterable<T> {
    const store = await storage();
    for await (const [, value] of store) {
      yield value;
    }
  }

  async function deleteFn(key: string): Promise<void> {
    const store = await storage();
    await store.delete(key);
  }

  async function has(key: string): Promise<boolean> {
    const store = await storage();
    return store.has(key);
  }

  async function keys(): Promise<string[]> {
    const keys: string[] = [];
    const store = await storage();
    for await (const [key] of store) {
      if (typeof key === "string") {
        keys.push(key);
      }
    }
    return keys;
  }

  async function clear(): Promise<void> {
    const store = await storage();
    await store.clear();
  }

  async function increment(key: string): Promise<number> {
    ok(isCounter, "Expected increment to be used with a counter store only");
    const storedValue = await get(key);
    const currentValue = typeof storedValue === "number" ? storedValue : 0;
    const nextValue = currentValue + 1;
    ok<T>(nextValue);
    await set(key, nextValue);
    return nextValue;
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
