"use strict";

module.exports = {
  whatBump: (commits) => {
    let level = 2;
    let breakings = 0;
    let features = 0;

    commits.forEach(commit => {
      if (commit.notes.length > 0) {
        breakings += commit.notes.length;
        level = 0;
      } else if (commit.emojiShortcodes.indexOf(':sparkles:') !== -1 ||
                 commit.emojiShortcodes.indexOf(':tada:') !== -1 ||
                 commit.emojiShortcodes.indexOf(':confetti_ball:') !== -1) {
        features += 1;
        if (level === 2) {
          level = 1;
        }
      }
    });

    return {
      level: level,
      reason: breakings === 1
        ? `There is 🚨 ${breakings} breaking change and ✨ ${features} features`
        : `There are 🚨 ${breakings} breaking changes and ✨ ${features} features`
    };
  },

  parserOpts: {
    headerPattern: /^((:[a-zA-Z_]*:\s?)+) (.*)$/,
    headerCorrespondence: [
      "emojiShortcodes",
      "_",
      "subject"
    ],
    noteKeywords: [":rotating_light:"],
    revertPattern: /^[:man_facepalming:|:woman_facepalming:]\s([\s\S]*?)\s*This reverts commit (\w)\.*/,
    revertCorrespondence: ["header", "hash"]
  }
};
