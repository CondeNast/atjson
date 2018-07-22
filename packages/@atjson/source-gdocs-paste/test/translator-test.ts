import * as fs from 'fs';
import * as path from 'path';
import GDocsSource from '../src';

describe('@atjson/source-gdocs-paste', () => {
  let atjson;

  beforeAll(() => {
    let fixturePath = path.join(__dirname, 'fixtures', 'complex.json');
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromSource(rawJSON);
    atjson = gdocs.toCommonSchema().toJSON();
  });

  it('correctly converts -gdocs-ts_bd to bold', () => {
    let bolds = atjson.annotations.filter(a => a.type === 'bold');
    expect(bolds.length).toEqual(2);
  });

  it('correctly converts italic', () => {
    let italics = atjson.annotations.filter(a => a.type === 'italic');
    expect(italics.length).toEqual(2);
  });

  it('correctly converts headings', () => {
    let headings = atjson.annotations.filter(a => a.type === 'heading');
    expect(headings.length).toEqual(4);
    expect(headings.map(h => h.attributes.level)).toEqual([1, 2, 100, 101]);
  });

  it('correctly converts lists', () => {
    let lists = atjson.annotations.filter(a => a.type === 'list');
    expect(lists.length).toEqual(1);
  });

  it('correctly converts list-items', () => {
    let listItems = atjson.annotations.filter(a => a.type === 'list-item');
    expect(listItems.length).toEqual(2);
  });

  it('correctly converts links', () => {
    let links = atjson.annotations.filter(a => a.type === 'link');
    expect(links.length).toEqual(1);
    expect(links[0].attributes.url).toEqual('https://www.google.com/');
  });
});
