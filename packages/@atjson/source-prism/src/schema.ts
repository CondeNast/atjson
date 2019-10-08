import { schema as HTMLSchema } from "@atjson/source-html";
import * as annotations from "./annotations";

const PRISMSchema = {
  type: "application/vnd.atjson+prism",
  version: "1",
  annotations: {
    ...HTMLSchema.annotations,
    ...annotations
  }
};

export default PRISMSchema;
