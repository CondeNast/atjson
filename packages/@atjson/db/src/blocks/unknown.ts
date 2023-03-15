import { BlockSchema } from "../schema";

export const UnknownBlock = {
  type: "@unknown-block",
  comment: `
    Unknown block are use to stash data that
    is not formally supported by your schema.

    The data will not be dropped, but all of these
    block will be put into a single bucket.
  `,
  attributes: {
    type: {
      type: "string",
      required: true,
      comment: "The original type of the block",
    },
    attributes: {
      type: "unknown",
      required: true,
      comment: "The attributes stored on that block",
    },
  },
} as const satisfies BlockSchema;
