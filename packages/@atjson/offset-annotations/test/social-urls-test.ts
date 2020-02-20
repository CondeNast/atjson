import { IframeEmbed, SocialURLs } from "../src";

describe("SocialURLs", () => {
  describe("identify Spotify", () => {
    test.each([
      [
        "https://open.spotify.com/embed-podcast/episode/5YNTk67O5fpJfYZAIpCZCz",
        {
          url:
            "https://open.spotify.com/embed-podcast/episode/5YNTk67O5fpJfYZAIpCZCz",
          height: "232",
          width: "100%"
        }
      ],
      [
        "https://open.spotify.com/episode/056ZfewzAOQFphcDjva5bP?si=W4NnJijJR7-kwC3R2uPXHQ",
        {
          url:
            "https://open.spotify.com/embed-podcast/episode/056ZfewzAOQFphcDjva5bP",
          height: "232",
          width: "100%"
        }
      ],
      [
        "https://open.spotify.com/track/6yIHnRHSUlhp4RuNAbB3Pf?si=M-B6Z34wSneRlUGCzTAR8g",
        {
          url: "https://open.spotify.com/embed/track/6yIHnRHSUlhp4RuNAbB3Pf",
          height: "80",
          width: "300"
        }
      ],
      [
        "https://open.spotify.com/embed/track/6yIHnRHSUlhp4RuNAbB3Pf",
        {
          url: "https://open.spotify.com/embed/track/6yIHnRHSUlhp4RuNAbB3Pf",
          height: "80",
          width: "300"
        }
      ],
      [
        "https://open.spotify.com/album/0RZ90KfXzXhQrgnoMcANUN?si=ebW0UcBIQk6dlMgdnnBETA",
        {
          url: "https://open.spotify.com/embed/album/0RZ90KfXzXhQrgnoMcANUN",
          height: "380",
          width: "300"
        }
      ],
      [
        "https://open.spotify.com/embed/album/0RZ90KfXzXhQrgnoMcANUN",
        {
          url: "https://open.spotify.com/embed/album/0RZ90KfXzXhQrgnoMcANUN",
          height: "380",
          width: "300"
        }
      ],
      [
        "https://open.spotify.com/artist/4uSftVc3FPWe6RJuMZNEe9?si=AbCHDBLAR7GAIb8b0lNsNA",
        {
          url: "https://open.spotify.com/embed/artist/4uSftVc3FPWe6RJuMZNEe9",
          height: "380",
          width: "300"
        }
      ],
      [
        "https://open.spotify.com/embed/artist/4uSftVc3FPWe6RJuMZNEe9",
        {
          url: "https://open.spotify.com/embed/artist/4uSftVc3FPWe6RJuMZNEe9",
          height: "380",
          width: "300"
        }
      ],
      [
        "https://open.spotify.com/playlist/2s1HL7UaXEPWqJR4E1Gt1A?si=RjZGyBmdTcyrh6WzjN0oDA",
        {
          url: "https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A",
          height: "380",
          width: "300"
        }
      ],
      [
        "https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A",
        {
          url: "https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A",
          height: "380",
          width: "300"
        }
      ],
      [
        "https://open.spotify.com/show/1iohmBNlRooIVtukKeavRa?si=_ZEhAhfZTUGz3UOKPLkH8Q",
        {
          url:
            "https://open.spotify.com/embed-podcast/show/1iohmBNlRooIVtukKeavRa",
          height: "232",
          width: "100%"
        }
      ],
      [
        "https://open.spotify.com/embed-podcast/show/1iohmBNlRooIVtukKeavRa",
        {
          url:
            "https://open.spotify.com/embed-podcast/show/1iohmBNlRooIVtukKeavRa",
          height: "232",
          width: "100%"
        }
      ]
    ])("%s", (url, attributes) => {
      expect(SocialURLs.identify(new URL(url))).toMatchObject({
        Class: IframeEmbed,
        attributes
      });
    });
  });
});
