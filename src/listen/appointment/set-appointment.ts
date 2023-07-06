import {FastifyInstance} from "fastify";
import {getAppointment, AppointmentData, appointmentSchema, setAppointment} from "../../data";
import { authenticate } from "../authentication";

export async function setAppointmentRoutes(fastify: FastifyInstance) {
  type Schema = {
    Body: AppointmentData;
    Params: {
      appointmentId: string;
    }
  };

  const params = {
    type: "object",
    properties: {
      appointmentId: {
        type: "string",
      },
    },
    required: ["appointmentId"],
  };

  const response = {
    200: {
      description: "Updated appointment",
      ...appointmentSchema.appointment,
    },
  };

  const schema = {
    description: "Update an existing appointment",
    tags: ["appointment"],
    summary: "",
    body: appointmentSchema.appointmentData,
    response,
    params,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  try {
    fastify.put<Schema>("/:appointmentId", {
      schema,
      preHandler: authenticate(fastify),
      async handler(request, response) {
        const { appointmentId } = request.params;
        const existing = await getAppointment(appointmentId);
        const appointment = await setAppointment({
          // Completely replace excluding created at
          // createdAt must come from the server
          ...request.body,
          createdAt: existing?.createdAt,
          appointmentId
        });
        response.status(200);
        response.send(appointment);
      },
    });
  } catch {}
}
