import {
  IframeEmbed,
  InstagramEmbed,
  MastodonEmbed,
  SocialURLs,
  ThreadsEmbed,
  TwitterEmbed,
} from "../src";

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

  describe("identify Instagram", () => {
    test.each([
      [
        "https://www.instagram.com/reel/CDt37vzFw3f",
        {
          url: "https://www.instagram.com/reel/CDt37vzFw3f",
        },
      ],
    ])("%s", (url, attributes) => {
      expect(SocialURLs.identify(new URL(url))).toMatchObject({
        Class: InstagramEmbed,
        attributes,
      });
    });
  });

  describe("identify Tweets", () => {
    test.each([
      [
        "https://twitter.com/dril/status/1696601385385816223",
        {
          url: "https://twitter.com/dril/status/1696601385385816223",
        },
      ],
      [
        "https://x.com/dril/status/1696601385385816223",
        {
          url: "https://twitter.com/dril/status/1696601385385816223",
        },
      ],
      [
        "https://www.twitter.com/dril/status/1696601385385816223",
        {
          url: "https://twitter.com/dril/status/1696601385385816223",
        },
      ],
    ])("%s", (url, attributes) => {
      expect(SocialURLs.identify(new URL(url))).toMatchObject({
        Class: TwitterEmbed,
        attributes,
      });
    });
  });

  describe("identify Threads", () => {
    test.each([["https://www.threads.net/@voguemagazine/post/C6v2RQfMvKS"]])(
      "%s",
      (url) => {
        expect(SocialURLs.identify(new URL(url))).toMatchObject({
          Class: ThreadsEmbed,
          attributes: { url },
        });
      }
    );
  });

  describe("identify Mastodon embeds", () => {
    test.each([
      ["https://mastodon.social/@thisemailfindsyou/112428613749566319"],
    ])("%s", (url) => {
      expect(SocialURLs.identify(new URL(url))).toMatchObject({
        Class: MastodonEmbed,
        attributes: {
          url,
        },
      });
    });
  });
});
