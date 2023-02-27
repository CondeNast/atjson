import OffsetSource, { CodeBlock, Image } from "@atjson/offset-annotations";
import CommonmarkSource from "./source";

CommonmarkSource.defineConverterTo(
  OffsetSource,
  function commonmarkToOffset(doc) {
    doc
      .where({ type: "-commonmark-blockquote" })
      .set({ type: "-offset-blockquote" });
    doc
      .where({ type: "-commonmark-bullet_list" })
      .set({ type: "-offset-list", attributes: { "-offset-type": "bulleted" } })
      .rename({ attributes: { "-commonmark-loose": "-offset-loose" } });
    doc.where({ type: "-commonmark-code_block" }).set({
      type: "-offset-code-block",
    });
    doc
      .where({ type: "-commonmark-code_inline" })
      .set({ type: "-offset-code", attributes: { "-offset-style": "inline" } });
    doc.where({ type: "-commonmark-em" }).set({ type: "-offset-italic" });
    doc.where({ type: "-commonmark-fence" }).update((fence) => {
      doc.replaceAnnotation(
        fence,
        new CodeBlock({
          start: fence.start,
          end: fence.end,
          attributes: {
            info: fence.attributes.info ?? "",
          },
        })
      );
    });

    doc
      .where({ type: "-commonmark-hardbreak" })
      .set({ type: "-offset-line-break" });
    doc
      .where({ type: "-commonmark-heading" })
      .set({ type: "-offset-heading" })
      .rename({ attributes: { "-commonmark-level": "-offset-level" } });
    doc
      .where({ type: "-commonmark-hr" })
      .set({ type: "-offset-horizontal-rule" });
    doc
      .where({ type: "-commonmark-html_block" })
      .set({ type: "-offset-html", attributes: { "-offset-style": "block" } });
    doc
      .where({ type: "-commonmark-html_inline" })
      .set({ type: "-offset-html", attributes: { "-offset-style": "inline" } });

    doc.where({ type: "-commonmark-image" }).update((image) => {
      doc.replaceAnnotation(
        image,
        new Image({
          start: image.start,
          end: image.end,
          attributes: {
            url: image.attributes.src,
            title: image.attributes.title,
            description: image.attributes.alt,
          },
        })
      );
    });

    doc
      .where({ type: "-commonmark-link" })
      .set({ type: "-offset-link" })
      .rename({
        attributes: {
          "-commonmark-href": "-offset-url",
          "-commonmark-title": "-offset-title",
        },
      });
    doc
      .where({ type: "-commonmark-list_item" })
      .set({ type: "-offset-list-item" });
    doc
      .where({ type: "-commonmark-ordered_list" })
      .set({ type: "-offset-list", attributes: { "-offset-type": "numbered" } })
      .rename({
        attributes: {
          "-commonmark-start": "-offset-startsAt",
          "-commonmark-loose": "-offset-loose",
        },
      });
    doc
      .where({ type: "-commonmark-paragraph" })
      .set({ type: "-offset-paragraph" });
    doc.where({ type: "-commonmark-strong" }).set({ type: "-offset-bold" });

    return doc;
  }
);
