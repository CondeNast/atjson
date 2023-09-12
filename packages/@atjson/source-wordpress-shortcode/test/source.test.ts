import WPShortcodeSource from "../src";

describe("@atjson/source-wordpress-shortcode", () => {
  test("single shortcodes", () => {
    let doc = WPShortcodeSource.fromRaw(
      `[gallery id="123" size="medium"]`
    ).canonical();
    expect(doc).toMatchObject({
      content: "",
      annotations: [
        {
          type: "shortcode",
          start: 0,
          end: 0,
          attributes: {
            tag: "gallery",
            type: "single",
            attrs: {
              named: { id: "123", size: "medium" },
              numeric: [],
            },
          },
        },
      ],
    });
  });

  test("numeric attrs", () => {
    let doc = WPShortcodeSource.fromRaw(
      `[happy "happy" 'joy' joy]`
    ).canonical();
    expect(doc).toMatchObject({
      content: "",
      annotations: [
        {
          type: "shortcode",
          start: 0,
          end: 0,
          attributes: {
            tag: "happy",
            type: "single",
            attrs: {
              named: {},
              numeric: ["happy", "joy", "joy"],
            },
          },
        },
      ],
    });
  });

  test("self-closing shortcodes", () => {
    let doc = WPShortcodeSource.fromRaw(`[happy /]`).canonical();
    expect(doc).toMatchObject({
      content: "",
      annotations: [
        {
          type: "shortcode",
          start: 0,
          end: 0,
          attributes: {
            tag: "happy",
            type: "self-closing",
            attrs: {
              named: {},
              numeric: [],
            },
          },
        },
      ],
    });
  });

  test("closed shortcodes", () => {
    let doc = WPShortcodeSource.fromRaw(
      `[caption id="attachment_6" align="alignright" width="300"]<img src="http://localhost/wp-content/uploads/2010/07/800px-Great_Wave_off_Kanagawa2-300x205.jpg" alt="Kanagawa" title="The Great Wave" width="300" height="205" class="size-medium wp-image-6" /> The Great Wave[/caption]`
    ).canonical();
    expect(doc).toMatchObject({
      content: `<img src="http://localhost/wp-content/uploads/2010/07/800px-Great_Wave_off_Kanagawa2-300x205.jpg" alt="Kanagawa" title="The Great Wave" width="300" height="205" class="size-medium wp-image-6" /> The Great Wave`,
      annotations: [
        {
          type: "shortcode",
          start: 0,
          end: 209,
          attributes: {
            tag: "caption",
            type: "closed",
            attrs: {
              named: {
                id: "attachment_6",
                align: "alignright",
                width: "300",
              },
              numeric: [],
            },
          },
        },
      ],
    });
  });

  test.each(["[[gallery]]", "[[shortcode] ... [/shortcode]]"])(
    "escaped shortcodes (%s)",
    (code) => {
      let doc = WPShortcodeSource.fromRaw(code).canonical();
      expect(doc).toMatchObject({
        content: code,
        annotations: [],
      });
    }
  );
});
