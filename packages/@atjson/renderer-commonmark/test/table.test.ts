import { Block, deserialize } from "@atjson/document";
import OffsetSource, { Table } from "@atjson/offset-annotations";
import CommonmarkRenderer from "../src";

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
                  jsonValue: "￼20",
                  slice: "M00000007",
                },
                job: {
                  jsonValue: "￼fighter",
                  slice: "M00000008",
                },
                name: {
                  jsonValue: "￼laios",
                  slice: "M00000006",
                },
                notes: {
                  jsonValue:
                    "￼A strange but earnest person. He ￼really ￼really likes monsters",
                  slice: "M00000009",
                },
              },
              {
                age: {
                  jsonValue: "￼500",
                  slice: "M0000000d",
                },
                job: {
                  jsonValue: "￼mage",
                  slice: "M0000000e",
                },
                name: {
                  jsonValue: "￼marcille",
                  slice: "M0000000c",
                },
                notes: {
                  jsonValue:
                    "￼Difficult to get along with but very competent. Despite seeming strict and fussy, she is interested in forbidden magic...",
                  slice: "M0000000f",
                },
              },
              {
                age: {
                  jsonValue: "￼18",
                  slice: "M00000011",
                },
                job: {
                  jsonValue: "￼healer",
                  slice: "M00000012",
                },
                name: {
                  jsonValue: "￼falin",
                  slice: "M00000010",
                },
                notes: {
                  jsonValue:
                    "￼She ￼seems nice, but is actually just a people pleaser. When push comes to shove she will look out for people she loves and disregard strangers",
                  slice: "M00000013",
                },
              },
              {
                age: {
                  jsonValue: "￼29",
                  slice: "M00000016",
                },
                job: {
                  jsonValue: "￼thief",
                  slice: "M00000017",
                },
                name: {
                  jsonValue: "￼chilchuk",
                  slice: "M00000015",
                },
                notes: {
                  jsonValue:
                    "￼Looks like a child but is actually a divorced father of three. He is serious about his work and isn't interested in getting close with people",
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

const JAGGED_TABLE = {
  blocks: [
    {
      attributes: {},
      id: "B00000000",
      parents: [],
      selfClosing: false,
      type: "text",
    },
    {
      attributes: {
        columns: [
          {
            name: "column 1",
          },
          {
            name: "column 2",
          },
          {
            name: "column 3",
          },
          {
            name: "column 4",
          },
        ],
        dataSet: "B00000003",
        showColumnHeaders: false,
      },
      id: "B00000001",
      parents: [],
      selfClosing: false,
      type: "table",
    },
    {
      attributes: {},
      id: "B00000002",
      parents: ["table"],
      selfClosing: false,
      type: "text",
    },
    {
      attributes: {
        records: [
          {
            "column 1": {
              jsonValue: "laios",
              slice: "M00000000",
            },
          },
          {
            "column 1": {
              jsonValue: "marcille",
              slice: "M00000001",
            },
            "column 2": {
              jsonValue: "500",
              slice: "M00000002",
            },
            "column 3": {
              jsonValue: "mage",
              slice: "M00000003",
            },
          },
          {
            "column 1": {
              jsonValue: "falin",
              slice: "M00000004",
            },
            "column 2": {
              jsonValue: "healer",
              slice: "M00000005",
            },
          },
          {
            "column 1": {
              jsonValue: "chilchuk",
              slice: "M00000006",
            },
            "column 2": {
              jsonValue: "29",
              slice: "M00000007",
            },
            "column 3": {
              jsonValue: "thief",
              slice: "M00000008",
            },
            "column 4": {
              jsonValue: `Looks like a child but is actually a divorced father of three. He is
        serious about his work and isn't interested in getting close with
        people`,
              slice: "M00000009",
            },
          },
        ],
        schema: {
          "column 1": "peritext",
          "column 2": "peritext",
          "column 3": "peritext",
          "column 4": "peritext",
        },
      },
      id: "B00000003",
      parents: ["table", "text"],
      selfClosing: false,
      type: "data-set",
    },
    {
      attributes: {},
      id: "B00000004",
      parents: ["table"],
      selfClosing: false,
      type: "text",
    },
  ],
  marks: [
    {
      attributes: {
        refs: ["B00000003"],
      },
      id: "M00000000",
      range: "(21..26]",
      type: "slice",
    },
    {
      attributes: {
        refs: ["B00000003"],
      },
      id: "M00000001",
      range: "(44..52]",
      type: "slice",
    },
    {
      attributes: {
        refs: ["B00000003"],
      },
      id: "M00000002",
      range: "(60..63]",
      type: "slice",
    },
    {
      attributes: {
        refs: ["B00000003"],
      },
      id: "M00000003",
      range: "(71..75]",
      type: "slice",
    },
    {
      attributes: {
        refs: ["B00000003"],
      },
      id: "M00000004",
      range: "(93..98]",
      type: "slice",
    },
    {
      attributes: {
        refs: ["B00000003"],
      },
      id: "M00000005",
      range: "(106..112]",
      type: "slice",
    },
    {
      attributes: {
        refs: ["B00000003"],
      },
      id: "M00000006",
      range: "(130..138]",
      type: "slice",
    },
    {
      attributes: {
        refs: ["B00000003"],
      },
      id: "M00000007",
      range: "(146..148]",
      type: "slice",
    },
    {
      attributes: {
        refs: ["B00000003"],
      },
      id: "M00000008",
      range: "(156..161]",
      type: "slice",
    },
    {
      attributes: {
        refs: ["B00000003"],
      },
      id: "M00000009",
      range: "(169..342]",
      type: "slice",
    },
  ],
  text: `￼
￼￼￼
  
     
      laios
    
     
      marcille
       500
       mage
    
     
      falin
       healer
    
     
      chilchuk
       29
       thief
       
        Looks like a child but is actually a divorced father of three. He is
        serious about his work and isn't interested in getting close with
        people
      
    
  
￼
    `,
} as any;

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

      const markdown = CommonmarkRenderer.render(document);
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

      const markdown = CommonmarkRenderer.render(document);
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

      const markdown = CommonmarkRenderer.render(document);
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

      const markdown = CommonmarkRenderer.render(document);
      expect(markdown).toMatchSnapshot();
    });
  });

  test("jagged table", () => {
    let doc = deserialize(JAGGED_TABLE, OffsetSource);

    expect(CommonmarkRenderer.render(doc)).toMatchSnapshot();
  });
});
