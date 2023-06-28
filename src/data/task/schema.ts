import {identifierSchema} from "../identifier";

export const taskData = {
  type: "object",
  properties: {
    taskName: {
      type: "string"
    },
    identifiers: {
      type: "array",
      items: identifierSchema.identifier
    }
  },
  required: ["taskName", "identifiers"],
} as const;

export const task = {
  type: "object",
  properties: {
    taskId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...taskData.properties,
  },
  required: ["taskId", "createdAt", "updatedAt", ...taskData.required],
} as const;
