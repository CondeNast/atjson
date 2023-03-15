import { MarkSchema } from "../schema";

export const ParseToken = {
  type: "@parse",
  comment: `
    A mark used to indicate markup text that
    is not part of the text intended to be read.
    
    In HTML, this mark will be over HTML tags,
    like \`<a>\` or \`<p>\`. To optimize your
    document, it is encouraged to remove all
    parse tokens and replace them with the
    appropriate blocks, as it will cause the
    array to become so large that V8 deoptimizes it.
  `,
  attributes: {},
} as const satisfies MarkSchema;
