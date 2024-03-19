import OffsetSource from "@atjson/offset-annotations";
import * as fs from "fs";
import * as path from "path";
import GDocsSource from "../src";
import { serialize } from "@atjson/document";

describe("@atjson/source-gdocs-paste", () => {
  describe("table", () => {
    let doc: OffsetSource;
    beforeAll(() => {
      // https://docs.google.com/document/d/1RVZbqjmvYpd6TaOVF2qoI7K8kdztC5YqyUTIywK1paQ/edit?usp=sharing
      let fixturePath = path.join(__dirname, "fixtures", "table.json");
      let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
      let gdocs = GDocsSource.fromRaw(rawJSON);
      doc = gdocs.convertTo(OffsetSource);
    });

    test("dataset", () => {
      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "level": 1,
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "heading",
            },
            {
              "attributes": {},
              "id": "B00000001",
              "parents": [],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000002",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {
                "records": [
                  {
                    "Channel": {
                      "jsonValue": "Lung",
                      "slice": "M00000004",
                    },
                    "Mu point": {
                      "jsonValue": "LU1",
                      "slice": "M00000005",
                    },
                    "Shu point": {
                      "jsonValue": "BL13",
                      "slice": "M00000006",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Pericardium",
                      "slice": "M00000007",
                    },
                    "Mu point": {
                      "jsonValue": "CV17",
                      "slice": "M00000008",
                    },
                    "Shu point": {
                      "jsonValue": "BL14",
                      "slice": "M00000009",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Heart",
                      "slice": "M0000000a",
                    },
                    "Mu point": {
                      "jsonValue": "CV14",
                      "slice": "M0000000b",
                    },
                    "Shu point": {
                      "jsonValue": "BL15",
                      "slice": "M0000000c",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Liver",
                      "slice": "M0000000d",
                    },
                    "Mu point": {
                      "jsonValue": "LR14",
                      "slice": "M0000000e",
                    },
                    "Shu point": {
                      "jsonValue": "BL18",
                      "slice": "M0000000f",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Gallbladder",
                      "slice": "M00000010",
                    },
                    "Mu point": {
                      "jsonValue": "GB24",
                      "slice": "M00000011",
                    },
                    "Shu point": {
                      "jsonValue": "BL19",
                      "slice": "M00000012",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Spleen",
                      "slice": "M00000013",
                    },
                    "Mu point": {
                      "jsonValue": "LR13",
                      "slice": "M00000014",
                    },
                    "Shu point": {
                      "jsonValue": "BL20",
                      "slice": "M00000015",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Stomach",
                      "slice": "M00000016",
                    },
                    "Mu point": {
                      "jsonValue": "CV12",
                      "slice": "M00000017",
                    },
                    "Shu point": {
                      "jsonValue": "BL21",
                      "slice": "M00000018",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Triple Energizer",
                      "slice": "M00000019",
                    },
                    "Mu point": {
                      "jsonValue": "CV5",
                      "slice": "M0000001a",
                    },
                    "Shu point": {
                      "jsonValue": "BL22",
                      "slice": "M0000001b",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Kidney",
                      "slice": "M0000001c",
                    },
                    "Mu point": {
                      "jsonValue": "GB25",
                      "slice": "M0000001d",
                    },
                    "Shu point": {
                      "jsonValue": "BL23",
                      "slice": "M0000001e",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Large Intestine",
                      "slice": "M0000001f",
                    },
                    "Mu point": {
                      "jsonValue": "ST25",
                      "slice": "M00000020",
                    },
                    "Shu point": {
                      "jsonValue": "BL25",
                      "slice": "M00000021",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Small Intestine",
                      "slice": "M00000022",
                    },
                    "Mu point": {
                      "jsonValue": "CV4",
                      "slice": "M00000023",
                    },
                    "Shu point": {
                      "jsonValue": "BL27",
                      "slice": "M00000024",
                    },
                  },
                  {
                    "Channel": {
                      "jsonValue": "Bladder",
                      "slice": "M00000025",
                    },
                    "Mu point": {
                      "jsonValue": "CV3",
                      "slice": "M00000026",
                    },
                    "Shu point": {
                      "jsonValue": "BL28",
                      "slice": "M00000027",
                    },
                  },
                ],
                "schema": {
                  "Channel": "rich_text",
                  "Mu point": "rich_text",
                  "Shu point": "rich_text",
                },
              },
              "id": "B00000003",
              "parents": [],
              "selfClosing": false,
              "type": "data-set",
            },
            {
              "attributes": {},
              "id": "B00000004",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000005",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000006",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000007",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000008",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000009",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000000a",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000000b",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000000c",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000000d",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000000e",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000000f",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000010",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000011",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000012",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000013",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000014",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000015",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000016",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000017",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000018",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000019",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000001a",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000001b",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000001c",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000001d",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000001e",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000001f",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000020",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000021",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000022",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000023",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000024",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000025",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000026",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000027",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000028",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000029",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B0000002a",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {
                "columns": [
                  {
                    "name": "Channel",
                    "slice": "M00000001",
                  },
                  {
                    "name": "Mu point",
                    "slice": "M00000002",
                  },
                  {
                    "name": "Shu point",
                    "slice": "M00000003",
                  },
                ],
                "dataSet": "B00000003",
              },
              "id": "B0000002b",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "table",
            },
            {
              "attributes": {},
              "id": "B0000002c",
              "parents": [
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000002d",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
          ],
          "marks": [
            {
              "attributes": {},
              "id": "M00000000",
              "range": "(44..71]",
              "type": "bold",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000001",
              "range": "(45..52]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000002",
              "range": "(52..61]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000003",
              "range": "(61..71]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000004",
              "range": "(72..76]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000005",
              "range": "(76..80]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000006",
              "range": "(80..85]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000007",
              "range": "(86..97]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000008",
              "range": "(97..102]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000009",
              "range": "(102..107]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000a",
              "range": "(108..113]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000b",
              "range": "(113..118]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000c",
              "range": "(118..123]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000d",
              "range": "(124..129]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000e",
              "range": "(129..134]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000f",
              "range": "(134..139]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000010",
              "range": "(140..151]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000011",
              "range": "(151..156]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000012",
              "range": "(156..161]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000013",
              "range": "(162..168]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000014",
              "range": "(168..173]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000015",
              "range": "(173..178]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000016",
              "range": "(179..186]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000017",
              "range": "(186..191]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000018",
              "range": "(191..196]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000019",
              "range": "(197..213]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001a",
              "range": "(213..217]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001b",
              "range": "(217..222]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001c",
              "range": "(223..229]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001d",
              "range": "(229..234]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001e",
              "range": "(234..239]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001f",
              "range": "(240..255]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000020",
              "range": "(255..260]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000021",
              "range": "(260..265]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000022",
              "range": "(266..281]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000023",
              "range": "(281..285]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000024",
              "range": "(285..290]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000025",
              "range": "(291..298]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000026",
              "range": "(298..302]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000027",
              "range": "(302..307]",
              "type": "slice",
            },
          ],
          "text": "￼Mu (Alarm) and Shu (Associated) points￼

        ￼￼￼Channel￼Mu point￼Shu point￼Lung￼LU1￼BL13￼Pericardium￼CV17￼BL14￼Heart￼CV14￼BL15￼Liver￼LR14￼BL18￼Gallbladder￼GB24￼BL19￼Spleen￼LR13￼BL20￼Stomach￼CV12￼BL21￼Triple Energizer￼CV5￼BL22￼Kidney￼GB25￼BL23￼Large Intestine￼ST25￼BL25￼Small Intestine￼CV4￼BL27￼Bladder￼CV3￼BL28￼￼
        ￼These points are used for diagnostic purposes when evaluating a client. Shu points on the back refer to chronic imbalances that have been around for years. Mu points are on the order of months.",
        }
      `);
    });
  });
});
