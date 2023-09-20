import { ThreadWorker } from "poolifier";

export interface ServiceWorkerWorkerData {

}

class ServiceWorkerWorker extends ThreadWorker<ServiceWorkerWorkerData> {
    constructor() {
        super(data => onServiceWorkerWorkerData(this, data));
    }
}

async function onServiceWorkerWorkerData(worker: ServiceWorkerWorker, data: ServiceWorkerWorkerData): Promise<void> {



}

export default new ServiceWorkerWorker();