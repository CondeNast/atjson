import Document, {
  AdjacentBoundaryBehaviour,
  Annotation,
  AnnotationJSON,
  ObjectId,
  Ref,
  ParseAnnotation,
} from "@atjson/document";
import HTMLSource from "@atjson/source-html";
import * as entities from "entities";
import * as sax from "sax";
import {
  Article,
  Description,
  DocumentTypeDefinition,
  Media,
  Message,
  Title,
} from "./annotations";

function prefix(vendorPrefix: string, attributes: any): any {
  if (Array.isArray(attributes)) {
    return attributes.map(function recurseWithVendor(item: any) {
      return prefix(vendorPrefix, item);
    });
  } else if (typeof attributes === "object" && attributes != null) {
    let prefixedAttributes: any = {};
    for (let namespacedKey in attributes) {
      let [namespace, key] = namespacedKey.split(":");
      if (key == null) {
        key = namespace;
        namespace = vendorPrefix;
      }
      prefixedAttributes[`-${namespace}-${key}`] = prefix(
        vendorPrefix,
        attributes[key]
      );
    }
    return prefixedAttributes;
  } else {
    return attributes;
  }
}

function getVendorPrefix(tagName: string) {
  let [namespace, tag] = tagName.split(":");
  if (tag == null) {
    return "html";
  } else {
    return namespace;
  }
}

function getType(tagName: string) {
  let parts = tagName.split(":");
  return parts[parts.length - 1];
}

export default class PRISMSource extends Document {
  static contentType = "application/vnd.atjson+prism";
  static schema = [...HTMLSource.schema].concat([
    Article,
    Description,
    DocumentTypeDefinition,
    Media,
    Message,
    Title,
  ]);

  static fromRaw(xml: string) {
    let parser = sax.parser(false, {
      trim: false,
      normalize: false,
      lowercase: true,
      xmlns: false,
      position: true,
    });

    let content = xml;
    let annotations: Array<Annotation | AnnotationJSON> = [];

    let xmlStart = xml.indexOf("<?xml");
    let xmlEnd = xml.indexOf("?>", xmlStart) + 2;
    if (xmlStart > -1 && xmlEnd > 1) {
      let xmlTag = new DocumentTypeDefinition({
        start: xmlStart,
        end: xmlEnd,
      });
      annotations.push(
        xmlTag,
        new ParseAnnotation({
          start: xmlStart,
          end: xmlEnd,
          attributes: {
            ref: Ref(xmlTag),
          },
        })
      );
    }

    let partialAnnotations: Array<Partial<AnnotationJSON>> = [];

    parser.onopentag = function onopentag(node) {
      let vendorPrefix = getVendorPrefix(node.name);
      let type = getType(node.name);
      if (node.isSelfClosing) {
        let id = ObjectId();
        annotations.push(
          {
            id,
            type: `-${vendorPrefix}-${type}`,
            start: parser.startTagPosition - 1,
            end: parser.position,
            attributes: prefix(vendorPrefix, node.attributes),
          },
          new ParseAnnotation({
            start: parser.startTagPosition - 1,
            end: parser.position,
            attributes: {
              ref: Ref(id),
            },
          })
        );
      } else {
        let id = ObjectId();
        partialAnnotations.push({
          id,
          type: `-${vendorPrefix}-${type}`,
          start: parser.startTagPosition - 1,
          attributes: prefix(vendorPrefix, node.attributes),
        });
        annotations.push(
          new ParseAnnotation({
            start: parser.startTagPosition - 1,
            end: parser.position,
            attributes: {
              ref: Ref(id),
            },
          })
        );
      }
    };

    parser.onclosetag = function onclosetag(tagName) {
      let annotation = partialAnnotations.pop();
      if (annotation == null) {
        throw new Error(
          "Expected there to be an annotation from the opening tag, but got none."
        );
      }

      // The annotation was short closed and got a duplicate close tag action
      if (
        annotation.type !== `-${getVendorPrefix(tagName)}-${getType(tagName)}`
      ) {
        partialAnnotations.push(annotation);
        return;
      }

      annotation.end = parser.position;
      if (annotation.id == null) {
        throw new Error(
          "Missing annotation ID, unable to create annotation references"
        );
      }

      annotations.push(
        annotation as AnnotationJSON,
        new ParseAnnotation({
          start: parser.startTagPosition - 1,
          end: parser.position,
          attributes: {
            ref: Ref(annotation.id),
          },
        })
      );
    };

    parser.write(xml).close();

    let prism = new this({
      content,
      annotations,
    });

    let results = prism
      .match(/(&((#[\d]+)|(#x[\da-f]+)|(amp)|(quot)|(apos)|(lt)|(gt));)/gi)
      .reverse();

    for (let { start, end, matches } of results) {
      let entity = entities.decodeXML(matches[0]);
      prism.insertText(start, entity, AdjacentBoundaryBehaviour.preserve);
      prism.deleteText(start + entity.length, end + entity.length);
    }

    return prism;
  }
}
