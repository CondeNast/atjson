import Document, {
  AnnotationJSON,
  ObjectId,
  Ref,
  ParseAnnotation,
} from "@atjson/document";
import * as CK from "./ckeditor";
import { isTextNode, isElement, isNode, isDocumentFragment } from "./utils";

function fromNode(
  node: CK.Node | CK.DocumentFragment | null,
  { content, annotations }: { content: string; annotations: AnnotationJSON[] }
) {
  if (!node) {
    return { content, annotations };
  }

  let start = content.length;
  let attributes = {} as { [index: string]: any };
  if (isNode(node)) {
    for (let [key, value] of node.getAttributes()) {
      attributes[`-ckeditor-${key}`] = value;
    }
  }

  if (isTextNode(node)) {
    content += node.data;
    annotations.push({
      start,
      end: content.length,
      type: "-ckeditor-$text",
      attributes,
    });
  } else if (isElement(node) || isDocumentFragment(node)) {
    let name = isElement(node) ? node.name : "$root";
    let id = ObjectId();

    let openTag = `<${name}>`;
    content += openTag;
    annotations.push(
      new ParseAnnotation({
        start: content.length - openTag.length,
        end: content.length,
        attributes: {
          ref: Ref(id),
        },
      })
    );
    for (let child of node.getChildren()) {
      ({ content, annotations } = fromNode(child, { content, annotations }));
    }
    let closeTag = `</${name}>`;
    content += closeTag;
    annotations.push(
      new ParseAnnotation({
        start: content.length - closeTag.length,
        end: content.length,
        attributes: {
          ref: Ref(id),
        },
      })
    );
    annotations.push({
      id,
      start,
      end: content.length,
      type: `-ckeditor-${name}`,
      attributes,
    });
  }

  return { content, annotations };
}

export default abstract class CKEditorSource extends Document {
  static fromDocument(
    doc: CK.DocumentFragment | CK.Document,
    rootName = "main"
  ) {
    let root = (doc as CK.DocumentFragment).root
      ? (doc as CK.DocumentFragment).root
      : (doc as CK.Document).getRoot(rootName);
    let annotations: AnnotationJSON[] = [];
    let content = "";

    return fromNode(root, {
      content,
      annotations,
    });
  }
}
