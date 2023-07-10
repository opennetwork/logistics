import { Appointment, AppointmentData } from "./types";
import { getAppointmentStore } from "./store";
import {v4} from "uuid";

export async function setAppointment(
  data: AppointmentData & Partial<Appointment>
): Promise<Appointment> {
  const store = await getAppointmentStore();
  const updatedAt = new Date().toISOString();
  const statusAt = data.statusAt || updatedAt;
  const appointmentId = data.appointmentId || v4()
  const status = data.status || "scheduled";
  const document: Appointment = {
    type: "appointment",
    status,
    createdAt: data.createdAt || updatedAt,
    ...data,
    history: data.history || [
      {
        status,
        statusAt,
        updatedAt
      }
    ],
    appointmentId,
    updatedAt,
    statusAt,
  };
  await store.set(data.appointmentId, document);
  return document;
}