import {getHappeningTree} from "../happening";
import {createAppointmentHappeningTreeContext} from "./create-appointment-happening-context";

export async function getAppointmentTree(appointmentId: string) {
    return getHappeningTree(appointmentId, createAppointmentHappeningTreeContext());
}