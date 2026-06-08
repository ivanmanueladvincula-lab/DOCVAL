const baseSchema = {
  type: "object",
  properties: {
    document_name: {
      type: "string",
      description:
        "The name of the document being evaluated. Not the type of document. Do not rephrase, it must be exactly as it appears in the document. Do not include what type of document it is, just the name. For example, if the document is a Terms of Reference for a project called 'Project Alpha', the document_name should be 'Project Alpha'.",
    },
    summary: {
      type: "string",
      description: "A brief summary of the document.",
    },
    key_points: {
      type: "array",
      description: "List of key points from the document.",
      items: { type: "string" },
    },
  },
  required: ["document_name", "summary", "key_points"],
};

const torSchema = {
  ...baseSchema,
  properties: {
    ...baseSchema.properties,
    potential_issues: {
      type: "object",
      properties: {
        compliance_issues: {
          type: "array",
          description: "Array of compliance issues found in the document.",
          items: {
            type: "object",
            required: ["excerpt", "location", "explanation"],
            properties: {
              excerpt: {
                type: "string",
                description:
                  "Exact phrase from the document highlighting the issue.",
              },
              location: {
                type: "string",
                description:
                  "Location in the document where the issue was found. [section, page].",
              },
              explanation: {
                type: "string",
                description: "Explanation of why this is a compliance issue.",
              },
            },
          },
        },
        security_concerns: {
          type: "array",
          description: "Array of security concerns found in the document.",
          items: {
            type: "object",
            required: ["excerpt", "location", "explanation"],
            properties: {
              excerpt: {
                type: "string",
                description:
                  "Exact phrase from the document highlighting the issue.",
              },
              location: {
                type: "string",
                description:
                  "Location in the document where the issue was found. [section, page]",
              },
              explanation: {
                type: "string",
                description: "Explanation of why this is a security concern.",
              },
            },
          },
        },
      },
    },
    scope_of_work: {
      type: "string",
      description: "Scope of work and major activities.",
    },
    deliverables: {
      type: "array",
      description: "Expected deliverables and outputs.",
      items: { type: "string" },
    },
    timeline: {
      type: "string",
      description: "Key timelines or milestones.",
    },
    budget_summary: {
      type: "string",
      description: "Summary of budget and cost considerations, if any.",
    },
    recommendations: {
      type: "array",
      description: "Recommendations for improvement.",
      items: { type: "string" },
    },
    references: {
      type: "array",
      description: "References to relevant regulations.",
      items: { type: "string" },
    },
  },
  required: [
    ...baseSchema.required,
    "potential_issues",
    "scope_of_work",
    "deliverables",
    "timeline",
    "budget_summary",
    "recommendations",
    "references",
  ],
};

const docTypeSchema = {
  "terms of reference": torSchema,
  // "project proposal": PROJECT_PROPOSAL_SCHEMA,
};

export { baseSchema, docTypeSchema };
