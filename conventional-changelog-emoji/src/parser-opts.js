"use strict";
const fs = require("fs");
const path = require("path");

let config = fs
  .readFileSync(path.resolve(__dirname, "./emoji.csv"), "utf-8")
  .toString()
  .split("\n")
  .slice(1);

let breakingChangeEmojis = config.reduce((emojis, line) => {
  let [emoji, _, versionBump] = line.split(",");
  if (versionBump === "breaking") {
    emojis.push(emoji);
  }
  return emojis;
}, []);

let revertEmojis = config.reduce((emojis, line) => {
  let [emoji, message] = line.split(",");
  if (message === "revert") {
    emojis.push(emoji);
  }
  return emojis;
}, []);

module.exports = {
  headerPattern: /^(((?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*)+)\s*(.*)$/,
  headerCorrespondence: ["emojis", "_", "subject"],
  noteKeywords: breakingChangeEmojis,
  revertPattern: new RegExp(
    `^[${revertEmojis.join("|")}]\\s([\\s\\S]*?)\\s*Undoing (#\\d+)\\.*`
  ),
  revertCorrespondence: ["header", "hash"]
};
