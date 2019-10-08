import * as annotations from "./annotations";

export * from "./annotations/caption-schema";
export * from "./annotations";

const OffsetSchema = {
  type: "application/vnd.atjson+offset",
  version: "1",
  annotations
} as const;

export default OffsetSchema;
