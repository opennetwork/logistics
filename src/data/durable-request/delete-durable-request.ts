import {getDurableRequestStore} from "./store";

export function deleteDurableRequest(durableRequestId: string) {
    const store = getDurableRequestStore();
    return store.delete(durableRequestId);
}