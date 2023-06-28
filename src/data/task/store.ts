import { getKeyValueStore } from "../kv";
import { Task } from "./types";

const STORE_NAME = "task" as const;

export function getTaskStore() {
  return getKeyValueStore<Task>(STORE_NAME, {
    counter: true
  });
}
