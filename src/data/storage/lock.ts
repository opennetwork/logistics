import {
  connectGlobalRedisClient,
  getGlobalRedisClient,
  isRedis,
  isRedisMemory,
  getRedisUrl
} from "./redis-client";
import type { RedisClientType } from "redis";

const DEFAULT_TIMEOUT = 2500;
const DEFAULT_RETRY_DELAY = 25;

const GLOBAL_LOCKS = new Map<string, LockFn>();

export function isLocking() {
  return !!getGlobalLock();
}

export async function lock(name: string): Promise<UnlockFn> {
  const fn = getGlobalLock();

  if (!fn) {
    // noop for now
    return createFakeLock();
  }

  return fn(name);
}

export function createFakeLock(): UnlockFn {
  return async () => {
    return void 0; // noop
  };
}

export function getGlobalLock(): LockFn | undefined {
  if (isRedisMemory()) return undefined;
  if (!isRedis()) return undefined;
  const url = getRedisUrl();
  const existing = GLOBAL_LOCKS.get(url);
  if (existing) return existing;
  const fn =  async (name: string) => {
    const client = await connectGlobalRedisClient();
    return acquire(client, name);
  };
  GLOBAL_LOCKS.set(url, fn);
  return
}



export interface UnlockFn {
  (): Promise<void>;
}

export interface LockFn {
  (name: string): Promise<UnlockFn>
}

async function acquire(client: RedisClientType, name: string): Promise<UnlockFn> {
  const timeout = DEFAULT_TIMEOUT;
  const timeoutAfter = Date.now() + timeout + 1;
  const key = `lock::${name}`;
  return await tryAcquire();

  async function unlock() {
    const delFn = client.del.bind(client)
    await delFn(key);
  }

  async function tryAcquire(): Promise<UnlockFn> {
    try {
      const setFn = client.set.bind(client)
      const result = await setFn(key, timeoutAfter, {
        PX: timeout,
        NX: true
      });
      if (result) {
        return unlock;
      }
    } catch { }
    await new Promise<void>(resolve => setTimeout(resolve, DEFAULT_RETRY_DELAY));
    return tryAcquire();
  }
}