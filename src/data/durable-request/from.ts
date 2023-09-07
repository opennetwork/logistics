import {DurableBody, DurableRequestData, DurableResponseData} from "./types";
import {isDurableBody} from "./is";
import {ok} from "../../is";
import {getFile, readFile, save} from "../file";
import {v4} from "uuid";

export async function fromMaybeDurableBody(body: unknown): Promise<RequestInit["body"]> {
    if (typeof body === "string") {
        return body;
    }
    if (!body) {
        return undefined;
    }
    if (Buffer.isBuffer(body)) {
        return body
    }
    if (body instanceof ArrayBuffer || body instanceof FormData || body instanceof Uint8Array || body instanceof Blob) {
        return body;
    }
    if (isDurableBody(body)) {
        return fromDurableBody(body);
    }
    throw new Error("Unknown body type");
}

export async function fromDurableBody(body: DurableBody): Promise<RequestInit["body"]> {
    if (body.type === "base64") {
        return Buffer.from(body.value, body.type);
    }
    ok(body.type === "file", `Unknown body type ${body.type}`);
    const file = await getFile(body.value);
    ok(file, `Expected to find file ${file.fileId}`);
    const found = await readFile(file);
    ok(found, `Expected to find contents for ${file.fileId}`);
    return found;
}

export async function fromDurableRequest(durableRequest: DurableRequestData, getOrigin?: () => string) {
    const { url, method, headers, body: givenBody } = durableRequest;
    const body = await fromMaybeDurableBody(givenBody);
    return new Request(
        new URL(url, getOrigin?.()),
        {
            method,
            headers,
            body
        }
    );
}

export async function fromDurableResponse(durableResponse: DurableResponseData) {
    const { body: givenBody, statusText, status, headers } = durableResponse;
    const body = await fromMaybeDurableBody(givenBody);
    return new Response(
        body,
        {
            status,
            statusText,
            headers
        }
    );
}

export interface FromRequestResponseOptions {
    fileName?: string;
}

export async function fromRequestResponse(request: Request, response: Response, options?: FromRequestResponseOptions): Promise<DurableRequestData> {
    const clonedResponse = response.clone();

    let body: DurableResponseData["body"];

    // TODO detect string based contentTypes
    const contentType = response.headers.get("Content-Type");
    if (contentType === "text/html" || contentType === "text/plain" || contentType?.startsWith("application/json") || contentType === "application/javascript") {
        body = await clonedResponse.text();
    } else {
        // TODO warning, we might mislink some of these files...
        const file = await save({
            fileName: options?.fileName || v4(),
            contentType
        }, await clonedResponse.blob());
        body = {
            type: "file",
            value: file.fileId
        };
    }

    const durableResponse: DurableResponseData = {
        headers: getResponseHeadersObject(),
        status: response.status,
        statusText: response.statusText,
        // response.url is empty if it was constructed manually
        // Should be same value anyway...
        url: response.url || request.url,
        body
    };

    const { method, url } = request;

    return {
        method,
        url,
        response: durableResponse
    };

    function getResponseHeadersObject() {
        const headers = new Headers(response.headers);
        // Not sure if we ever get this header in node fetch
        // https://developer.mozilla.org/en-US/docs/Web/API/Cache#cookies_and_cache_objects
        // Maybe these headers were constructed by a user though
        headers.delete("Set-Cookie");
        return getHeadersObject(headers);
    }

}

function getHeadersObject(headers?: Headers) {
    const output: Record<string, string> = {};
    if (!headers) {
        return output;
    }
    headers.forEach((value, key) => {
        output[key] = value;
    })
    return output;
}