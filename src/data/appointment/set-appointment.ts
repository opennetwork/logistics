import { Appointment, AppointmentData } from "./types";
import { getAppointmentStore } from "./store";
import {v4} from "uuid";

export async function setAppointment(
  data: AppointmentData & Partial<Appointment>
): Promise<Appointment> {
  const store = await getAppointmentStore();
  const updatedAt = new Date().toISOString();
  const appointmentId = data.appointmentId || v4()
  const document: Appointment = {
    type: "appointment",
    createdAt: data.createdAt || updatedAt,
    ...data,
    appointmentId,
    updatedAt,
  };
  await store.set(data.appointmentId, document);
  return document;
}