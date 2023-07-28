export const membershipData = {
    type: "object",
    properties: {
        reference: {
            type: "string"
        },
        name: {
            type: "string",
            nullable: true
        },
        email: {
            type: "string",
            nullable: true
        },
        membershipId: {
            type: "string",
            nullable: true
        },
        createdAt: {
            type: "string",
            nullable: true
        },
    },
    additionalProperties: true,
    required: [
        "reference"
    ]
}

export const membership = {
    type: "object",
    properties: {
        ...membershipData.properties,
        membershipId: {
            type: "string",
        },
        createdAt: {
            type: "string",
        },
    },
    additionalProperties: true,
    required: [
        ...membershipData.required,
        "membershipId",
        "createdAt"
    ]
}