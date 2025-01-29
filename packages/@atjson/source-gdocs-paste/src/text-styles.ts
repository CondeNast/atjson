import { AnnotationJSON } from "@atjson/document";
import { GDocsStyleSlice } from "./types";

interface ParseState {
  [key: string]: AnnotationJSON;
}

export default function extractTextStyles(
  styles: GDocsStyleSlice[],
  _entityMap: unknown,
  _trailing: unknown,
  content: string
): AnnotationJSON[] {
  let state: ParseState = {};
  let annotations: AnnotationJSON[] = [];

  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];

    if (style === null) continue;

    // Handle subscript and superscript
    if (style.ts_va !== "nor" && !state.ts_va) {
      state.ts_va = {
        type: "-gdocs-ts_va",
        attributes: {
          "-gdocs-va": style.ts_va,
        },
        start: i,
        end: -1,
      };
    } else if (
      style.ts_va === "nor" &&
      style.ts_va_i === false &&
      state.ts_va
    ) {
      state.ts_va.end = i;
      annotations.push(state.ts_va);
      delete state.ts_va;
    }

    // Add text style font size ("ts_fs") annotations
    if (
      style.ts_fs &&
      (state.ts_fs == null ||
        style.ts_fs !==
          (state.ts_fs.attributes as Record<string, string>)["-gdocs-size"])
    ) {
      if (state.ts_fs) {
        state.ts_fs.end = i;
        annotations.push(state.ts_fs);
      }
      state.ts_fs = {
        type: "-gdocs-ts_fs",
        attributes: {
          "-gdocs-size": style.ts_fs,
        },
        start: i,
        // font sizes are only stored in the paste data at the index where they change
        // so the length of the trailing font size range isn't reflected in the style entries
        end: content.length,
      };
    }

    for (let styleType of ["ts_bd", "ts_it", "ts_un", "ts_st", "ts_sc"]) {
      if (style[styleType] === true && !state[styleType]) {
        state[styleType] = {
          type: "-gdocs-" + styleType,
          start: i,
          end: -1,
          attributes: {},
        };
      } else if (
        style[styleType] === false &&
        style[styleType + "_i"] === false &&
        state[styleType]
      ) {
        state[styleType].end = i;
        annotations.push(state[styleType]);
        delete state[styleType];
      }
    }
  }

  // Close any remaining open styles
  for (let key in state) {
    let annotation = state[key];
    if (annotation.end === -1) {
      annotation.end = styles.length - 1;
    }
    annotations.push(annotation);
  }

  return annotations;
}
