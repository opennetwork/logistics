import rimraf from "rimraf";
import { promisify } from "util";
import mkdirp from "mkdirp";
import {isTokenVNode} from "@opennetwork/vnode";
import {promises as fs} from "fs";
import {join} from "path";

export async function writeStoresToProject(storesPath: string, stores: AsyncIterable<[string, string]>) {

    await promisify(rimraf)(storesPath).catch(() => void 0);
    await mkdirp(storesPath, {});
    const index: string[] = [];
    for await (const [key, contents] of stores) {
        await fs.writeFile(join(storesPath, `${key}.ts`), contents);
        index.push(`export * from "./${key}";`);
    }
    await fs.writeFile(join(storesPath, "index.ts"), index.join('\n'));
}

export async function *generateStores(moduleName: string): AsyncIterable<[string, string]> {
    const module = await import(moduleName);
    for (const key of Object.keys(module)) {
        const value = module[key];
        if (!isTokenVNode(value)) continue;

        yield [key, `
import { ${key} } from "${moduleName}";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ${key}
}

const ${key}StoreKeySymbol = Symbol("${key}StoreKey");
export type ${key}StoreKey = BrandedStoreKey<StoreKey, typeof ${key}StoreKeySymbol>

export function is${key}StoreKey(key: unknown): key is ${key}StoreKey {
    return isLogisticsStoreKey(key, getLogistics${key}StorageKeyPrefix());
}
?
export const Logistics${key}StorageKeyPrefix = "https://logistics.opennetwork.dev/#${key}Prefix";
export const Logistics${key}StorageKeyPrefixDefault = "${key}/";

export function getLogistics${key}StorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(Logistics${key}StorageKeyPrefix, Logistics${key}StorageKeyPrefixDefault);
}

export interface ${key}Store extends Store<${key}StoreKey, ${key}> {

}

export function get${key}Store() {
    return getLogisticsStore<${key}, typeof ${key}StoreKeySymbol>(getLogistics${key}StorageKeyPrefix, ${key}StoreKeySymbol);
}
`.trim()];
    }
}
