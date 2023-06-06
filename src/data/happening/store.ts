import {getKeyValueStore} from "../kv";
import {Happening} from "./types";

const STORE_NAME = "happening" as const;

export function getHappeningStore<H extends Happening = Happening>(name: string = STORE_NAME) {
    return getKeyValueStore<H>(name);
}