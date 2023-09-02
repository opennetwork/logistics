export interface DurableRequestData extends Pick<Request, "url" | "method"> {
    headers?: Record<string, string>
    body?: string;
}

export interface DurableResponseData extends Pick<Response, "url" | "status" | "statusText"> {
    headers?: Record<string, string>
    body?: string;
}

export interface DurableRequest extends DurableRequestData {
    durableRequestId: string;
    response?: DurableResponseData;
    createdAt: string;
}