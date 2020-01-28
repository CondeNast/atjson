import { VideoURLs } from "../src";

describe("VideoURLs", () => {
  describe("brightcove", () => {
    test.each([
      "https://players.brightcove.net/635709154001/default_default/index.html?videoId=4898526370001",
      "https://players.brightcove.net/635709154001/default_default/index.html?videoId=5648767050001"
    ])("%s", url => {
      expect(VideoURLs.identify(new URL(url))).toEqual(url);
    });
  });

  describe("dailymotion", () => {
    test.each([
      "https://www.dailymotion.com/video/x73oxxw",
      "https://www.dailymotion.com/embed/video/x73oxxw"
    ])("%s", url => {
      expect(VideoURLs.identify(new URL(url))).toEqual(
        "https://www.dailymotion.com/embed/video/x73oxxw"
      );
    });
  });

  describe("Vimeo", () => {
    test.each([
      "https://vimeo.com/156254412",
      "https://www.vimeo.com/156254412",
      "http://vimeo.com/156254412",
      "http://player.vimeo.com/video/156254412"
    ])("%s", url => {
      expect(VideoURLs.identify(new URL(url))).toEqual(
        "https://player.vimeo.com/video/156254412"
      );
    });
  });

  describe("YouTube", () => {
    test.each([
      "https://www.youtube.com/watch?v=Mh5LY4Mz15o",
      "https://m.youtube.com/watch/?v=Mh5LY4Mz15o",
      "https://youtu.be/Mh5LY4Mz15o",
      "https://www.youtube.com/embed/Mh5LY4Mz15o"
    ])("%s", url => {
      expect(VideoURLs.identify(new URL(url))).toEqual(
        "https://www.youtube.com/embed/Mh5LY4Mz15o"
      );
    });
  });
});
