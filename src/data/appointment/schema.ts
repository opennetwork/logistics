import {identifierSchema} from "../identifier";
import {happeningSchema} from "../happening";

export const appointmentData = {
  type: "object",
  properties: {
    ...happeningSchema.happeningData,
    title: {
      type: "string",
    },
    identifiers: {
      type: "array",
      items: identifierSchema.identifier
    }
  },
  required: ["identifiers", "title"],
} as const;

export const appointment = {
  type: "object",
  properties: {
    appointmentId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...appointmentData.properties,
  },
  required: ["appointmentId", "createdAt", "updatedAt", ...appointmentData.required],
} as const;
