import { getKeyValueStore } from "../kv";
import { Appointment } from "./types";
import {getHappeningStore} from "../happening";

const STORE_NAME = "appointment" as const;

export function getAppointmentStore() {
  return getHappeningStore<Appointment>(STORE_NAME, {
    counter: true
  });
}
