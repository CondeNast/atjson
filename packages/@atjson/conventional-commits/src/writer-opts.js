"use strict";

const compareFunc = require("compare-func");
const Q = require("q");
const readFile = Q.denodeify(require("fs").readFile);
const resolve = require("path").resolve;

module.exports = Q.all([
  readFile(resolve(__dirname, "./templates/template.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./templates/header.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./templates/commit.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./templates/footer.hbs"), "utf-8"),
]).spread((template, header, commit, footer) => {
  const opts = getWriterOpts();

  opts.mainTemplate = template;
  opts.headerPartial = header;
  opts.commitPartial = commit;
  opts.footerPartial = footer;

  return opts;
});

const LOW = 0;
const MEDIUM = 1;
const HIGH = 16;

const SHORTCODES = {
  '📦': {
    type: "Chore",
    scope: "📦 Packages",
    priorty: LOW
  },
  '💅': {
    type: "💄 Style",
    priorty: MEDIUM
  },
  '💅🏻': {
    type: "💄 Style",
    priorty: MEDIUM
  },
  '💅🏼': {
    type: "💄 Style",
    priorty: MEDIUM
  },
  '💅🏽': {
    type: "💄 Style",
    priorty: MEDIUM
  },
  '💅🏾': {
    type: "💄 Style",
    priorty: MEDIUM
  },
  '💅🏿': {
    type: "💄 Style",
    priorty: MEDIUM
  },
  '💄': {
    type: "💄 Style",
    priorty: MEDIUM
  },
  '🐛': {
    type: "🐛 Fixes",
    priorty: HIGH,
    keep: true
  },
  '🐝': {
    type: "🐛 Fixes",
    priorty: HIGH,
    keep: true
  },
  '🚦': {
    type: "🚦 Tests",
    priorty: MEDIUM
  },
  '🚥': {
    type: "🚦 Tests",
    priorty: MEDIUM
  },
  '🔒': {
    type: ":bug: Fix",
    scope: "🔒 Security",
    priorty: HIGH,
    keep: true
  },
  '📓': {
    type: "Chore",
    scope: "📚 Documentation",
    priorty: LOW
  },
  '📚': {
    type: "Chore",
    scope: "📚 Documentation",
    priorty: LOW
  },
  '🚀': {
    type: "🚀 Performance",
    priorty: MEDIUM,
    keep: true
  },
  '✨': {
    type: "✨ Features",
    priorty: HIGH,
    keep: true
  },
  '🎉': {
    type: "✨ Features",
    priorty: HIGH,
    keep: true
  },
  '🎊': {
    type: "✨ Features",
    priorty: HIGH,
    keep: true
  },
  '👩‍⚕️': {
    type: "👩‍⚕️ Refactor",
    priorty: MEDIUM
  },
  '👨‍⚕️': {
    type: "👩‍⚕️ Refactor",
    priorty: MEDIUM
  },
  '🗻': {
    type: "🤖 Continuous Integration",
    scope: "🗻 CodeClimate",
    priorty: LOW
  },
  '👷‍♀️': {
    type: "🤖 Continuous Integration",
    scope: "👷‍♀️ TravisCI",
    priorty: LOW
  },
  '👷‍♂️': {
    type: "🤖 Continuous Integration",
    scope: "👷‍ TravisCI",
    priorty: LOW
  },
  '👩‍⚖️': {
    type: "Chore",
    scope: "👩‍⚖️ Legal",
    priorty: LOW
  },
  '👨‍⚖️': {
    type: "Chore",
    scope: "👨‍⚖️ Legal",
    priorty: LOW
  },
  '⚖️': {
    type: "Chore",
    scope: "⚖️ Legal",
    priorty: LOW
  }
};


function getWriterOpts() {
  return {
    transform(commit, context) {
      let discard = true;
      let issues = [];

      commit.notes.forEach((note) => {
        note.title = "🚨 Breaking Changes";
        discard = false;
      });

      let bestMatch = null;
      commit.emojiShortcodes.split(':').forEach((code) => {
        let shortcode = SHORTCODES[code];
        if (shortcode &&
            (bestMatch == null || shortcode.priority > bestMatch.priority)) {
          bestMatch = shortcode;
        }
      });

      if (bestMatch == null || !bestMatch.keep) {
        return null;
      }

      commit.type = bestMatch.type;
      commit.scope = bestMatch.scope || '';

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
    noteGroupsSort: "title",
    notesSort: compareFunc
  };
}
