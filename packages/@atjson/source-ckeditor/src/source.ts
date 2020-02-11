import Document, { AnnotationJSON } from "@atjson/document";
import * as CK from "./ckeditor";
import { isTextNode, isElement } from "./utils";

function fromNode(
  node: CK.Node | null,
  { content, annotations }: { content: string; annotations: AnnotationJSON[] }
) {
  if (!node) {
    return { content, annotations };
  }

  let start = content.length;
  let attributes = {} as { [index: string]: any };
  for (let [key, value] of node.getAttributes()) {
    attributes[`-ckeditor-${key}`] = value;
  }

  if (isTextNode(node)) {
    content += node.data;
    annotations.push({
      start,
      end: content.length,
      type: "-ckeditor-$text",
      attributes
    });
  } else if (isElement(node)) {
    for (let child of node.getChildren()) {
      ({ content, annotations } = fromNode(child, { content, annotations }));
    }
    annotations.push({
      start,
      end: content.length,
      type: `-ckeditor-${node.name}`,
      attributes
    });
  }

  return { content, annotations };
}

export default abstract class CKEditorSource extends Document {
  static fromModel(model: CK.Model, rootName = "main") {
    let root = model.document.getRoot(rootName);
    let annotations: AnnotationJSON[] = [];
    let content = "";

    return fromNode(root, {
      content,
      annotations
    });
  }
}
