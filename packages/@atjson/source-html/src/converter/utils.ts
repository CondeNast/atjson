import { TextAlignment } from "@atjson/offset-annotations";

export function parseCSS(css: string | undefined) {
  let rules = (css || "").split(";");
  let styles: Record<string, string> = {};
  for (let rule of rules) {
    let [name, ...value] = rule.split(":");
    if (value.length > 0) {
      styles[name] = value.join(":").trim();
    }
  }
  return styles;
}

const RightToLeftAlignment = {
  start: TextAlignment.Start,
  left: TextAlignment.End,
  right: TextAlignment.Start,
  end: TextAlignment.End,
  center: TextAlignment.Center,
  justify: TextAlignment.Justify,
} as { [key: string]: TextAlignment | undefined };

const LeftToRightAlignment = {
  start: TextAlignment.Start,
  left: TextAlignment.Start,
  right: TextAlignment.End,
  end: TextAlignment.End,
  center: TextAlignment.Center,
  justify: TextAlignment.Justify,
} as { [key: string]: TextAlignment | undefined };

/**
 *
 * @param alignment The `text-align` property of the
 * @param language The language code of
 */
export function toTextAlignment(
  alignment: string | undefined,
  direction: string | undefined
) {
  if (alignment == null) {
    return alignment;
  }

  if (direction === "rtl") {
    return RightToLeftAlignment[alignment];
  }
  return LeftToRightAlignment[alignment];
}
