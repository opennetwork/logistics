import type {FastifyPluginAsync} from "fastify";
import type {ReactOrderConfig} from "../react/server/paths/order/types";
import type {ViewConfig} from "../view";
import type {AuthenticationRoleConfig, KeyValueStoreConfig} from "../data";
import type {ComponentConfig} from "../react/server/paths/config";
import type {ProcessChangeConfig} from "../data";
import type {StorageConfig} from "../data/storage/kv-base";

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
    StorageConfig {

}
