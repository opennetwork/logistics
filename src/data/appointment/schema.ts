import {identifierSchema} from "../identifier";
import {happeningSchema} from "../happening";
import {attendeeSchema} from "../attendee";

const statusEnum = [
    "scheduled",
    "confirmed",
    "deferred",
    "cancelled",
    "completed"
];

export const appointmentHistoryItem = {
  type: "object",
  properties: {
    ...happeningSchema.happeningEventData.properties,
    status: {
      type: "string",
      nullable: true,
      enum: statusEnum
    },
    statusAt: {
      type: "string",
      nullable: true
    },
    updatedAt: {
      type: "string"
    }
  },
  required: ["updatedAt"]
}

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
    },
    status: {
      type: "string",
      nullable: true,
      enum: statusEnum
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
    status: {
      type: "string",
      enum: statusEnum
    },
    history: {
      type: "array",
      items: appointmentHistoryItem
    }
  },
  required: ["appointmentId", "createdAt", "updatedAt", "status"],
} as const;
