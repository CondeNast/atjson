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
              "attributes": {
                "columns": [
                  {
                    "columnName": "channel__0",
                    "slice": "M00000002",
                  },
                  {
                    "columnName": "mu_point__1",
                    "slice": "M00000004",
                  },
                  {
                    "columnName": "shu_point__2",
                    "slice": "M00000005",
                  },
                ],
                "dataSet": "B00000003",
                "showColumnHeaders": true,
              },
              "id": "B00000002",
              "parents": [],
              "selfClosing": false,
              "type": "table",
            },
            {
              "attributes": {
                "records": [
                  {
                    "channel__0": {
                      "jsonValue": "Lung",
                      "slice": "M00000006",
                    },
                    "mu_point__1": {
                      "jsonValue": "LU1",
                      "slice": "M00000007",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL13",
                      "slice": "M00000008",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Pericardium",
                      "slice": "M00000009",
                    },
                    "mu_point__1": {
                      "jsonValue": "CV17",
                      "slice": "M0000000a",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL14",
                      "slice": "M0000000b",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Heart",
                      "slice": "M0000000c",
                    },
                    "mu_point__1": {
                      "jsonValue": "CV14",
                      "slice": "M0000000d",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL15",
                      "slice": "M0000000e",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Liver",
                      "slice": "M0000000f",
                    },
                    "mu_point__1": {
                      "jsonValue": "LR14",
                      "slice": "M00000010",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL18",
                      "slice": "M00000011",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Gallbladder",
                      "slice": "M00000012",
                    },
                    "mu_point__1": {
                      "jsonValue": "GB24",
                      "slice": "M00000013",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL19",
                      "slice": "M00000014",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Spleen",
                      "slice": "M00000015",
                    },
                    "mu_point__1": {
                      "jsonValue": "LR13",
                      "slice": "M00000016",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL20",
                      "slice": "M00000017",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Stomach",
                      "slice": "M00000018",
                    },
                    "mu_point__1": {
                      "jsonValue": "CV12",
                      "slice": "M00000019",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL21",
                      "slice": "M0000001a",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Triple Energizer",
                      "slice": "M0000001b",
                    },
                    "mu_point__1": {
                      "jsonValue": "CV5",
                      "slice": "M0000001c",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL22",
                      "slice": "M0000001d",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Kidney",
                      "slice": "M0000001e",
                    },
                    "mu_point__1": {
                      "jsonValue": "GB25",
                      "slice": "M0000001f",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL23",
                      "slice": "M00000020",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Large Intestine",
                      "slice": "M00000021",
                    },
                    "mu_point__1": {
                      "jsonValue": "ST25",
                      "slice": "M00000022",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL25",
                      "slice": "M00000023",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Small Intestine",
                      "slice": "M00000024",
                    },
                    "mu_point__1": {
                      "jsonValue": "CV4",
                      "slice": "M00000025",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL27",
                      "slice": "M00000026",
                    },
                  },
                  {
                    "channel__0": {
                      "jsonValue": "Bladder",
                      "slice": "M00000027",
                    },
                    "mu_point__1": {
                      "jsonValue": "CV3",
                      "slice": "M00000028",
                    },
                    "shu_point__2": {
                      "jsonValue": "BL28",
                      "slice": "M00000029",
                    },
                  },
                ],
                "schema": {
                  "channel__0": "rich_text",
                  "mu_point__1": "rich_text",
                  "shu_point__2": "rich_text",
                },
              },
              "id": "B00000003",
              "parents": [
                "table",
              ],
              "selfClosing": false,
              "type": "data-set",
            },
            {
              "attributes": {},
              "id": "B00000004",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000005",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000006",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000007",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000008",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000009",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000000a",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000000b",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000000c",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000000d",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000000e",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000000f",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000010",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000011",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000012",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000013",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000014",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000015",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000016",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000017",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000018",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000019",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000001a",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000001b",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000001c",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000001d",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000001e",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000001f",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000020",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000021",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000022",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000023",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000024",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000025",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000026",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000027",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000028",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000029",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000002a",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000002b",
              "parents": [
                "table",
                "data-set",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B0000002c",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
          ],
          "marks": [
            {
              "attributes": {
                "-gdocs-size": 20,
              },
              "id": "M00000000",
              "range": "(1..39]",
              "type": "-gdocs-ts_fs",
            },
            {
              "attributes": {
                "-gdocs-size": 11,
              },
              "id": "M00000001",
              "range": "(44..71]",
              "type": "-gdocs-ts_fs",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000002",
              "range": "(45..52]",
              "type": "slice",
            },
            {
              "attributes": {},
              "id": "M00000003",
              "range": "(45..71]",
              "type": "bold",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000004",
              "range": "(52..61]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000005",
              "range": "(61..71]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000006",
              "range": "(72..76]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000007",
              "range": "(76..80]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000008",
              "range": "(80..85]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000009",
              "range": "(86..97]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000a",
              "range": "(97..102]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000b",
              "range": "(102..107]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000c",
              "range": "(108..113]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000d",
              "range": "(113..118]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000e",
              "range": "(118..123]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000000f",
              "range": "(124..129]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000010",
              "range": "(129..134]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000011",
              "range": "(134..139]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000012",
              "range": "(140..151]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000013",
              "range": "(151..156]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000014",
              "range": "(156..161]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000015",
              "range": "(162..168]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000016",
              "range": "(168..173]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000017",
              "range": "(173..178]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000018",
              "range": "(179..186]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000019",
              "range": "(186..191]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001a",
              "range": "(191..196]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001b",
              "range": "(197..213]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001c",
              "range": "(213..217]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001d",
              "range": "(217..222]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001e",
              "range": "(223..229]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M0000001f",
              "range": "(229..234]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000020",
              "range": "(234..239]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000021",
              "range": "(240..255]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000022",
              "range": "(255..260]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000023",
              "range": "(260..265]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000024",
              "range": "(266..281]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000025",
              "range": "(281..285]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000026",
              "range": "(285..290]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000027",
              "range": "(291..298]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000028",
              "range": "(298..302]",
              "type": "slice",
            },
            {
              "attributes": {
                "refs": [
                  "B00000003",
                ],
              },
              "id": "M00000029",
              "range": "(302..307]",
              "type": "slice",
            },
          ],
          "text": "￼Mu (Alarm) and Shu (Associated) points￼

        ￼￼￼Channel￼Mu point￼Shu point￼Lung￼LU1￼BL13￼Pericardium￼CV17￼BL14￼Heart￼CV14￼BL15￼Liver￼LR14￼BL18￼Gallbladder￼GB24￼BL19￼Spleen￼LR13￼BL20￼Stomach￼CV12￼BL21￼Triple Energizer￼CV5￼BL22￼Kidney￼GB25￼BL23￼Large Intestine￼ST25￼BL25￼Small Intestine￼CV4￼BL27￼Bladder￼CV3￼BL28￼￼These points are used for diagnostic purposes when evaluating a client. Shu points on the back refer to chronic imbalances that have been around for years. Mu points are on the order of months.",
        }
      `);
    });
  });
});
