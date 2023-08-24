import type {FastifyPluginAsync} from "fastify";
import type {ReactOrderConfig} from "../react/server/paths/order/types";
import type {ViewConfig} from "../view";
import type {AuthenticationRoleConfig, KeyValueStoreConfig} from "../data";
import type {ComponentConfig} from "../react/server/paths/config";
import type {ProcessChangeConfig} from "../data";
import type {StorageConfig} from "../data/storage/kv-base";
import type {LayoutConfig} from "../react/server";
import type {SetMembershipConfig} from "../data";
import type {MembershipViewComponentConfig} from "../react/server/paths/membership/view";
import type {MembershipStatusConfig} from "../data/membership/membership-status";
import {SeedConfig} from "../data";
import {ScheduledConfig} from "../events/schedule/schedule";
import {VirtualEventConfig} from "../events/virtual/virtual";

export interface LogisticsConfig {
    routes?: FastifyPluginAsync
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
    VirtualEventConfig {
    name: string;
    version: string;
}
