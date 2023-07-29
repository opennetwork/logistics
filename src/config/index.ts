import {name, version} from "../package";
import {createContext} from "../hooks/context";
import {Config} from "./types";

export { Config } from "./types";

const ConfigContext = createContext<Config>({
    name,
    version
});

export function getConfig(overrides?: Partial<Config>): Config {
    if (!overrides) return ConfigContext.value;
    return {
        ...ConfigContext.value,
        ...overrides
    };
}

export function withConfig<R>(config: Config, fn: () => R): R {
    return ConfigContext.run(config, fn);
}

export function setConfig(config: Config) {
    for (const [key, value] of Object.entries(config)) {
        ConfigContext.set(key, value);
    }
}