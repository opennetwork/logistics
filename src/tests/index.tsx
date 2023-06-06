/* c8 ignore start */
import why from "why-is-node-still-running";
import {isRedisMemory, seed, startRedisMemory, stopData, stopRedisMemory} from "../data";

try {
  if (isRedisMemory()) {
    await startRedisMemory()
  }

  await seed();

  await import("./client");
  await import("./happening");

  // Ensure any data clients are closed
  await stopData();

  if (isRedisMemory()) {
    await stopRedisMemory();
  }

  console.log("Tests successful");

} catch (error) {
  console.error(error);
  if (typeof process !== "undefined") {
    process.exit(1);
  }
  throw error;
}

if (process.env.TESTS_REPORT_HANDLES) {
  why.whyIsNodeStillRunning();
}

// Force closing, but reporting of handles above
process.exit(0);

export default 1;
