import * as Annotations from "./annotations";

const { CaptionSchema, ...annotations } = Annotations;

export * from "./annotations";
export * from "./utils";

const OffsetSchema = {
  annotations
} as const;

export default OffsetSchema;
