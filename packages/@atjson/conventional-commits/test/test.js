'use strict'
var conventionalChangelogCore = require('conventional-changelog-core');
var config = require('../');
var expect = require('chai').expect;
var mocha = require('mocha');
var describe = mocha.describe;
var it = mocha.it;
var before = mocha.before;
var gitDummyCommit = require('git-dummy-commit');
var shell = require('shelljs');
var through = require('through2');

describe('emoji preset', function () {
  before(function () {
    shell.config.silent = true;
    shell.rm('-rf', 'tmp');
    shell.mkdir('tmp');
    shell.cd('tmp');
    shell.mkdir('git-templates');
    shell.exec('git init --template=./git-templates');

    gitDummyCommit(['✨👑✨ Make Annotations classes instead of JS objects (#54)', '🚨 Annotations are always vendor prefixed', '🚨 The schema for a document is a list of annotation classes']);
    gitDummyCommit(['✨🛸✨ Add support for Unknown Annotations (#55)', "This casts any annotations not identified in the schema list into an UnknownAnnotation. Unknown Annotations are AtJSON's form of Ruby's `method_missing`, with the added benefit that these annotations will be stored and updated in a document even after being updated."]);
    gitDummyCommit('🐛🔍 Fix querying to work with Annotation classes (#56)');
    gitDummyCommit('🌳 Rework the hierarchical text format to work with annotation classes (#59)');
    gitDummyCommit('🐛🛰 Fix leading whitespace and tabs turning into code blocks (#53)');
    gitDummyCommit('✨ Add support for horizontal rules, subscript, and superscript from Google Docs (#52)');
    gitDummyCommit('📚 Add TypeDoc documentation (#45)');
    gitDummyCommit('✨📈 Add Graphviz renderer');
    gitDummyCommit('👩🏾‍⚖️ Add Apache 2.0 License');
    gitDummyCommit('⏪ Undoing #45');
  })

  it('should work if there is no semver tag', function (done) {
    conventionalChangelogCore({
      config: config
    }).on('error', function (err) {
      done(err)
    }).pipe(through(function (chunk) {
      chunk = chunk.toString();

      expect(chunk).to.include('#54');
      expect(chunk).to.include('### ✨ New Features');
      expect(chunk).to.include('### 🐛 Fixes');
      expect(chunk).to.include('### ⚖️ Legal Changes');
      expect(chunk).to.include('### 🚨 Breaking Changes');
      

      expect(chunk).to.not.include('CLEANUP');
      expect(chunk).to.not.include('FEATURE');
      expect(chunk).to.not.include('Bad');
      expect(chunk).to.not.include('#45');

      done();
    }));
  });
});
