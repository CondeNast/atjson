import { SliceAnnotation, serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import CommonmarkRenderer from "../src";

describe("tables", () => {
  test("with column headings", () => {
    let document = new OffsetSource({
      content: "column 1 column 2 data 1.1 data 1.2",
      annotations: [
        {
          type: "-offset-data-set",
          id: "dataSetId",
          start: 0,
          end: 35,
          attributes: {
            columns: [
              { name: "column 1", slice: "column1id", type: "peritext" },
              { name: "column 2", slice: "column2id", type: "peritext" },
            ],
            rows: [
              {
                "column 1": { slice: "cell1_1id", jsonValue: "data 1.1" },
                "column 2": { slice: "cell1_2id", jsonValue: "data 1.2" },
              },
            ],
          },
        },
        new SliceAnnotation({
          id: "column1id",
          start: 0,
          end: 8,
          attributes: { refs: ["dataSetId"] },
        }),
        new SliceAnnotation({
          id: "column2id",
          start: 9,
          end: 17,
          attributes: { refs: ["dataSetId"] },
        }),
        new SliceAnnotation({
          id: "cell1_1id",
          start: 18,
          end: 26,
          attributes: { refs: ["dataSetId"] },
        }),
        new SliceAnnotation({
          id: "cell1_2id",
          start: 27,
          end: 35,
          attributes: { refs: ["dataSetId"] },
        }),
        {
          type: "-offset-table",
          id: "tableId",
          start: 35,
          end: 35,
          attributes: {
            dataSet: "dataSetId",
            columns: [
              { name: "column 1", textAlign: "left" },
              { name: "column 2", textAlign: "right" },
            ],
            showColumnHeaders: true,
          },
        },
      ],
    });

    expect(serialize(document, { withStableIds: true })).toMatchSnapshot();

    const markdown = CommonmarkRenderer.render(document);
    expect(markdown).toMatchSnapshot();
  });
});
