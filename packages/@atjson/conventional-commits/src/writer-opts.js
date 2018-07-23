"use strict";

const Q = require("q");
const readFile = Q.denodeify(require("fs").readFile);
const resolve = require("path").resolve;

module.exports = Q.all([
  readFile(resolve(__dirname, "./templates/template.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./templates/header.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./templates/commit.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./emoji.csv"), "utf-8")
]).spread((template, header, commit, emojis) => {
  let emojiLookup = emojis.toString().split('\n').slice(1).reduce((shortcodes, line) => {
    let [emoji, tag] = line.split(',');
    shortcodes[emoji] = tag;
    return shortcodes;
  }, {});

  const opts = getWriterOpts(emojiLookup);

  opts.mainTemplate = template;
  opts.headerPartial = header;
  opts.commitPartial = commit;

  return opts;
});

const LOW = 0;
const MEDIUM = 1;
const HIGH = 16;
const SEVERITY = {
  build: LOW,
  ci: LOW,
  chore: LOW,
  docs: LOW,
  legal: HIGH,
  feat: HIGH,
  fix: HIGH,
  perf: MEDIUM,
  refactor: MEDIUM,
  style: MEDIUM,
  test: MEDIUM,
};

function getWriterOpts(shortcodes) {
  return {
    transform(commit, context) {
      let discard = true;
      let issues = [];

      commit.notes.forEach((note) => {
        note.title = "🚨 Breaking Changes";
        discard = false;
      });

      var bestMatch = null;
      Object.keys(shortcodes).forEach((emoji) => {
        if (commit.emojis && commit.emojis.indexOf(emoji) !== -1) {
          let tag = shortcodes[emoji];
          if (bestMatch == null || SEVERITY[tag] < SEVERITY[bestMatch]) {
            bestMatch = tag; 
          }
        }
      });

      if (bestMatch == null || SEVERITY[bestMatch] !== HIGH) {
        return null;
      }

      if (bestMatch === 'feat') {
        commit.type = '✨ New Features';
      } else if (bestMatch === 'fix') {
        commit.type = '🐛 Fixes';
      } else if (bestMatch === 'legal') {
        commit.type = '⚖️ Legal Changes';
      }

      if (typeof commit.subject === `string`) {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl;
        if (url) {
          url = `${url}/issues/`;
          // Issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue);
            return `[#${issue}](${url}${issue})`;
          });
        }

        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(/\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g, `[@$1](${context.host}/$1)`);
        }
      }

      // remove references that already appear in the subject
      commit.references = commit.references.filter(reference => {
        if (issues.indexOf(reference.issue) === -1) {
          return true;
        }

        return false;
      });

      return commit;
    },
    groupBy: "type",
    commitGroupsSort: "title",
    commitsSort: ["scope", "subject"],
    noteGroupsSort: "title"
  };
}
