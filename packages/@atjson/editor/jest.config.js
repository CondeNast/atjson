const { defaults: tsjPreset } = require('ts-jest/presets');
const path = require('path');

module.exports = {
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "json"
  ],
  globals: {
    "ts-jest": {
      "diagnostics": {
        "warnOnly": true
      }
    }
  },
  moduleNameMapper: {
    "^(@atjson/.*)$": path.join(path.resolve(__dirname, '../../../'), "/packages/$1/src/index.ts")
  },
  testURL: "http://localhost",
  preset: "jest-puppeteer",
  testMatch: [
    "**/*-test.(ts|tsx|js)"
  ],
  preset: 'jest-puppeteer',
  transform: {
    ...tsjPreset.transform
  }
}