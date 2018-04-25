"use strict";

module.exports = {
  headerPattern: /^((:[a-zA-Z_]*:\s?)+) (.*)$/,
  headerCorrespondence: [
    "emojiShortcodes",
    "_",
    "subject"
  ],
  noteKeywords: [":rotating_light:"],
  revertPattern: /^[:man_facepalming:|:woman_facepalming:]\s([\s\S]*?)\s*This reverts commit (\w)\.*/,
  revertCorrespondence: ["header", "hash"]
};
