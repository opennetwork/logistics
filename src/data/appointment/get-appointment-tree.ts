import {getHappeningTree, HappeningTree} from "../happening";
import {createAppointmentHappeningTreeContext} from "./create-appointment-happening-context";
import {Appointment} from "./types";
import {getAppointment} from "./get-appointment";
import {ok} from "../../is";
import {Location} from "../location";

export interface AppointmentTree extends HappeningTree, Pick<Appointment, "status" | "statusAt" | "history"> {
    location?: Location;
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