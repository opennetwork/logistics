import {
  connectGlobalRedisClient,
  getGlobalRedisClient,
  isRedis,
  isRedisMemory,
} from "./redis-client";
import type { LockFn } from "redis-lock";
import type { UnlockFn } from "redis-lock";
import type { RedisClientType } from "redis";

const GLOBAL_LOCKS = new WeakMap<Promise<RedisClientType>, LockFn>();

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
  const globalRedisClient = getGlobalRedisClient();
  const existing = GLOBAL_LOCKS.get(globalRedisClient);
  if (existing) return existing;
  let lockFn: LockFn | undefined = undefined;
  const fn =  async (name: string) => {
    if (!lockFn) {
      const client = await globalRedisClient;
      const { default: createLockClient } = await import("redis-lock");
      lockFn = lockFn ?? createLockClient(client);
    }
    await connectGlobalRedisClient(globalRedisClient);
    return lockFn(name);
  };
  GLOBAL_LOCKS.set(globalRedisClient, fn);
  return
}
