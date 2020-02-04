// The destination can only contain spaces if it is enclosed in pointy brackets
// https://spec.commonmark.org/0.29/#link-destination
export function linkDestination(destination: string) {
  if (destination.match(/[\(\s\)]/)) {
    return `<${destination}>`;
  } else {
    return destination;
  }
}

// A sequence of zero or more characters between straight double-quote
// characters("), including a " character only if it is backslash - escaped
// or
// a sequence of zero or more characters between straight single-quote
// characters('), including a ' character only if it is backslash - escaped
// https://spec.commonmark.org/0.29/#link-title
export function linkTitle(title?: string) {
  if (title != null) {
    if (title.indexOf("'") === -1 && title.indexOf('"') !== -1) {
      return ` '${title.replace(/'/g, "\\'")}'`;
    }
    return ` "${title.replace(/"/g, '\\"')}"`;
  }
  return "";
}
