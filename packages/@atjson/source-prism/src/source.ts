import Document, { Annotation, AnnotationJSON, ParseAnnotation } from '@atjson/document';
import HTMLSource from '@atjson/source-html';
import * as entities from 'entities';
import * as sax from 'sax';
import {
  Body,
  Head,
  Media,
  Message
} from './annotations';

function prefix(vendorPrefix: string, attributes: any): any {
  if (Array.isArray(attributes)) {
    return attributes.map((item: any) => prefix(vendorPrefix, item));
  } else if (typeof attributes === 'object' && attributes != null) {
    return Object.keys(attributes).reduce((prefixedAttributes: any, namespacedKey: string) => {
      let [namespace, key] = namespacedKey.split(':');
      if (key == null) {
        key = namespace;
        namespace = vendorPrefix;
      }
      prefixedAttributes[`-${namespace}-${key}`] = prefix(vendorPrefix, attributes[key]);
      return prefixedAttributes;
    }, {} as any);
  } else {
    return attributes;
  }
}

function getVendorPrefix(tagName: string) {
  let [namespace, tag] = tagName.split(':');
  if (tag == null) {
    return 'html';
  } else {
    return namespace;
  }
}

function getType(tagName: string) {
  let parts = tagName.split(':');
  return parts[parts.length - 1];
}

export default class PRISMSource extends Document {
  static contentType = 'application/vnd.atjson+prism';
  static schema = [...HTMLSource.schema].concat([
    Body,
    Head,
    Media,
    Message
  ]);

  static fromRaw(xml: string) {
    let parser = sax.parser(false, {
      trim: false,
      normalize: false,
      lowercase: true,
      xmlns: false,
      position: true
    });

    let content = xml;
    let xmlStart = xml.indexOf('<?xml');
    let xmlEnd = xml.indexOf('?>', xmlStart) + 2;
    let annotations: Array<Annotation | AnnotationJSON> = [new ParseAnnotation({
      start: xmlStart,
      end: xmlEnd,
      attributes: {
        reason: '<?xml>'
      }
    })];
    let partialAnnotations: Array<Partial<AnnotationJSON>> = [];

    parser.onopentag = (node) => {
      let vendorPrefix = getVendorPrefix(node.name);
      let type = getType(node.name);
      if (node.isSelfClosing) {
        annotations.push({
          type: `-${vendorPrefix}-${type}`,
          start: parser.startTagPosition - 1,
          end: parser.position,
          attributes: prefix(vendorPrefix, node.attributes)
        }, new ParseAnnotation({
          start: parser.startTagPosition - 1,
          end: parser.position,
          attributes: {
            reason: `<${node.name}/>`
          }
        }));
      } else {
        partialAnnotations.push({
          type: `-${vendorPrefix}-${type}`,
          start: parser.startTagPosition - 1,
          attributes: prefix(vendorPrefix, node.attributes)
        });
        annotations.push(new ParseAnnotation({
          start: parser.startTagPosition - 1,
          end: parser.position,
          attributes: {
            reason: `<${node.name}>`
          }
        }));
      }
    };

    parser.onclosetag = (tagName) => {
      let annotation = partialAnnotations.pop()!;

      // The annotation was short closed and got a duplicate close tag action
      if (annotation.type !== `-${getVendorPrefix(tagName)}-${getType(tagName)}`) {
        partialAnnotations.push(annotation);
        return;
      }

      annotation.end = parser.position;

      annotations.push(
        annotation as AnnotationJSON,
        new ParseAnnotation({
          start: parser.startTagPosition - 1,
          end: parser.position,
          attributes: {
            reason: `</${tagName}>`
          }
        })
      );
    };

    parser.write(xml).close();

    let prism = new this({
      content,
      annotations
    });

    while (true) {
      let match = /(&#[\d]+;)/.exec(prism.content);
      if (match == null) {
        break;
      }

      let start = match.index;
      let end = start + match[0].length;
      let character = entities.decodeXML(match[0]);
      prism.insertText(start, character);
      prism.deleteText(start + 1, end + 1);
    }

    return prism;
  }
}
