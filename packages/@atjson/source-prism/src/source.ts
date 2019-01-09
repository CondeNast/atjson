import Document, { AnnotationJSON } from '@atjson/document';
import * as sax from 'sax';

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
  static fromRaw(xml: string) {
    let parser = sax.parser(false, {
      trim: false,
      normalize: false,
      lowercase: true,
      xmlns: false,
      position: true
    });

    let content = xml;
    let annotations: AnnotationJSON[] = [{
      type: '-atjson-parse-token',
      start: xml.indexOf('<?xml'),
      end: xml.indexOf('?>', xml.indexOf('<?xml')),
      attributes: {
        'atjson-reason': '<?xml>'
      }
    }];
    let partialAnnotations: Array<Partial<AnnotationJSON>> = [];

    parser.onopentag = (node) => {
      let vendorPrefix = getVendorPrefix(node.name);
      let type = getType(node.name);
      if (node.isSelfClosing) {
        annotations.push({
          type: `-${vendorPrefix}-${type}`,
          start: parser.startTagPosition,
          end: parser.position,
          attributes: prefix(vendorPrefix, node.attributes)
        }, {
          type: '-atjson-parse-token',
          start: parser.startTagPosition,
          end: parser.position,
          attributes: {
            '-atjson-reason': `<${node.name}/>`
          }
        });
      } else {
        partialAnnotations.push({
          type: `-${vendorPrefix}-${type}`,
          start: parser.startTagPosition,
          attributes: prefix(vendorPrefix, node.attributes)
        });
        annotations.push({
          type: '-atjson-parse-token',
          start: parser.startTagPosition,
          end: parser.position,
          attributes: {
            '-atjson-reason': `<${node.name}>`
          }
        });
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
        annotation as AnnotationJSON, {
        type: '-atjson-parse-token',
        start: parser.startTagPosition,
        end: parser.position,
        attributes: {
          '-atjson-reason': `</${tagName}>`
        }
      });
    };

    parser.write(xml).close();

    return new this({
      content,
      annotations
    });
  }
}
