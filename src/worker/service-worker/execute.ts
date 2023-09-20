import {ServiceWorkerWorkerData} from "./worker";
import {getWorkerPoolForImportUrl} from "../pool";
import {SHARE_ENV} from "node:worker_threads";

export function getServiceWorkerWorkerPool() {
    return getWorkerPoolForImportUrl<ServiceWorkerWorkerData>("./worker.js", import.meta.url, {
        workerOptions: {
            env: SHARE_ENV
        }
    });
}

export async function executeServiceWorkerWorker(data: ServiceWorkerWorkerData) {
    const pool = getServiceWorkerWorkerPool();
    const worker = await pool.execute(data);
}