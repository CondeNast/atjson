import OffsetSource from "@atjson/offset-annotations";
import CommonmarkSource from "./source";

CommonmarkSource.defineConverterTo(OffsetSource, function commonmarkToOffset(
  doc
) {
  doc
    .where({ type: "-commonmark-blockquote" })
    .set({ type: "-offset-blockquote" });
  doc
    .where({ type: "-commonmark-bullet_list" })
    .set({ type: "-offset-list", attributes: { type: "bulleted" } });

  doc
    .where({ type: "-commonmark-code_block" })
    .set({ type: "-offset-code", attributes: { style: "block" } });
  doc
    .where({ type: "-commonmark-code_inline" })
    .set({ type: "-offset-code", attributes: { style: "inline" } });
  doc.where({ type: "-commonmark-em" }).set({ type: "-offset-italic" });
  doc
    .where({ type: "-commonmark-fence" })
    .set({ type: "-offset-code", attributes: { style: "fence" } });

  doc
    .where({ type: "-commonmark-hardbreak" })
    .set({ type: "-offset-line-break" });
  doc
    .where({ type: "-commonmark-heading" })
    .set({ type: "-offset-heading" })
    .rename({ attributes: { level: "level" } });

  doc
    .where({ type: "-commonmark-hr" })
    .set({ type: "-offset-horizontal-rule" });
  doc
    .where({ type: "-commonmark-html_block" })
    .set({ type: "-offset-html", attributes: { style: "block" } });
  doc
    .where({ type: "-commonmark-html_inline" })
    .set({ type: "-offset-html", attributes: { style: "inline" } });

  doc
    .where({ type: "-commonmark-image" })
    .set({ type: "-offset-image" })
    .rename({
      attributes: {
        "src": "url",
        "title": "title",
        "alt": "description"
      }
    });

  doc
    .where({ type: "-commonmark-link" })
    .set({ type: "-offset-link" })
    .rename({
      attributes: {
        href: "url"
      }
    });
  doc
    .where({ type: "-commonmark-list_item" })
    .set({ type: "-offset-list-item" });
  doc
    .where({ type: "-commonmark-ordered_list" })
    .set({ type: "-offset-list", attributes: { type: "numbered" } })
    .rename({
      attributes: {
        start: "startsAt"
      }
    });
  doc
    .where({ type: "-commonmark-paragraph" })
    .set({ type: "-offset-paragraph" });
  doc.where({ type: "-commonmark-strong" }).set({ type: "-offset-bold" });

  return doc;
});
