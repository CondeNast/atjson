import OffsetSource, {
  Blockquote,
  Bold,
  Code,
  CodeBlock,
  HTML,
  Heading,
  HorizontalRule,
  Image,
  Italic,
  LineBreak,
  Link,
  List,
  ListItem,
  Paragraph,
} from "@atjson/offset-annotations";
import CommonmarkSource from "./source";
import {
  BulletList as CommonmarkBulletList,
  Heading as CommonmarkHeading,
  Image as CommonmarkImage,
  Link as CommonmarkLink,
  ListItem as CommonmarkListItem,
  OrderedList as CommonmarkOrderedList,
} from "./annotations";

CommonmarkSource.defineConverterTo(
  OffsetSource,
  function commonmarkToOffset(doc) {
    doc.where({ type: "-commonmark-blockquote" }).update((blockquote) => {
      doc.replaceAnnotation(
        blockquote,
        new Blockquote({
          id: blockquote.id,
          start: blockquote.start,
          end: blockquote.end,
        })
      );
    });

    doc
      .where({ type: "-commonmark-bullet_list" })
      .update((list: CommonmarkBulletList) => {
        doc.replaceAnnotation(
          list,
          new List({
            id: list.id,
            start: list.start,
            end: list.end,
            attributes: {
              type: "bulleted",
              loose: list.attributes.loose,
            },
          })
        );
      });

    doc.where({ type: "-commonmark-code_block" }).update((code) => {
      doc.replaceAnnotation(
        code,
        new CodeBlock({
          id: code.id,
          start: code.start,
          end: code.end,
          attributes: {},
        })
      );
    });

    doc.where({ type: "-commonmark-code_inline" }).update((code) => {
      doc.replaceAnnotation(
        code,
        new Code({
          id: code.id,
          start: code.start,
          end: code.end,
        })
      );
    });

    doc.where({ type: "-commonmark-em" }).update((emphasis) => {
      doc.replaceAnnotation(
        emphasis,
        new Italic({
          id: emphasis.id,
          start: emphasis.start,
          end: emphasis.end,
          attributes: emphasis.attributes,
        })
      );
    });

    doc.where({ type: "-commonmark-fence" }).update((fence) => {
      doc.replaceAnnotation(
        fence,
        new CodeBlock({
          id: fence.id,
          start: fence.start,
          end: fence.end,
          attributes: {
            info: fence.attributes.info ?? "",
          },
        })
      );
    });

    doc.where({ type: "-commonmark-hardbreak" }).update((linebreak) => {
      doc.replaceAnnotation(
        linebreak,
        new LineBreak({
          id: linebreak.id,
          start: linebreak.start,
          end: linebreak.end,
        })
      );
    });

    doc
      .where({ type: "-commonmark-heading" })
      .update((heading: CommonmarkHeading) => {
        let { level, ...attributes } = heading.attributes;
        doc.replaceAnnotation(
          heading,
          new Heading({
            id: heading.id,
            start: heading.start,
            end: heading.end,
            attributes: {
              level: Math.min(Math.max(level, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6,
              ...attributes,
            },
          })
        );
      });

    doc.where({ type: "-commonmark-hr" }).update((rule) => {
      doc.replaceAnnotation(
        rule,
        new HorizontalRule({
          id: rule.id,
          start: rule.start,
          end: rule.end,
        })
      );
    });

    doc.where({ type: "-commonmark-html_block" }).update((html) => {
      doc.replaceAnnotation(
        html,
        new HTML({
          id: html.id,
          start: html.start,
          end: html.end,
          attributes: {
            style: "block",
          },
        })
      );
    });

    doc.where({ type: "-commonmark-html_inline" }).update((html) => {
      doc.replaceAnnotation(
        html,
        new HTML({
          id: html.id,
          start: html.start,
          end: html.end,
          attributes: {
            style: "inline",
          },
        })
      );
    });

    doc
      .where({ type: "-commonmark-image" })
      .update((image: CommonmarkImage) => {
        doc.replaceAnnotation(
          image,
          new Image({
            id: image.id,
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

    doc.where({ type: "-commonmark-link" }).update((link: CommonmarkLink) => {
      let { href, title, ...attributes } = link.attributes;
      doc.replaceAnnotation(
        link,
        new Link({
          id: link.id,
          start: link.start,
          end: link.end,
          attributes: {
            url: href,
            title,
            ...attributes,
          },
        })
      );
    });

    doc
      .where({ type: "-commonmark-list_item" })
      .update((listItem: CommonmarkListItem) => {
        doc.replaceAnnotation(
          listItem,
          new ListItem({
            id: listItem.id,
            start: listItem.start,
            end: listItem.end,
            attributes: listItem.attributes,
          })
        );
      });

    doc
      .where({ type: "-commonmark-ordered_list" })
      .update((list: CommonmarkOrderedList) => {
        doc.replaceAnnotation(
          list,
          new List({
            id: list.id,
            start: list.start,
            end: list.end,
            attributes: {
              type: "numbered",
              startsAt: list.attributes.start,
              loose: list.attributes.loose,
            },
          })
        );
      });

    doc.where({ type: "-commonmark-paragraph" }).update((paragraph) => {
      doc.replaceAnnotation(
        paragraph,
        new Paragraph({
          id: paragraph.id,
          start: paragraph.start,
          end: paragraph.end,
          attributes: paragraph.attributes,
        })
      );
    });

    doc.where({ type: "-commonmark-strong" }).update((strong) => {
      doc.replaceAnnotation(
        strong,
        new Bold({
          id: strong.id,
          start: strong.start,
          end: strong.end,
        })
      );
    });

    return doc;
  }
);
