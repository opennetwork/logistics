import {FastifyInstance} from "fastify";
import { addAppointment, AppointmentData, appointmentSchema } from "../../data";
import { authenticate } from "../authentication";

export async function addAppointmentRoutes(fastify: FastifyInstance) {
  type Schema = {
    Body: AppointmentData;
  };

  const response = {
    201: {
      description: "A new appointment",
      ...appointmentSchema.appointment,
    },
  };

  const schema = {
    description: "Add a new appointment",
    tags: ["appointment"],
    summary: "",
    body: appointmentSchema.appointmentData,
    response,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  try {
    fastify.post<Schema>("/", {
      schema,
      preHandler: authenticate(fastify),
      async handler(request, response) {
        const appointment = await addAppointment(request.body);
        response.status(201);
        response.send(appointment);
      },
    });
  } catch {}
}
