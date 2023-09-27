import {getOrigin} from "../listen";
import {dirname, join} from "node:path";
import {isLike, ok} from "../is";
import {getConfig} from "../config";
import type {Worker, WorkerOptions} from "node:worker_threads";

async function getDefaultNodeWorker(url: string, options: WorkerOptions): Promise<Worker> {
    const { Worker } = await import("node:worker_threads");
    const worker = new Worker(url, {
        stderr: true,
        stdout: true,
        stdin: false,
        ...options,
    });
    worker.stdout.pipe(process.stdout);
    worker.stderr.pipe(process.stderr);
    return worker;
};

export function getWorkerURLForImportURL(relative: string, url: string | URL) {
    const instance = new URL(url, getOrigin());
    const { pathname } = instance;
    // Note, this isn't true for all urls
    const directory = dirname(pathname);
    instance.pathname = join(directory, relative);
    return instance;
}

export function getNodeWorkerForImportURL<T>(relative: string, url: string | URL, options?: WorkerOptions) {
   return getNodeWorker(getWorkerURLForImportURL(relative, url), options);
}

/**
 * @param url
 * @param options used when new pool created for url, not used if exists
 */
export async function getNodeWorker<T>(url: string | URL, options?: WorkerOptions): Promise<Worker> {
    const instance = new URL(url);
    const { protocol } = instance;
    ok(protocol === "file:", "Only file import worker supported... for now, please open an issue");
    return getDefaultNodeWorker(instance.pathname, {
        ...options
    });
}