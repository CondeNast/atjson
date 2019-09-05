import { AnnotationJSON } from "@atjson/document";
import { GDocsStyleSlice } from "./types";

/*
 * Import paragraph styles.
 *
 * from gdoc.dsl_styleslices[stsl_Type='paragraph']
 *
 * Paragraph style attributes are:
 *
 *   ps_al: unknown
 *   ps_awao: unknown
 *   ps_bb: unknown
 *   ps_bbtw: unknown
 *   ps_bl: unknown
 *   ps_br: unknown
 *   ps_bt: unknown
 *   ps_hd: header (integer, 0 = none, 1+ = header level)
 *   ps_hdid: header id (?)
 *   ps_ifl: unknown
 *   ps_il: unknown
 *   ps_ir: unknown
 *   ps_klt: unknown
 *   ps_kwn: unknown
 *   ps_ls: unknown
 *   ps_ltr: unknown
 *   ps_rd: unknown
 *   ps_sa: unknown
 *   ps_sb: unknown
 *   ps_sd: unknown
 *   ps_shd: unknown
 *   ps_sm: unknown
 *
 */
export default function extractParagraphStyles(
  styles: GDocsStyleSlice[]
): AnnotationJSON[] {
  let lastParagraphStart = 0;
  let annotations: AnnotationJSON[] = [];

  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];

    if (style === null) continue;

    if (style.ps_hd !== 0) {
      annotations.push({
        type: "-gdocs-ps_hd",
        start: lastParagraphStart,
        end: i,
        attributes: {
          "-gdocs-level": style.ps_hd
        }
      });
    }

    lastParagraphStart = i + 1;
  }

  return annotations;
}
