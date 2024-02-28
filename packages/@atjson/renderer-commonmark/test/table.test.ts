import { Block, deserialize } from "@atjson/document";
import OffsetSource, { Table } from "@atjson/offset-annotations";
import CommonmarkRenderer from "../src";

function testTable(tableAttributes: Block<Table>["attributes"]) {
  return deserialize(
    {
      text: "￼￼column 1 column 2 data 1.1 data 1.2",
      blocks: [
        {
          type: "table",
          id: "tableId",
          attributes: tableAttributes,
          parents: [],
        },
        {
          type: "data-set",
          id: "dataSetId",
          attributes: {
            columns: [
              {
                name: "column 1",
                slice: "column1Id",
                type: "peritext",
              },
              {
                name: "column 2",
                slice: "column2Id",
                type: "peritext",
              },
            ],
            rows: [
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
}

describe("tables", () => {
  describe("with column headings", () => {
    test("no alignment", () => {
      let document = testTable({
        columns: [
          {
            name: "column 1",
          },
          {
            name: "column 2",
          },
        ],
        dataSet: "dataSetId",
        showColumnHeaders: true,
      });

      const markdown = CommonmarkRenderer.render(document);
      expect(markdown).toMatchSnapshot();
    });

    test("mixed alignment", () => {
      let document = testTable({
        columns: [
          {
            name: "column 1",
            textAlign: "left",
          },
          {
            name: "column 2",
            textAlign: "right",
          },
        ],
        dataSet: "dataSetId",
        showColumnHeaders: true,
      });

      const markdown = CommonmarkRenderer.render(document);
      expect(markdown).toMatchSnapshot();
    });

    test("center alignment", () => {
      let document = testTable({
        columns: [
          {
            name: "column 1",
            textAlign: "center",
          },
          {
            name: "column 2",
          },
        ],
        dataSet: "dataSetId",
        showColumnHeaders: true,
      });

      const markdown = CommonmarkRenderer.render(document);
      expect(markdown).toMatchSnapshot();
    });

    test("reordering columns", () => {
      let document = testTable({
        columns: [
          {
            name: "column 2",
          },
          {
            name: "column 1",
          },
        ],
        dataSet: "dataSetId",
        showColumnHeaders: true,
      });

      const markdown = CommonmarkRenderer.render(document);
      expect(markdown).toMatchSnapshot();
    });

    test("omitting columns", () => {
      let document = testTable({
        columns: [
          {
            name: "column 2",
          },
        ],
        dataSet: "dataSetId",
        showColumnHeaders: true,
      });

      const markdown = CommonmarkRenderer.render(document);
      expect(markdown).toMatchSnapshot();
    });
  });
});
