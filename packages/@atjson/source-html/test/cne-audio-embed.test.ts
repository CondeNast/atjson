import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("CNE Audio", () => {
  test("script", () => {
    let doc = HTMLSource.fromRaw(
      `<script src="https://embed-audio.cnevids.com/script/episode/bb2ef05b-de71-469a-b0a5-829f2a54dac6?skin=vf&target=js-audio1" defer></script><div id="js-audio1"></div>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "audioEnv": "production",
              "audioId": "bb2ef05b-de71-469a-b0a5-829f2a54dac6",
              "audioType": "episode",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cne-audio-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("iframe", () => {
    let doc = HTMLSource.fromRaw(
      `<iframe src="https://embed-audio.cnevids.com/iframe/episode/bb2ef05b-de71-469a-b0a5-829f2a54dac6?skin=vf" frameborder="0" height="244" sandbox=allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "audioEnv": "production",
              "audioId": "bb2ef05b-de71-469a-b0a5-829f2a54dac6",
              "audioType": "episode",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cne-audio-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("script with anchor", () => {
    let doc = HTMLSource.fromRaw(
      `<script id="isabel-pantoja-y-paquirri" src="https://embed-audio.cnevids.com/script/episode/bb2ef05b-de71-469a-b0a5-829f2a54dac6?skin=vf&target=js-audio1" defer></script><div id="js-audio1"></div>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "anchorName": "isabel-pantoja-y-paquirri",
              "audioEnv": "production",
              "audioId": "bb2ef05b-de71-469a-b0a5-829f2a54dac6",
              "audioType": "episode",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cne-audio-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("iframe with anchor", () => {
    let doc = HTMLSource.fromRaw(
      `<iframe id="isabel-pantoja-y-paquirri" src="https://embed-audio.cnevids.com/iframe/episode/bb2ef05b-de71-469a-b0a5-829f2a54dac6?skin=vf" frameborder="0" height="244" sandbox=allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "anchorName": "isabel-pantoja-y-paquirri",
              "audioEnv": "production",
              "audioId": "bb2ef05b-de71-469a-b0a5-829f2a54dac6",
              "audioType": "episode",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cne-audio-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("equality", () => {
    expect(
      serialize(
        HTMLSource.fromRaw(
          `<iframe src="https://embed-audio.cnevids.com/iframe/episode/bb2ef05b-de71-469a-b0a5-829f2a54dac6?skin=vf" frameborder="0" height="244" sandbox=allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>`
        ).convertTo(OffsetSource),
        { withStableIds: true }
      )
    ).toEqual(
      serialize(
        HTMLSource.fromRaw(
          `<script src="https://embed-audio.cnevids.com/script/episode/bb2ef05b-de71-469a-b0a5-829f2a54dac6?skin=vf&target=js-audio1" defer></script><div id="js-audio1"></div>`
        ).convertTo(OffsetSource),
        { withStableIds: true }
      )
    );
  });
});
