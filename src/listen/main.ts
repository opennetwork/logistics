import "../references";

import * as dotenv from "dotenv";

dotenv.config();

import "../tracing";

const { start } = await import("./start");

await start();