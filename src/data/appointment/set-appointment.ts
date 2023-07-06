import { Appointment, AppointmentData } from "./types";
import { getAppointmentStore } from "./store";

export async function setAppointment(
  data: AppointmentData & Pick<Appointment, "appointmentId"> & Partial<Appointment>
): Promise<Appointment> {
  const store = await getAppointmentStore();
  const updatedAt = new Date().toISOString();
  const document: Appointment = {
    createdAt: data.createdAt || updatedAt,
    ...data,
    updatedAt,
  };
  await store.set(data.appointmentId, document);
  return document;
}