"use strict";
const fs = require('fs');
const path = require('path');

let config = fs.readFileSync(path.resolve(__dirname, './emoji.csv'), 'utf-8').toString().split('\n').slice(1);
let featureEmojis = config.reduce((emojis, line) => {
  let [emoji, _, versionBump] = line.split(',');
  if (versionBump === 'minor') {
    emojis.push(emoji);
  }
  return emojis;
}, []);

let breakingChangeEmojis = config.reduce((emojis, line) => {
  let [emoji, _, versionBump] = line.split(',');
  if (versionBump === 'breaking') {
    emojis.push(emoji);
  }
  return emojis;
}, []);

let revertEmojis = config.reduce((emojis, line) => {
  let [emoji, _, versionBump] = line.split(',');
  if (versionBump === 'revert') {
    emojis.push(emoji);
  }
  return emojis;
}, []);

module.exports = {
  whatBump: (commits) => {
    let level = 2;
    let breakings = 0;
    let features = 0;

    commits.forEach(commit => {
      if (commit.notes.length > 0) {
        breakings += commit.notes.length;
        level = 0;
      } else if (commit.emojis.some(emoji => featureEmojis.indexOf(emoji))) {
        features += 1;
        if (level === 2) {
          level = 1;
        }
      }
    });

    return {
      level: level,
      reason: breakings === 1
        ? `There is ${breakingChangeEmojis[0]} ${breakings} breaking change and ${featureEmojis[0]} ${features} features`
        : `There are ${breakingChangeEmojis[0]} ${breakings} breaking changes and ${featureEmojis[0]} ${features} features`
    };
  },

  parserOpts: {
    headerPattern: /^(((?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*)+)\s*(.*)/,
    headerCorrespondence: [
      "emojis",
      "_",
      "subject"
    ],
    noteKeywords: breakingChangeEmojis,
    revertPattern: new RegExp(`^[${revertEmojis.join('|')}]\\s([\\s\\S]*?)\\s*Undoing PR (#\\d+)\\.*`),
    revertCorrespondence: ["header", "hash"]
  }
};
