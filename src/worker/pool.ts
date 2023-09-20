import {AbstractPool, availableParallelism, FixedThreadPool, ThreadPoolOptions} from "poolifier";
import {getConfig} from "../config";
import {isLike, ok} from "../is";
import {getOrigin} from "../listen";
import {dirname, join} from "node:path";

interface GetWorkerPoolFn {
    <T>(availableParallelism: number, url: string, options: ThreadPoolOptions): AbstractPool<T>;
}

export interface WorkerPoolConfig {
    getWorkerPool?: GetWorkerPoolFn;
}

const getDefaultPool: GetWorkerPoolFn = function getDefaultPool<T>(availableParallelism, url, options) {
    return new FixedThreadPool<T>(availableParallelism, url, options);
};

const pools = new WeakMap<GetWorkerPoolFn, Record<string, AbstractPool<unknown>>>();

export function getWorkerPoolForImportUrl<T>(relative: string, url: string | URL, options?: ThreadPoolOptions) {
    const instance = new URL(url, getOrigin());
    const { pathname } = instance;
    // Note, this isn't true for all urls
    const directory = dirname(pathname);
    instance.pathname = join(directory, relative);
    return getWorkerPool(instance, options);
}

/**
 * @param url
 * @param options used when new pool created for url, not used if exists
 */
export function getWorkerPool<T>(url: string | URL, options?: ThreadPoolOptions): AbstractPool<T> {
    const instance = new URL(url);
    const { protocol } = instance;
    ok(protocol === "file:", "Only file import worker supported... for now, please open an issue");
    const config = getConfig();
    const fn = config.getWorkerPool ?? getDefaultPool;
    const cache = pools.get(fn) ?? {};
    const existing = cache?.[url];
    if (isLike<AbstractPool<T>>(existing)) {
        return existing
    }
    const pool = fn<T>(availableParallelism(), instance.toString(), {
        ...options
    });
    cache[url] = pool;
    pools.set(fn, cache);
    return pool;
}