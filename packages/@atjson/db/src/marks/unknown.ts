import { MarkSchema } from "../schema";

export const UnknownMark = {
  type: "@unknown-mark",
  comment: `
    Unknown marks are use to stash data that
    is not formally supported by your schema.

    The data will not be dropped, but all of these
    marks will be put into a single bucket.
  `,
  attributes: {
    type: {
      type: "string",
      required: true,
      comment: "The original type of the mark",
    },
    attributes: {
      type: "unknown",
      required: true,
      comment: "The attributes stored on that mark",
    },
  },
} as const satisfies MarkSchema;
