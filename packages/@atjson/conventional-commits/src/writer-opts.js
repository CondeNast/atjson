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
  package: {
    type: "Chore",
    scope: ":package: Packages",
    priorty: LOW
  },
  nail_care: {
    type: ":lipstick: Style",
    priorty: MEDIUM
  },
  lipstick: {
    type: ":lipstick: Style",
    priorty: MEDIUM
  },
  bug: {
    type: ":bug: Fixes",
    priorty: HIGH,
    keep: true
  },
  bee: {
    type: ":bug: Fixes",
    priorty: HIGH,
    keep: true
  },
  traffic_light: {
    type: ":vertical_traffic_light: Tests",
    priorty: MEDIUM
  },
  vertical_traffic_light: {
    type: ":vertical_traffic_light: Tests",
    priorty: MEDIUM
  },
  lock: {
    type: ":bug: Fix",
    scope: ":lock: Security",
    priorty: HIGH,
    keep: true
  },
  notebook: {
    type: "Chore",
    scope: ":notebook: Documentation",
    priorty: LOW
  },
  books: {
    type: "Chore",
    scope: ":books: Documentation",
    priorty: LOW
  },
  rocket: {
    type: ":rocket: Performance",
    priorty: MEDIUM,
    keep: true
  },
  sparkles: {
    type: ":tada: Features",
    priorty: HIGH,
    keep: true
  },
  tada: {
    type: ":tada: Features",
    priorty: HIGH,
    keep: true
  },
  confetti_ball: {
    type: ":tada: Features",
    priorty: HIGH,
    keep: true
  },
  man_health_worker: {
    type: ":woman_health_worker: Refactor",
    priorty: MEDIUM
  },
  woman_health_worker: {
    type: ":woman_health_worker: Refactor",
    priorty: MEDIUM
  },
  mount_fuji: {
    type: ":robot: Continuous Integration",
    scope: ":mount_fuji: CodeClimate",
    priorty: LOW
  },
  construction_worker_woman: {
    type: ":robot: Continuous Integration",
    scope: ":construction_worker_woman: TravisCI",
    priorty: LOW
  },
  construction_worker_man: {
    type: ":robot: Continuous Integration",
    scope: ":construction_worker_woman: TravisCI",
    priorty: LOW
  },
  woman_student: {
    type: "Chore",
    scope: ":woman_student: Legal",
    priorty: LOW
  },
  man_student: {
    type: "Chore",
    scope: ":man_student: Legal",
    priorty: LOW
  },
  balance_scale: {
    type: "Chore",
    scope: ":balance_scale: Legal",
    priorty: LOW
  }
};


function getWriterOpts() {
  return {
    transform(commit, context) {
      let discard = true;
      let issues = [];

      commit.notes.forEach((note) => {
        note.title = ":rotating_light: Breaking Changes :rotating_light:";
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
