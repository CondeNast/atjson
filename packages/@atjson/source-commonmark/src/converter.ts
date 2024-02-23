import OffsetSource, {
  CodeBlock,
  DataSet,
  Table,
  Image,
} from "@atjson/offset-annotations";
import { SliceAnnotation, compareAnnotations } from "@atjson/document";
import CommonmarkSource from "./source";

function convertTables(doc: OffsetSource): void {
  doc.where({ type: "-commonmark-table" }).forEach((table) => {
    let dataColumnHeaders: string[] = [];
    let columnConfigs: Table["attributes"]["columns"] = [];
    let dataRows: Record<string, string>[] = [];

    doc
      .where(
        (annotation) =>
          annotation.type === "th" &&
          annotation.start >= table.start &&
          annotation.end <= table.end
      )
      .sort(compareAnnotations)
      .forEach((headCell) => {
        let slice = new SliceAnnotation({ ...headCell, id: undefined });
        doc.replaceAnnotation(headCell, slice);
        dataColumnHeaders.push(slice.id);

        if (headCell.attributes.style) {
          let { groups }: RegExpMatchArray = headCell.attributes.style.match(
            /(text-align: ?(?<alignment>left|right|center))/
          );

          if (groups?.alignment) {
            columnConfigs?.push({
              id: slice.id,
              textAlign: groups.alignment as "left" | "right" | "center",
            });
          }
        }
      });

    let tableRows = doc.where(
      (annotation) =>
        annotation.type === "tr" &&
        annotation.start >= table.start &&
        annotation.end <= table.end
    );

    tableRows.forEach((row) => {
      let rowEntries: [string, string][] = [];
      doc
        .where(
          (annotation) =>
            annotation.type === "td" &&
            annotation.start >= row.start &&
            annotation.end <= row.end
        )
        .sort(compareAnnotations)
        .forEach((bodyCell, index) => {
          let slice = new SliceAnnotation({ ...bodyCell, id: undefined });
          doc.replaceAnnotation(bodyCell, slice);
          rowEntries.push([dataColumnHeaders[index], slice.id]);
        });

      dataRows.push(Object.fromEntries(rowEntries));
    });

    tableRows.remove();

    let dataSet = new DataSet({
      ...table,
      id: undefined,
      attributes: { columnHeaders: dataColumnHeaders, rows: dataRows },
    });

    let dataSetSlice = new SliceAnnotation({
      ...dataSet,
      id: undefined,
      attributes: { refs: [] },
    });

    let offsetTable = new Table({
      ...table,
      id: undefined,
      attributes: { dataSet: dataSetSlice.id },
    });

    if (columnConfigs?.length) {
      offsetTable.attributes.columns = columnConfigs;
    }

    dataSetSlice.attributes.refs.push(offsetTable.id);

    doc.replaceAnnotation(table, dataSet, dataSetSlice, offsetTable);
  });

  doc.where({ type: "-commonmark-thead" }).remove();
  doc.where({ type: "-commonmark-tbody" }).remove();
}

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

    convertTables(doc);

    return doc;
  }
);
