import * as T from "./tokens";
import { is } from "./token-stream";

type TokenStream = Array<T.Token | string>;

export function addDelimitersToLists(stream: TokenStream) {
  let result: TokenStream = [];
  let delimiters: {
    delimiter: "." | ")" | "*" | "-";
    value?: number;
  }[] = [];
  let lastDelimiter:
    | {
        delimiter: "." | ")" | "*" | "-";
        value?: number;
      }
    | undefined = undefined;

  for (let i = 0, len = stream.length; i < len; i++) {
    let current = stream[i];
    let previous = stream[i - 1];

    // Disambiguate between adjacent lists by rotating through
    // delimiters that are available as per the commonmark spec
    if (is(current, T.NumberedListStart)) {
      if (is(previous, T.NumberedListEnd) && lastDelimiter) {
        if (lastDelimiter.delimiter === ".") {
          delimiters.unshift({
            value: current.startsAt,
            delimiter: ")"
          });
        } else {
          delimiters.unshift({
            value: current.startsAt,
            delimiter: "."
          });
        }
      } else {
        delimiters.unshift({
          value: current.startsAt,
          delimiter: "."
        });
      }
    } else if (is(current, T.NumberedListEnd)) {
      lastDelimiter = delimiters.shift();
    }

    if (is(current, T.BulletedListStart)) {
      if (is(previous, T.BulletedListEnd) && lastDelimiter) {
        if (lastDelimiter.delimiter === "-") {
          delimiters.unshift({
            delimiter: "*"
          });
        } else {
          delimiters.unshift({
            delimiter: "-"
          });
        }
      } else {
        delimiters.unshift({
          delimiter: "-"
        });
      }
    } else if (is(current, T.BulletedListEnd)) {
      lastDelimiter = delimiters.shift();
    }

    if (is(current, T.ListItemStart)) {
      let delimiter = delimiters[0];

      if (delimiter.value != null) {
        result.push({
          kind: current.kind,
          value: `${delimiter.value}${delimiter.delimiter} `
        });
        delimiter.value++;
      } else {
        result.push({
          kind: current.kind,
          value: `${delimiter.delimiter} `
        });
      }
    } else if (is(current, T.ThematicBreak)) {
      // If you want a thematic break in a list item, use a different bullet:
      // https://spec.commonmark.org/0.29/#example-31
      let delimiter = delimiters[0];
      if (delimiter.delimiter === "*") {
        result.push(T.ThematicBreak("-"));
      }
    } else {
      result.push(current);
    }
  }
  return result;
}
