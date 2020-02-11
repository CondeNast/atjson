import Document, { Annotation } from "@atjson/document";

export default class CKEditorSource extends Document {
  static fromRaw(model: CKEditor.Model) {
    let annotations: Annotation<any>[] = [];
    let content = "";

    return new this({
      content,
      annotations
    });
  }
}
