import {DurableRequest, DurableRequestData, DurableResponseData} from "./types";

export function fromDurableRequest(durableRequest: DurableRequestData, getOrigin?: () => string) {
    const { url, method, headers, body } = durableRequest;
    return new Request(
        new URL(url, getOrigin?.()),
        {
            method,
            headers,
            body
        }
    );
}

export function fromDurableResponse(durableResponse: DurableResponseData) {
    const { body, statusText, status, headers } = durableResponse;
    return new Response(
        body,
        {
            status,
            statusText,
            headers
        }
    );
}

export async function fromRequestResponse(request: Request, response: Response) {
    const clonedResponse = response.clone();

    const durableResponse: DurableResponseData = {
        headers: getResponseHeadersObject(),
        status: response.status,
        statusText: response.statusText,
        // response.url is empty if it was constructed manually
        // Should be same value anyway...
        url: response.url || request.url,
        // TODO investigate non string responses and storage
        // we could just use something like
        // await save(`fetch/cache/${durableRequestId}`, Buffer.from(await clonedResponse.arrayBuffer()))
        body: await clonedResponse.text()
    };

    const createdAt = new Date().toISOString();
    const { method, url } = request;

    return {
        durableRequestId: `${method}:${url}`,
        method,
        url,
        response: durableResponse,
        createdAt,
        updatedAt: createdAt
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