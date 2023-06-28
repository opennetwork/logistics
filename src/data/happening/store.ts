import {getKeyValueStore} from "../kv";
import {Happening, HappeningData} from "./types";
import {KeyValueStoreOptions} from "../storage";

const STORE_NAME = "happening" as const;

export function getHappeningStore<H extends HappeningData = Happening>(name: string = STORE_NAME, options?: KeyValueStoreOptions) {
    return getKeyValueStore<H>(name, {
        counter: true,
        ...options
    });
}