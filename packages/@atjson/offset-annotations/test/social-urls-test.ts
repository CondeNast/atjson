import { IframeEmbed, TelegramEmbed, SocialURLs } from "../src";

describe("SocialURLs", () => {
  describe("identify Spotify", () => {
    test.each([
      [
        "https://open.spotify.com/embed-podcast/episode/5YNTk67O5fpJfYZAIpCZCz",
        {
          url: "https://open.spotify.com/embed-podcast/episode/5YNTk67O5fpJfYZAIpCZCz",
          height: "232",
          width: "100%",
        },
      ],
      [
        "https://open.spotify.com/episode/056ZfewzAOQFphcDjva5bP?si=W4NnJijJR7-kwC3R2uPXHQ",
        {
          url: "https://open.spotify.com/embed-podcast/episode/056ZfewzAOQFphcDjva5bP",
          height: "232",
          width: "100%",
        },
      ],
      [
        "https://open.spotify.com/track/6yIHnRHSUlhp4RuNAbB3Pf?si=M-B6Z34wSneRlUGCzTAR8g",
        {
          url: "https://open.spotify.com/embed/track/6yIHnRHSUlhp4RuNAbB3Pf",
          height: "80",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/embed/track/6yIHnRHSUlhp4RuNAbB3Pf",
        {
          url: "https://open.spotify.com/embed/track/6yIHnRHSUlhp4RuNAbB3Pf",
          height: "80",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/album/0RZ90KfXzXhQrgnoMcANUN?si=ebW0UcBIQk6dlMgdnnBETA",
        {
          url: "https://open.spotify.com/embed/album/0RZ90KfXzXhQrgnoMcANUN",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/embed/album/0RZ90KfXzXhQrgnoMcANUN",
        {
          url: "https://open.spotify.com/embed/album/0RZ90KfXzXhQrgnoMcANUN",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/artist/4uSftVc3FPWe6RJuMZNEe9?si=AbCHDBLAR7GAIb8b0lNsNA",
        {
          url: "https://open.spotify.com/embed/artist/4uSftVc3FPWe6RJuMZNEe9",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/embed/artist/4uSftVc3FPWe6RJuMZNEe9",
        {
          url: "https://open.spotify.com/embed/artist/4uSftVc3FPWe6RJuMZNEe9",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/playlist/2s1HL7UaXEPWqJR4E1Gt1A?si=RjZGyBmdTcyrh6WzjN0oDA",
        {
          url: "https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A",
        {
          url: "https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/show/1iohmBNlRooIVtukKeavRa?si=_ZEhAhfZTUGz3UOKPLkH8Q",
        {
          url: "https://open.spotify.com/embed-podcast/show/1iohmBNlRooIVtukKeavRa",
          height: "232",
          width: "100%",
        },
      ],
      [
        "https://open.spotify.com/embed-podcast/show/1iohmBNlRooIVtukKeavRa",
        {
          url: "https://open.spotify.com/embed-podcast/show/1iohmBNlRooIVtukKeavRa",
          height: "232",
          width: "100%",
        },
      ],
      [
        "https://open.spotify.com/embed?uri=spotify:album:0RZ90KfXzXhQrgnoMcANUN",
        {
          url: "https://open.spotify.com/embed/album/0RZ90KfXzXhQrgnoMcANUN",
          height: "380",
          width: "300",
        },
      ],
    ])("%s", (url, attributes) => {
      expect(SocialURLs.identify(new URL(url))).toMatchObject({
        Class: IframeEmbed,
        attributes,
      });
    });
  });

  describe("identify Megaphone", () => {
    test.each([
      [
        "http://playlist.megaphone.fm?e=PPY2173798513&light=true",
        {
          url: "https://playlist.megaphone.fm/?e=PPY2173798513&light=true",
          height: "200",
          width: "100%",
        },
      ],
      [
        "https://playlist.megaphone.fm/?p=DGT6274552575",
        {
          url: "https://playlist.megaphone.fm/?p=DGT6274552575",
          height: "485",
          width: "100%",
        },
      ],
    ])("%s", (url, attributes) => {
      expect(SocialURLs.identify(new URL(url))).toMatchObject({
        Class: IframeEmbed,
        attributes,
      });
    });
  });

  describe("identify Telegram", () => {
    test.each([
      [
        "https://t.me/voguerussia/8714/",
        {
          url: "voguerussia/8714",
        },
      ],
      [
        "http://t.me/tatlerbutler/3416",
        {
          url: "tatlerbutler/3416",
        },
      ],
    ])("%s", (url, attributes) => {
      expect(SocialURLs.identify(new URL(url))).toMatchObject({
        Class: TelegramEmbed,
        attributes,
      });
    });
  });
  describe("identify Reddit", () => {
    test.each([
      [
        "https://www.redditmedia.com/r/AskReddit/comments/quu4c5/as_you_get_older_whats_something_that_becomes/",
        {
          url: "https://www.redditmedia.com/r/AskReddit/comments/quu4c5/as_you_get_older_whats_something_that_becomes/?ref_source=embed&amp;ref=share&amp;embed=true",
          height: "141",
          width: "640",
        },
      ],
      //<iframe id="reddit-embed" src="https://www.redditmedia.com/r/AskReddit/comments/qwujhq/you_are_accidently_sent_back_in_time_to_1986_and/?ref_source=embed&amp;ref=share&amp;embed=true" sandbox="allow-scripts allow-same-origin allow-popups" style="border: none;" scrolling="no" width="640" height="158"></iframe>
      [
        "https://www.redditmedia.com/r/AskReddit/comments/quu4c5/as_you_get_older_whats_something_that_becomes/",
        {
          url: "https://www.redditmedia.com/r/AskReddit/comments/quu4c5/as_you_get_older_whats_something_that_becomes/?ref_source=embed&amp;ref=share&amp;embed=true",
          height: "141",
          width: "640",
        },
      ],
      [
        "https://www.reddit.com/r/AskReddit/comments/quu4c5/as_you_get_older_whats_something_that_becomes/?utm_source=share&utm_medium=web2x&context=3",
        {
          url: "https://www.redditmedia.com/r/AskReddit/comments/quu4c5/as_you_get_older_whats_something_that_becomes/?ref_source=embed&amp;ref=share&amp;embed=true",
          height: "141",
          width: "640",
        },
      ],
    ])("%s", (url, attributes) => {
      expect(SocialURLs.identify(new URL(url))).toMatchObject({
        Class: IframeEmbed,
        attributes,
      });
    });
  });
});
