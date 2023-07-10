import {getHappeningTree, HappeningTree} from "../happening";
import {createAppointmentHappeningTreeContext} from "./create-appointment-happening-context";
import {Appointment, AppointmentHistoryItem, AppointmentStatus} from "./types";
import {getAppointment} from "./get-appointment";
import {ok} from "../../is";

export interface AppointmentTree extends HappeningTree, Pick<Appointment, "status" | "statusAt" | "history"> {
}

export async function getAppointmentTree(appointmentId: string): Promise<AppointmentTree> {
    const appointment = await getAppointment(appointmentId);
    ok(appointment, "Could not find appointment");
    const context = createAppointmentHappeningTreeContext({
        happenings: [
            appointment
        ]
    });
    const tree = await getHappeningTree(appointmentId, context);
    const { status, statusAt, history} = appointment;
    return {
        ...tree,
        status,
        statusAt,
        history
    }
}