import * as mod from "./esnext/index.js";

if (!require.cache) {
    throw new Error("No require.cache");
} else {
    console.log("require.cache exists")
}

console.log(!!mod);