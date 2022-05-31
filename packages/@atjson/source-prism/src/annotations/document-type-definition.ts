import { ObjectAnnotation } from "@atjson/document";

export class DocumentTypeDefinition extends ObjectAnnotation {
  static vendorPrefix = "xml";
  static type = "dtd";
}
