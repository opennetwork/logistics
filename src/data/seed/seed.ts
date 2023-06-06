import * as happening from "./happening";
import { Seed, SeedOptions } from "./type";
import { ok } from "../../is";

export const seeds: Record<string, Seed> = {
  happening,
};

export const DEFAULT_SEED = "happening";

export async function seed(options?: SeedOptions) {
  const name = options?.seed || DEFAULT_SEED;
  const value = seeds[name];
  ok(
    value,
    `Expected seed name ${name} to be available, seeds: ${Object.keys(seeds)}`
  );
  await value.seed({
    ...options,
    seed: name,
  });
}

export async function autoSeed() {
  const { ENABLE_SEED } = process.env;
  if (!ENABLE_SEED?.length) return;
  if (ENABLE_SEED === "true" || ENABLE_SEED === "1") {
    return await seed();
  }
  return await seed({
    seed: ENABLE_SEED,
  });
}
