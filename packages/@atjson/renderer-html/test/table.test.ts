import { Block, deserialize } from "@atjson/document";
import OffsetSource, { Table } from "@atjson/offset-annotations";
import HtmlRenderer from "../src";

function testTable(
  tableAttributes: Omit<Block<Table>["attributes"], "dataSet">
) {
  return deserialize(
    {
      text: "￼￼ name age job notes laios 20 fighter A strange but earnest person. He really really likes monsters marcille 500 mage Difficult to get along with but very competent. Despite seeming strict and fussy, she is interested in forbidden magic... falin 18 healer She seems nice, but is actually just a people pleaser. When push comes to shove she will look out for people she loves and disregard strangers chilchuk 29 thief Looks like a child but is actually a divorced father of three. He is serious about his work and isn't interested in getting close with people",
      blocks: [
        {
          attributes: {
            schema: {
              name: "peritext",
              age: "peritext",
              job: "peritext",
              notes: "peritext",
            },
            records: [
              {
                age: {
                  jsonValue: "20",
                  slice: "M00000007",
                },
                job: {
                  jsonValue: "fighter",
                  slice: "M00000008",
                },
                name: {
                  jsonValue: "laios",
                  slice: "M00000006",
                },
                notes: {
                  jsonValue:
                    "A strange but earnest person. He really really likes monsters",
                  slice: "M00000009",
                },
              },
              {
                age: {
                  jsonValue: "500",
                  slice: "M0000000d",
                },
                job: {
                  jsonValue: "mage",
                  slice: "M0000000e",
                },
                name: {
                  jsonValue: "marcille",
                  slice: "M0000000c",
                },
                notes: {
                  jsonValue:
                    "Difficult to get along with but very competent. Despite seeming strict and fussy, she is interested in forbidden magic...",
                  slice: "M0000000f",
                },
              },
              {
                age: {
                  jsonValue: "18",
                  slice: "M00000011",
                },
                job: {
                  jsonValue: "healer",
                  slice: "M00000012",
                },
                name: {
                  jsonValue: "falin",
                  slice: "M00000010",
                },
                notes: {
                  jsonValue:
                    "She seems nice, but is actually just a people pleaser. When push comes to shove she will look out for people she loves and disregard strangers",
                  slice: "M00000013",
                },
              },
              {
                age: {
                  jsonValue: "29",
                  slice: "M00000016",
                },
                job: {
                  jsonValue: "thief",
                  slice: "M00000017",
                },
                name: {
                  jsonValue: "chilchuk",
                  slice: "M00000015",
                },
                notes: {
                  jsonValue:
                    "Looks like a child but is actually a divorced father of three. He is serious about his work and isn't interested in getting close with people",
                  slice: "M00000018",
                },
              },
            ],
          },
          id: "dataSetId",
          parents: [],
          selfClosing: false,
          type: "data-set",
        },
        {
          attributes: { ...tableAttributes, dataSet: "dataSetId" },
          id: "B00000001",
          parents: [],
          selfClosing: false,
          type: "table",
        },
      ],
      marks: [
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000000",
          range: "(3..7]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000001",
          range: "(8..11]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000002",
          range: "(12..15]",
          type: "slice",
        },
        {
          attributes: {
            url: "https://en.wikipedia.org/wiki/Delicious_in_Dungeon",
          },
          id: "M00000003",
          range: "(16..21)",
          type: "link",
        },
        {
          attributes: {},
          id: "M00000004",
          range: "(16..21]",
          type: "italic",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000005",
          range: "(16..21]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000006",
          range: "(22..27]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000007",
          range: "(28..30]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000008",
          range: "(31..38]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000009",
          range: "(39..100]",
          type: "slice",
        },
        {
          attributes: {},
          id: "M0000000a",
          range: "(72..85]",
          type: "italic",
        },
        {
          attributes: {},
          id: "M0000000b",
          range: "(79..85]",
          type: "bold",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M0000000c",
          range: "(101..109]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M0000000d",
          range: "(110..113]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M0000000e",
          range: "(114..118]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M0000000f",
          range: "(119..240]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000010",
          range: "(241..246]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000011",
          range: "(247..249]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000012",
          range: "(250..256]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000013",
          range: "(257..399]",
          type: "slice",
        },
        {
          attributes: {},
          id: "M00000014",
          range: "(261..266]",
          type: "italic",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000015",
          range: "(400..408]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000016",
          range: "(409..411]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000017",
          range: "(412..417]",
          type: "slice",
        },
        {
          attributes: {
            refs: ["B00000000"],
          },
          id: "M00000018",
          range: "(418..559]",
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
          { name: "name", slice: "M00000000" },
          { name: "age", slice: "M00000001" },
          { name: "job", slice: "M00000002" },
          { name: "notes", slice: "M00000005" },
        ],
        showColumnHeaders: true,
      });

      const markdown = HtmlRenderer.render(document);
      expect(markdown).toMatchSnapshot();
    });

    test("mixed alignment", () => {
      let document = testTable({
        columns: [
          { name: "name", slice: "M00000000", textAlign: "left" },
          { name: "age", slice: "M00000001", textAlign: "right" },
          { name: "job", slice: "M00000002" },
          { name: "notes", slice: "M00000005", textAlign: "center" },
        ],
        showColumnHeaders: true,
      });

      const markdown = HtmlRenderer.render(document);
      expect(markdown).toMatchSnapshot();
    });

    test("reordering columns", () => {
      let document = testTable({
        columns: [
          { name: "notes", slice: "M00000005" },
          { name: "job", slice: "M00000002" },
          { name: "age", slice: "M00000001" },
          { name: "name", slice: "M00000000" },
        ],
        showColumnHeaders: true,
      });

      const markdown = HtmlRenderer.render(document);
      expect(markdown).toMatchSnapshot();
    });

    test("omitting columns", () => {
      let document = testTable({
        columns: [
          {
            name: "name",
            slice: "M00000000",
          },
          {
            name: "job",
            slice: "M00000002",
          },
        ],
        showColumnHeaders: true,
      });

      const markdown = HtmlRenderer.render(document);
      expect(markdown).toMatchSnapshot();
    });
  });
});
