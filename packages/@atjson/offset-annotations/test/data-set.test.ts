import {
  serialize,
  deserialize,
  Block,
  SliceAnnotation,
} from "@atjson/document";
import OffsetSource, { ColumnType, DataSet, Table } from "../src";

describe("DataSet", () => {
  test("peritext", () => {
    let document = deserialize<Table | DataSet | SliceAnnotation>(
      {
        text: "￼￼column 1 column 2 data 1.1 data 1.2",
        blocks: [
          {
            type: "data-set",
            id: "dataSetId",
            attributes: {
              schema: {
                "column 1": ColumnType.RICH_TEXT,
                "column 2": ColumnType.RICH_TEXT,
              },
              records: [
                {
                  "column 1": {
                    slice: "cell1_1Id",
                    jsonValue: "data 1.1",
                  },
                  "column 2": {
                    slice: "cell1_2Id",
                    jsonValue: "data 1.2",
                  },
                },
              ],
            },
            parents: ["table"],
          },
          {
            type: "table",
            id: "tableId",
            attributes: {
              columns: [
                {
                  name: "column 1",
                  slice: "column1Id",
                  textAlign: "left",
                },
                {
                  name: "column 2",
                  slice: "column2Id",
                  textAlign: "right",
                },
              ],
              dataSet: "dataSetId",
              showColumnHeaders: true,
            },
            parents: [],
          } as Block<Table>,
        ],
        marks: [
          {
            attributes: {
              refs: ["dataSetId"],
            },
            id: "column1Id",
            range: "(2..10]",
            type: "slice",
          },
          {
            attributes: {
              refs: ["dataSetId"],
            },
            id: "column2Id",
            range: "(11..19]",
            type: "slice",
          },
          {
            attributes: {
              refs: ["dataSetId"],
            },
            id: "cell1_1Id",
            range: "(20..28]",
            type: "slice",
          },
          {
            attributes: {
              refs: ["dataSetId"],
            },
            id: "cell1_2Id",
            range: "(29..37]",
            type: "slice",
          },
        ],
      },
      OffsetSource
    );

    expect(serialize(document, { withStableIds: true })).toMatchSnapshot();
  });
});
