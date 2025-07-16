import HTMLSource from "../src";
import OffsetSource from "@atjson/offset-annotations";
import { serialize } from "@atjson/document";

describe("CerosEmbed", () => {
  test("with mobileAspectRatio", () => {
    let doc = HTMLSource.fromRaw(
      `<div style="position: relative;width: auto;padding: 0 0 50%;height: 0;top: 0;left: 0;bottom: 0;right: 0;margin: 0;border: 0 none" id="experience-test" data-aspectRatio="2.01" data-mobile-aspectRatio="3.2"><iframe allowfullscreen src="//view.ceros.com/ceros-inspire/carousel-3" style="position: absolute;top: 0;left: 0;bottom: 0;right: 0;margin: 0;padding: 0;border: 0 none;height: 1px;width: 1px;min-height: 100%;min-width: 100%" frameborder="0" class="ceros-experience" scrolling="no"></iframe></div><script type="text/javascript" src="//view.ceros.com/scroll-proxy.min.js"></script>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "aspectRatio": 2.01,
              "mobileAspectRatio": 3.2,
              "url": "//view.ceros.com/ceros-inspire/carousel-3",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "ceros-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("without mobileAspectRatio", () => {
    let doc = HTMLSource.fromRaw(
      `<div style="position: relative;width: auto;padding: 0 0 50%;height: 0;top: 0;left: 0;bottom: 0;right: 0;margin: 0;border: 0 none" id="experience-test" data-aspectRatio="2"><iframe allowfullscreen src="//view.ceros.com/ceros-inspire/carousel-3" style="position: absolute;top: 0;left: 0;bottom: 0;right: 0;margin: 0;padding: 0;border: 0 none;height: 1px;width: 1px;min-height: 100%;min-width: 100%" frameborder="0" class="ceros-experience" scrolling="no"></iframe></div><script type="text/javascript" src="//view.ceros.com/scroll-proxy.min.js"></script>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "aspectRatio": 2,
              "url": "//view.ceros.com/ceros-inspire/carousel-3",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "ceros-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("with a trailing blank script tag", () => {
    expect(() => {
      HTMLSource.fromRaw(
        `<div style="position: relative;width: auto;padding: 0 0 50%;height: 0;top: 0;left: 0;bottom: 0;right: 0;margin: 0;border: 0 none" id="experience-test" data-aspectRatio="2"><iframe allowfullscreen src="//view.ceros.com/ceros-inspire/carousel-3" style="position: absolute;top: 0;left: 0;bottom: 0;right: 0;margin: 0;padding: 0;border: 0 none;height: 1px;width: 1px;min-height: 100%;min-width: 100%" frameborder="0" class="ceros-experience" scrolling="no"></iframe></div><script type="text/javascript"></script>`,
      ).convertTo(OffsetSource);
    }).not.toThrow();
  });

  test("followed by a non-ceros script tag", () => {
    let doc = HTMLSource.fromRaw(
      `<div style="position: relative;width: auto;padding: 0 0 50%;height: 0;top: 0;left: 0;bottom: 0;right: 0;margin: 0;border: 0 none" id="experience-test" data-aspectRatio="2"><iframe allowfullscreen src="//view.ceros.com/ceros-inspire/carousel-3" style="position: absolute;top: 0;left: 0;bottom: 0;right: 0;margin: 0;padding: 0;border: 0 none;height: 1px;width: 1px;min-height: 100%;min-width: 100%" frameborder="0" class="ceros-experience" scrolling="no"></iframe></div><script type="text/javascript" src="https://www.example.com/my-script.js"></script>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "aspectRatio": 2,
              "url": "//view.ceros.com/ceros-inspire/carousel-3",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "ceros-embed",
          },
        ],
        "marks": [
          {
            "attributes": {
              "-html-src": "https://www.example.com/my-script.js",
              "-html-type": "text/javascript",
            },
            "id": "M00000000",
            "range": "(1..1]",
            "type": "-html-script",
          },
        ],
        "text": "￼",
      }
    `);
  });
});
