import {DurableBody} from "./types";
import {isLike} from "../../is";

export function isDurableBody(value: unknown): value is DurableBody {
    return !!(
        isLike<DurableBody>(value) &&
        typeof value.type === "string" &&
        (
            value.type === "file" ||
            value.type === "base64"
        ) &&
        typeof value.value === "string"
    )
}