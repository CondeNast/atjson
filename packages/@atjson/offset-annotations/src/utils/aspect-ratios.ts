const ASPECT_RATIOS = [
  // Full portrait
  "9:16",
  // Vertical
  "2:3",
  "3:4",
  "4:5",
  // Square
  "1:1",
  // Fox Movietone
  "6:5",
  // Early TV
  "5:4",
  // Traditional TV
  "4:3",
  // Academy standard film
  "11:8",
  // 35mm
  "3:2",
  // Used for 4:3 / 16:9 TV compatability
  "14:9",
  // Computer screens
  "16:10",
  // European widescreen standard / Paramount format / Super 16mm
  "5:3",
  // HD video standard / Digital broadcast TV standard
  "16:9",
  // US widescreen cinema standard
  "37:20",
  // 4K & 2K standard
  "19:10",
  // Univisium
  "2:1",
  // 70mm film
  "11:5",
  // Cinematic widescreen
  "21:9",
  // Widescreen cinema standard
  "12:5",
  // Ultra-WideScreen
  "18:5",
] as const;

const proportions = ASPECT_RATIOS.map((ratio) => {
  let [width, height] = ratio.split(":");
  return {
    ratio,
    proportion: parseFloat(width) / parseFloat(height),
  };
}).sort((a, b) => {
  return a.proportion < b.proportion ? -1 : a.proportion > b.proportion ? 1 : 0;
});

const horizontalAspectRatios = proportions.filter(
  ({ proportion }) => proportion >= 1
);
const verticalAspectRatios = proportions.filter(
  ({ proportion }) => proportion <= 1
);

/**
 * Returns the closest aspect ratio for a video,
 * given a width and height. This is used to get the aspect
 * ratio for the VideoEmbed
 */
export function getClosestAspectRatio(width: number, height: number) {
  let proportion = width / height;
  let delta = Infinity;

  if (proportion === 1) {
    return "1:1" as const;
  }

  let aspectRatios =
    proportion > 1 ? horizontalAspectRatios : verticalAspectRatios;

  for (let i = 0, len = aspectRatios.length; i < len; i++) {
    let aspectRatio = aspectRatios[i];
    let currentDelta = Math.abs(proportion - aspectRatio.proportion);

    if (currentDelta > delta) {
      return aspectRatios[i - 1].ratio;
    }
    delta = currentDelta;
  }
  return aspectRatios[aspectRatios.length - 1].ratio;
}
