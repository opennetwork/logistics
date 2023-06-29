export const happeningData = {
  type: "object",
  properties: {
    attendees: {
      type: "array",
      items: {
        type: "string"
      },
      nullable: true,
    },
    startAt: {
      type: "string",
      nullable: true,
    },
    startedAt: {
      type: "string",
      nullable: true,
    },
    endAt: {
      type: "string",
      nullable: true,
    },
    endedAt: {
      type: "string",
      nullable: true,
    },
    createdAt: {
      type: "string",
      nullable: true,
    },
    title: {
      type: "string",
      nullable: true,
    },
    description: {
      type: "string",
      nullable: true,
    },
  },
} as const;

export const happening = {
  type: "object",
  properties: {
    happeningId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...happeningData.properties,
  },
  required: ["happeningId", "createdAt", "updatedAt"],
} as const;
