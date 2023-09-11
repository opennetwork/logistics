await import("./esnext/index.js");

const { createRequire } = await import("node:module");

// https://github.com/fastify/fastify/blob/eaf7b7b7442ef81c370d6714859626aa141977c5/lib/pluginUtils.js#L34
// https://github.com/opennetwork/logistics/actions/runs/6141617299/job/16662152259#step:11:398

const req = createRequire(import.meta.url);
const cache = req.cache;

if (cache) {
    const keys = Object.keys(cache);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        try {
            // This is what causes the error
            if (cache[key].exports) {
                console.log(key, "has exports");
            }
        } catch (error) {
            console.log(key, cache[key]);
            if (process.env.THROW_ON_BUG) {
                throw error;
            }
        }
    }

    console.log({ keyCount: keys.length });
}



