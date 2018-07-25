"use strict";

const Q = require("q");
const conventionalChangelog = require("./src/conventional-changelog");
const parserOpts = require("./src/parser-opts");
const recommendedBumpOpts = require("./src/conventional-recommended-bump");
const writerOpts = require("./src/writer-opts");

module.exports = Q.all([
  conventionalChangelog,
  parserOpts,
  recommendedBumpOpts,
  writerOpts
]).spread((conventionalChangelog, parserOpts, recommendedBumpOpts, writerOpts) => {
  return {
    conventionalChangelog,
    parserOpts,
    recommendedBumpOpts,
    writerOpts
  };
});
