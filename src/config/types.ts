import type {ReactOrderConfig} from "../react/server";
import type {ViewConfig} from "../view";
import type {AuthenticationRoleConfig, KeyValueStoreConfig} from "../data";
import type {ComponentConfig} from "../react/server/paths/config";
import type {ProcessChangeConfig} from "../data";
import type {StorageConfig} from "../data/storage/kv-base";
import type {LayoutConfig} from "../react/server";
import type {SetMembershipConfig} from "../data";
import type {MembershipViewComponentConfig} from "../react/server/paths/membership/view";
import type {MembershipStatusConfig} from "../data/membership/membership-status";
import type {AppointmentTreeConfig, HappeningTreeConfig, SeedConfig} from "../data";
import type {ScheduledConfig} from "../events/schedule/schedule";
import type {VirtualEventConfig} from "../events/virtual/virtual";
import type {DurableCacheStorageConfig, FetchEventConfig} from "../fetch";
import type {ContentIndexConfig} from "../content-index";
import type {DispatchEventConfig} from "../events";
import type {FastifyConfig} from "../listen";
import type {WorkerPoolConfig} from "../worker/pool";

export interface LogisticsConfig {

}

export interface Config extends
    LogisticsConfig,
    ReactOrderConfig,
    ViewConfig,
    Partial<AuthenticationRoleConfig>,
    ComponentConfig,
    KeyValueStoreConfig,
    ProcessChangeConfig,
    StorageConfig,
    LayoutConfig,
    SetMembershipConfig,
    MembershipViewComponentConfig,
    MembershipStatusConfig,
    SeedConfig,
    ScheduledConfig,
    VirtualEventConfig,
    DurableCacheStorageConfig,
    FetchEventConfig,
    ContentIndexConfig,
    AppointmentTreeConfig,
    HappeningTreeConfig,
    DispatchEventConfig,
    FastifyConfig,
    WorkerPoolConfig {
    name: string;
    version: string;
    root: string;
}
