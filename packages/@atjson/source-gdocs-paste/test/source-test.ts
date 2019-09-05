import * as fs from "fs";
import * as path from "path";
import { VerticalAdjust } from "../src/annotations";
import { GDocsPasteBuffer } from "../src/gdocs-parser";
import GDocsSource from "../src/index";

describe("@atjson/source-gdocs-paste", () => {
  describe("relatively complex document", () => {
    let pasteBuffer: GDocsPasteBuffer;

    beforeAll(() => {
      // https://docs.google.com/document/d/18pp4dAGx5II596HHGOLUXXcc6VKLAVRBUMLm9Ge8eOE/edit?usp=sharing
      let fixturePath = path.join(__dirname, "fixtures", "complex.json");
      pasteBuffer = JSON.parse(fs.readFileSync(fixturePath).toString());
    });

    it("has some json", () => {
      expect(pasteBuffer).toHaveProperty("resolved");
    });

    it("does not throw an error when instantiating with GDocsSource", () => {
      expect(GDocsSource.fromRaw(pasteBuffer)).toBeDefined();
    });

    it("correctly sets the content", () => {
      let gdocs = GDocsSource.fromRaw(pasteBuffer);
      expect(gdocs.content.length).toEqual(438);
      expect(gdocs.content).toMatchSnapshot();
    });

    it("extracts bold", () => {
      let gdocs = GDocsSource.fromRaw(pasteBuffer);
      let annotations = gdocs.where(a => a.type === "ts_bd");
      expect(annotations.length).toEqual(2);

      let [a0, a1] = annotations;
      expect(gdocs.content.substring(a0.start, a0.end)).toEqual("simple te");
      expect(gdocs.content.substring(a1.start, a1.end)).toEqual("re is so");
    });

    it("extracts italic", () => {
      let gdocs = GDocsSource.fromRaw(pasteBuffer);
      let annotations = gdocs.where(a => a.type === "ts_it");
      expect(annotations.length).toEqual(2);

      let [a0, a1] = [...annotations];
      expect(gdocs.content.substring(a0.start, a0.end)).toEqual("simple ");
      expect(gdocs.content.substring(a1.start, a1.end)).toEqual("some ");
    });

    it("extracts headings", () => {
      let gdocs = GDocsSource.fromRaw(pasteBuffer);
      let annotations = gdocs.where(a => a.type === "ps_hd").sort();
      expect(annotations.length).toEqual(4);

      let [a0, a1, a2, a3] = [...annotations];

      expect(gdocs.content.substring(a0.start, a0.end)).toEqual("Heading 1");
      expect(a0.attributes.level).toEqual(1);

      expect(gdocs.content.substring(a1.start, a1.end)).toEqual("Heading 2");
      expect(a1.attributes.level).toEqual(2);

      expect(gdocs.content.substring(a2.start, a2.end)).toEqual("Title");
      expect(a2.attributes.level).toEqual(100);

      expect(gdocs.content.substring(a3.start, a3.end)).toEqual("Subtitle");
      expect(a3.attributes.level).toEqual(101);
    });

    describe("lists", () => {
      it("extracts lists", () => {
        let gdocs = GDocsSource.fromRaw(pasteBuffer);
        let annotations = gdocs.where(a => a.type === "list");
        expect(annotations.length).toEqual(2);

        let [a0] = [...annotations];

        expect(gdocs.content.substring(a0.start, a0.end)).toEqual(
          "Here’s a numbered list\nAnd another item"
        );
        expect(a0.attributes.ls_id).toEqual("kix.trdi2u6o1bvt");
      });

      it("extracts list items", () => {
        let gdocs = GDocsSource.fromRaw(pasteBuffer);
        let annotations = gdocs.where(a => a.type === "list_item");
        expect(annotations.length).toEqual(4);

        let [a0, a1] = [...annotations];

        expect(gdocs.content.substring(a0.start, a0.end)).toEqual(
          "Here’s a numbered list"
        );
        expect(a0.attributes.ls_id).toEqual("kix.trdi2u6o1bvt");
        expect(a0.attributes.ls_nest).toEqual(0);

        expect(gdocs.content.substring(a1.start, a1.end)).toEqual(
          "And another item"
        );
        expect(a1.attributes.ls_id).toEqual("kix.trdi2u6o1bvt");
        expect(a1.attributes.ls_nest).toEqual(0);
      });
    });

    it("extracts links", () => {
      let gdocs = GDocsSource.fromRaw(pasteBuffer);
      let annotations = gdocs.where(a => a.type === "lnks_link");
      expect(annotations.length).toEqual(1);

      let [link] = [...annotations];

      expect(gdocs.content.substring(link.start, link.end)).toEqual(" is ");
      expect(link.attributes.ulnk_url).toEqual("https://www.google.com/");
      expect(link.attributes.lnk_type).toEqual(0);
    });
  });

  describe("a grab-bag of Google Docs features", () => {
    let gdocsBuffer: any;

    beforeAll(() => {
      // https://docs.google.com/document/d/18pp4dAGx5II596HHGOLUXXcc6VKLAVRBUMLm9Ge8eOE/edit?usp=sharing
      let fixturePath = path.join(
        __dirname,
        "fixtures",
        "formats-and-tabs.json"
      );
      gdocsBuffer = JSON.parse(fs.readFileSync(fixturePath).toString());
    });

    it("has some json", () => {
      expect(gdocsBuffer).toHaveProperty("resolved");
    });

    it("does not throw an error when instantiating with GDocsSource", () => {
      expect(GDocsSource.fromRaw(gdocsBuffer)).toBeDefined();
    });

    it("correctly sets the content", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      expect(gdocs.content.length).toEqual(219);
      expect(gdocs.content).toMatchSnapshot();
    });

    it("extracts bold", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      let annotations = gdocs.where(a => a.type === "ts_bd");
      expect(annotations.length).toEqual(1);

      let [bold] = annotations;
      expect(gdocs.content.substring(bold.start, bold.end)).toEqual("bold");
    });

    it("extracts italic", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      let annotations = gdocs.where(a => a.type === "ts_it");
      expect(annotations.length).toEqual(1);

      let [italic] = annotations;
      expect(gdocs.content.substring(italic.start, italic.end)).toEqual(
        "italic"
      );
    });

    it("extracts underline", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      let annotations = gdocs.where(a => a.type === "ts_un");
      expect(annotations.length).toEqual(1);

      let [underline] = annotations;
      expect(gdocs.content.substring(underline.start, underline.end)).toEqual(
        "underlined"
      );
    });

    it("extracts horizontal rules", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      let annotations = gdocs.where(a => a.type === "horizontal_rule");
      expect(annotations.length).toEqual(1);

      let [hr] = annotations;
      expect(gdocs.content.substring(hr.start, hr.end)).toEqual("-");
    });

    it("extracts strikethrough", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      let annotations = gdocs.where(a => a.type === "ts_st");
      expect(annotations.length).toEqual(1);

      let [strikethrough] = annotations;
      expect(
        gdocs.content.substring(strikethrough.start, strikethrough.end)
      ).toEqual("strikethrough");
    });

    it("extracts vertical adjust", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      let annotations = gdocs.where(a => a instanceof VerticalAdjust);
      expect(annotations.length).toEqual(2);

      let [superscript] = annotations.where(
        annotation => annotation.attributes.va === "sup"
      );
      let [subscript] = annotations.where(
        annotation => annotation.attributes.va === "sub"
      );
      expect(
        gdocs.content.substring(superscript.start, superscript.end)
      ).toEqual("TM");
      expect(gdocs.content.substring(subscript.start, subscript.end)).toEqual(
        "2"
      );
    });
  });

  describe("list styles", () => {
    let gdocsBuffer: any;

    beforeAll(() => {
      let fixturePath = path.join(__dirname, "fixtures", "list-styles.json");
      gdocsBuffer = JSON.parse(fs.readFileSync(fixturePath).toString());
    });

    it("creates the right number of list annotations", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      let lists = gdocs.where(a => a.type === "list");

      expect(lists.length).toEqual(2);
    });

    it("captures list-specific attributes", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      let lists = gdocs.where(a => a.type === "list");
      let expectedShape = expect.objectContaining({
        ls_b_gs: expect.anything(),
        ls_b_gt: expect.anything(),
        ls_b_a: expect.anything()
      });

      for (let list of lists) {
        expect(list.attributes).toEqual(expectedShape);
      }
    });

    it("distinguishes numbered from bulleted lists", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      let lists = gdocs.annotations
        .filter(a => a.type === "list")
        .filter(a => a.attributes.ls_b_gt === 9);

      expect(lists.length).toEqual(1);
    });
  });

  describe("partial link pastes", () => {
    let gdocsBuffer: any;

    beforeAll(() => {
      let fixturePath = path.join(__dirname, "fixtures", "partial.json");
      gdocsBuffer = JSON.parse(fs.readFileSync(fixturePath).toString());
    });

    it("creates the right number of link annotations", () => {
      let gdocs = GDocsSource.fromRaw(gdocsBuffer);
      let links = gdocs.annotations.filter(a => a.type === "lnks_link");

      expect(links.length).toEqual(1);
    });
  });

  describe("partial list pastes", () => {
    let pasteBuffer: any;

    beforeAll(() => {
      // https://docs.google.com/document/d/1PKNoasDTf0Pj71vJs4MAi9zOrWDA3TDSNj0RFXWoCp4/edit
      let fixturePath = path.join(
        __dirname,
        "fixtures",
        "list-styles-partial.json"
      );
      pasteBuffer = JSON.parse(fs.readFileSync(fixturePath).toString());
    });

    it("creates the right number of list and list-item annotations", () => {
      let gdocs = GDocsSource.fromRaw(pasteBuffer);
      let listAndItems = gdocs
        .where(a => a.type === "list")
        .as("list")
        .join(
          gdocs.where(a => a.type === "list_item").as("listItems"),
          (l, r) => l.start <= r.start && l.end >= r.end
        );

      expect(listAndItems.toJSON()).toMatchObject([
        {
          list: { start: 0, end: 22, type: "-gdocs-list" },
          listItems: [
            { start: 0, end: 8, type: "-gdocs-list_item" },
            { start: 9, end: 22, type: "-gdocs-list_item" }
          ]
        },
        {
          list: { start: 41, end: 68, type: "-gdocs-list" },
          listItems: [
            { start: 41, end: 54, type: "-gdocs-list_item" },
            { start: 55, end: 68, type: "-gdocs-list_item" }
          ]
        },
        {
          list: { start: 89, end: 102, type: "-gdocs-list" },
          listItems: [{ start: 89, end: 102, type: "-gdocs-list_item" }]
        }
      ]);
    });
  });
});
