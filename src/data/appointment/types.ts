import {HappeningData} from "../happening";

export type AppointmentType =
    | "appointment"

export interface AppointmentData extends HappeningData {
  type: AppointmentType
  organisationId?: string;
  attendees: string[];
}

export interface Appointment extends AppointmentData {
  appointmentId: string;
  createdAt: string;
  updatedAt: string;
}
