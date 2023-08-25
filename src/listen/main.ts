import "../references";

import * as dotenv from "dotenv";

dotenv.config();

import "../tracing";

await import("../scheduled");

const { start } = await import("./start");

await start();