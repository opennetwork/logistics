import {identifierSchema} from "../identifier";
import {happeningSchema} from "../happening";
import {attendeeSchema} from "../attendee";

export const appointmentData = {
  type: "object",
  properties: {
    ...happeningSchema.happeningData.properties,
    attendees: {
      type: "array",
      items: {
        anyOf: [
          attendeeSchema.attendeeData,
          {
            type: "string"
          }
        ]
      },
      nullable: true,
    },
    title: {
      type: "string",
      nullable: true
    },
    identifiers: {
      type: "array",
      items: identifierSchema.identifier,
      nullable: true
    }
  }
} as const;

export const appointment = {
  type: "object",
  properties: {
    ...appointmentData.properties,
    ...happeningSchema.happeningData.properties,
    appointmentId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
  },
  required: ["appointmentId", "createdAt", "updatedAt"],
} as const;
