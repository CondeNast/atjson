import Document, { Ref, ParseAnnotation } from "@atjson/document";
import { attrs, regexp } from "@wordpress/shortcode";
import { Shortcode } from "./annotations";

const REGEXP = regexp("[a-zA-Z_]+");

function parse(text: string) {
  let match;
  let annotations = [];

  while ((match = REGEXP.exec(text)) !== null) {
    if ("[" === match[1] && "]" === match[7]) {
      continue;
    }
    let end = REGEXP.lastIndex;
    let start = end - match[0].length;
    let type: "single" | "self-closing" | "closed";
    if (match[4]) {
      type = "self-closing";
    } else if (match[6]) {
      type = "closed";
    } else {
      type = "single";
    }

    let shortcode = new Shortcode({
      start,
      end,
      attributes: {
        tag: match[2],
        type,
        attrs: attrs(match[3]),
      },
    });
    annotations.push(shortcode);

    if (match[5] == null) {
      annotations.push(
        new ParseAnnotation({
          start,
          end,
          attributes: {
            ref: Ref(shortcode),
          },
        })
      );
    } else {
      let openingShortcodeEnd = start + match[2].length + match[3].length + 2;
      let endingShortcodeStart = openingShortcodeEnd + match[5].length;
      annotations.push(
        new ParseAnnotation({
          start,
          end: openingShortcodeEnd,
          attributes: {
            ref: Ref(shortcode),
          },
        }),
        new ParseAnnotation({
          start: endingShortcodeStart,
          end,
          attributes: {
            ref: Ref(shortcode),
          },
        })
      );
    }
  }

  return annotations;
}

export default class WordpressShortcodeSource extends Document {
  static contentType = "application/vnd.atjson+wordpress";
  static schema = [Shortcode];
  static fromRaw(content: string) {
    return new this({
      content,
      annotations: parse(content),
    });
  }
}
