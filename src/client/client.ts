import {
    Partner,
    PartnerData,
    SystemLog,
} from "./interface.readonly";
import {
    Client as ClientInterface,
    ClientOptions
} from "./client.interface"
import {ok} from "../is";

export * from "./client.interface";

export class Client implements ClientInterface {

    readonly baseUrl: string | URL;
    readonly headers: Headers;
    readonly partnerId: string | undefined;
    readonly version: number;
    readonly prefix: string;

    constructor({ url, accessToken, partnerId, version, prefix }: ClientOptions = {}) {
        this.baseUrl = url ?? "https://discord.patient.nz";
        version = version ?? 1;
        this.version = version;
        this.partnerId = partnerId;
        this.prefix = prefix ?? `/api/version/${version}`;
        const headers = this.headers = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set("Accept", "application/json");
        if (accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
        }
        if (partnerId) {
            headers.set("X-Partner-ID", partnerId);
        }

        return this;
    }

    async addPartner(partner: PartnerData): Promise<Partner> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/partners`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify(partner),
                headers
            }
        );
        ok(response.ok, "addPartner response not ok");
        return await response.json();
    }

    async listPartners(): Promise<Partner[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/partners`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listPartners response not ok");
        return response.json();
    }

    async listSystemLogs(): Promise<SystemLog[]> {
        const {
            baseUrl,
            headers,
            prefix,
            partnerId
        } = this;
        const url = new URL(
            `${prefix}/system-logs`,
            baseUrl
        );
        if (partnerId) {
            url.searchParams.set("partnerId", partnerId);
        }
        const response = await fetch(
            url,
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listSystemLogs response not ok");
        return response.json();
    }

    async background(query?: Record<string, string> | URLSearchParams): Promise<void> {
        const {
            baseUrl,
            headers
        } = this;
        const url = new URL(
            "/api/background",
            baseUrl
        );
        url.search = new URLSearchParams(query).toString();
        const response = await fetch(
            url,
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "background response not ok");
        await response.blob();
    }

}