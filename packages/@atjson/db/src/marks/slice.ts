import { MarkSchema } from "../schema";

export const Slice = {
  type: "@slice",
  comment: `
    Slices are used to reference ranges of text,
    which other annotations can use to reference
    that text by id.

    Used commonly for features that allow for
    controlled layouts in rendering like captions,
    footnotes, etc.
  `,
  attributes: {
    refs: {
      type: "string[]",
      required: true,
      comment: "A list of ids that this slice refers to",
    },
    retain: {
      type: "boolean",
      comment: "Whether this slice should be retained in the rendering step",
    },
  },
} as const satisfies MarkSchema;
