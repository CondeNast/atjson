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

const RightToLeft = [
  "ar",
  "arc",
  "dv",
  "fa",
  "ha",
  "he",
  "khw",
  "ks",
  "ku",
  "ps",
  "ur",
  "yi",
];

const RightToLeftAlignment = {
  left: "end",
  right: "start",
  center: "center",
  justify: "justify",
} as { [key: string]: "start" | "end" | "center" | "justify" | undefined };

const LeftToRightAlignment = {
  left: "start",
  right: "end",
  center: "center",
  justify: "justify",
} as { [key: string]: "start" | "end" | "center" | "justify" | undefined };

/**
 *
 * @param alignment The `text-align` property of the
 * @param language The language code of
 */
export function toAlignment(
  alignment: string | undefined,
  language: string | undefined
) {
  if (alignment == null) {
    return alignment;
  }

  let [languageCode] = (language || "").toLowerCase().split("-");
  if (RightToLeft.indexOf(languageCode) !== -1) {
    return RightToLeftAlignment[alignment];
  }
  return LeftToRightAlignment[alignment];
}
