"use strict";

module.exports = {
  headerPattern: /^((:[a-zA-Z_]*:\s?)+) (.*)$/,
  headerCorrespondence: [
    "emojiShortcodes",
    "_",
    "subject"
  ],
  noteKeywords: ["🚨"],
  revertPattern: /^⏪\s([\s\S]*?)\s*This reverts commit (\w)\.*/,
  revertCorrespondence: ["header", "hash"]
};
