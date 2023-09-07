import {getKeyValueStore} from "../data";
import {dispatchEvent} from "../events";
import {ok} from "../is";
import {caches} from "../fetch";
import {CONTENT_INDEX_DEFER_ICONS} from "../config";

export type ContentCategory = "" | "homepage" | "article" | "video" | "audio";

export interface ContentDescriptionImageResource {
    src: string;
    type?: string;
    sizes?: string;
    label?: string;
}

export interface ContentDescription {
    id: string;
    title: string;
    description: string;
    url: string;
    category?: ContentCategory;
    icons?: ContentDescriptionImageResource[];
}

const STORE_NAME = "contentIndex";

function getContentIndexStore() {
    return getKeyValueStore<ContentDescription>(STORE_NAME, {
        counter: false
    })
}

export class DurableContentIndex {

    async add(contentDescription: ContentDescription) {
        ok(contentDescription.id, "id should not be empty");
        ok(contentDescription.title, "title should not be empty");
        ok(contentDescription.description, "description should not be empty");
        ok(contentDescription.url, "url should not be empty");
        const store = getContentIndexStore();

        if (!CONTENT_INDEX_DEFER_ICONS && contentDescription.icons?.length) {
            const cache = await caches.open(STORE_NAME);
            // Fetch icons _before_ storing, indicates that all the resources are accessible
            await cache.addAll(contentDescription.icons.map(({ src }) => src));
        }

        await store.set(contentDescription.id, contentDescription);

        await dispatchEvent({
            type: "fetch",
            request: {
                url: contentDescription.url
            },
            cache: {
                name: STORE_NAME
            },
            dispatch: {
                type: "content",
                id: contentDescription.id
            }
        });
    }

    async delete(id: string) {
        const store = getContentIndexStore();
        const exists = await store.get(id);
        if (!exists) {
            return;
        }
        await store.delete(id);
        await dispatchEvent({
            type: "contentdelete",
            id
        });
    }

    async getAll() {
        const store = getContentIndexStore();
        return await store.values();
    }

}

export const index = new DurableContentIndex();
