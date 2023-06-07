import { createClient } from "redis";
import {RedisClientType} from "@redis/client";

type BaseType = ReturnType<typeof createClient> & RedisClientType;

export type RedisClient = Record<string, unknown> & {
  [P in keyof BaseType]: BaseType[P] extends (...args: unknown[]) => infer R ? (...args: unknown[]) => R : never
}
