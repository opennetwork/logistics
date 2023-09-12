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
import {AppointmentTreeConfig, HappeningTreeConfig, SeedConfig} from "../data";
import {ScheduledConfig} from "../events/schedule/schedule";
import {VirtualEventConfig} from "../events/virtual/virtual";
import {DurableCacheStorageConfig, FetchEventConfig} from "../fetch";
import {ContentIndexConfig} from "../content-index";
import {DispatchEventConfig} from "../events";
import {FastifyConfig} from "../listen";

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
    FastifyConfig {
    name: string;
    version: string;
    root: string;
}
