import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("FireworkEmbed", () => {
  test("with channel name and playlist", () => {
    let doc = HTMLSource.fromRaw(
      `<fw-embed-feed channel="awesome-channel" playlist="kj43j2" ui_border_style = "hard"></fw-embed-feed>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "channel": "awesome-channel",
              "playlistId": "kj43j2",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "firework-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("without channel name", () => {
    let doc = HTMLSource.fromRaw(
      `<fw-embed-feed id="firework-embed-2" playlist="def" mode="row" open_in="_modal" max_videos="0" placement="middle" player_placement="bottom-right" pip="false" captions="false" player_minimize="false" branding="false"></fw-embed-feed>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "open": "_modal",
              "playlistId": "def",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "firework-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("without channel open_in", () => {
    let doc = HTMLSource.fromRaw(
      `<fw-embed-feed id="firework-embed-3" channel="vanity_fair" playlist="hij" mode="row" max_videos="0" placement="middle" player_placement="bottom-right" pip="false" captions="false" player_minimize="false" branding="false"></fw-embed-feed>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "channel": "vanity_fair",
              "playlistId": "hij",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "firework-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("combined playlist and channel", () => {
    let doc = HTMLSource.fromRaw(
      `<fw-embed-feed id="firework-embed-3" channel="undefined" playlist="allure|hij" mode="row" max_videos="0" placement="middle" player_placement="bottom-right" pip="false" captions="false" player_minimize="false" branding="false"></fw-embed-feed>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "channel": "allure",
              "playlistId": "hij",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "firework-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("with fwpub script", () => {
    let doc = HTMLSource.fromRaw(
      `<script async
        type="text/javascript"
        src="//asset.fwpub1.com/js/embed-feed.js"
       ></script>\n<fw-embed-feed
        channel="awesome-channel"
        playlist="jkl"
        mode="row"
        open_in="default"
        max_videos="0"
        placement="middle"
        player_placement="bottom-right"
      ></fw-embed-feed>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "channel": "awesome-channel",
              "open": "default",
              "playlistId": "jkl",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "firework-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("with fwcdn script", () => {
    let doc = HTMLSource.fromRaw(
      `<script async
        type="text/javascript"
        src="//asset.fwcdn3.com/js/embed-feed.js"
       ></script>\n<fw-embed-feed
        channel="awesome-channel"
        playlist="jkl"
        mode="row"
        open_in="default"
        max_videos="0"
        placement="middle"
        player_placement="bottom-right"
      ></fw-embed-feed>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "channel": "awesome-channel",
              "open": "default",
              "playlistId": "jkl",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "firework-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });
});
