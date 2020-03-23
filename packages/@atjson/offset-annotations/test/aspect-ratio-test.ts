import { getClosestAspectRatio } from "../src";

describe("getClosestAspectRatio", () => {
  test("exact matches", () => {
    // 16:9
    ([
      [1920, 1080],
      [1280, 720],
      [1024, 576],
      [768, 432],
      [512, 288],
      [256, 144],
      [1792, 1008],
      [1152, 648],
      [896, 504],
      [640, 360],
      [384, 216],
      [128, 72],
      [1856, 1044],
      [1216, 684],
      [1088, 612],
      [960, 540],
      [832, 468],
      [704, 396],
      [576, 324],
      [448, 252],
      [320, 180],
      [192, 108],
    ] as const).forEach(([width, height]) => {
      expect(getClosestAspectRatio(width, height)).toBe("16:9");
    });

    // 4:3
    ([
      [640, 480],
      [608, 456],
      [624, 468],
      [576, 432],
      [544, 408],
      [592, 444],
      [512, 384],
      [480, 360],
      [560, 420],
      [448, 336],
      [416, 312],
      [528, 396],
      [384, 288],
      [352, 264],
      [496, 372],
      [320, 240],
      [288, 216],
      [464, 348],
      [256, 192],
      [224, 168],
      [432, 324],
      [192, 144],
      [160, 120],
      [400, 300],
      [128, 96],
      [368, 276],
      [336, 252],
      [304, 228],
      [272, 204],
      [240, 180],
      [208, 156],
      [176, 132],
      [144, 108],
      [112, 84],
    ] as const).forEach(([width, height]) => {
      expect(getClosestAspectRatio(width, height)).toBe("4:3");
    });
  });

  test("vertical video", () => {
    // Instagram video
    expect(getClosestAspectRatio(864, 1080)).toBe("4:5");

    expect(getClosestAspectRatio(720, 1280)).toBe("9:16");
  });

  test("super wide video", () => {
    expect(getClosestAspectRatio(50, 2)).toBe("3.6:1");
  });
});
