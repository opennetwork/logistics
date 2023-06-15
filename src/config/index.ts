import {createContext} from "../hooks/context";
import {Config} from "./types";

export { Config } from "./types";

const ConfigContext = createContext<Config>()

export function getConfig(): Config {
    return ConfigContext.value;
}

export function withConfig<R>(config: Config, fn: () => R): R {
    return ConfigContext.run(config, fn);
}

export function setConfig(config: Config) {
    for (const [key, value] of Object.entries(config)) {
        ConfigContext.set(key, value);
    }
}