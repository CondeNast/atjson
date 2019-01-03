import OffsetSource from '@atjson/offset-annotations';
import * as fs from 'fs';
import * as path from 'path';
import GDocsSource from '../src';

describe('@atjson/source-gdocs-paste', () => {
  var atjson: OffsetSource;

  beforeAll(() => {
    // https://docs.google.com/document/d/18pp4dAGx5II596HHGOLUXXcc6VKLAVRBUMLm9Ge8eOE/edit?usp=sharing
    let fixturePath = path.join(__dirname, 'fixtures', 'complex.json');
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    atjson = gdocs.convertTo(OffsetSource);
  });

  it('correctly converts -gdocs-ts_bd to bold', () => {
    let bolds = atjson.where(a => a.type === 'bold');
    expect(bolds.length).toEqual(2);
  });

  it('correctly converts italic', () => {
    let italics = atjson.where(a => a.type === 'italic');
    expect(italics.length).toEqual(2);
  });

  it('correctly converts headings', () => {
    let headings = atjson.where(a => a.type === 'heading');
    expect(headings.length).toEqual(4);
    expect(headings.map(h => h.attributes.level)).toEqual([1, 2, 100, 101]);
  });

  it('correctly converts lists', () => {
    let lists = atjson.where(a => a.type === 'list');
    expect(lists.length).toEqual(2);
  });

  it('correctly converts numbered lists', () => {
    let lists = atjson.where(a => a.type === 'list' && a.attributes.type === 'numbered')
    expect(lists.length).toEqual(1);
  });

  it('correctly converts bulleted lists', () => {
    let lists = atjson.where(a => a.type === 'list' && a.attributes.type === 'bulleted');
    expect(lists.length).toEqual(1);
  });

  it('correctly converts list-items', () => {
    let listItems = atjson.where(a => a.type === 'list-item');
    expect(listItems.length).toEqual(4);
  });

  it('correctly converts links', () => {
    let links = atjson.where(a => a.type === 'link');
    expect(links.length).toEqual(1);
    expect(links.map(link => link.attributes.url)).toEqual(['https://www.google.com/']);
  });

  it('removes underlined text aligned exactly with links', () => {
    // https://docs.google.com/document/d/18pp4dAGx5II596HHGOLUXXcc6VKLAVRBUMLm9Ge8eOE/edit?usp=sharing
    let fixturePath = path.join(__dirname, 'fixtures', 'underline.json');
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    let doc = gdocs.convertTo(OffsetSource);

    let links = doc.where({ type: '-offset-link' }).as('links');
    let underlines = doc.where({ type: '-offset-underline' }).as('underline');

    expect(
      links.join(underlines, (a, b) => a.isAlignedWith(b)).length
    ).toBe(0);
  });
});

describe('@atjson/source-gdocs-paste paragraphs', () => {
  let atjson: OffsetSource;

  beforeAll(() => {
    // https://docs.google.com/document/d/1PzhE6OJqRIHrDZcXBjw7UsjUhH_ITPP7tgg2s9fhPf4/edit
    let fixturePath = path.join(__dirname, 'fixtures', 'paragraphs.json');
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    atjson = gdocs.convertTo(OffsetSource);
  });

  it('removes all vertical tabs', () => {
    expect(atjson.match(/\u000b/g)).toEqual([]);
  });

  it('created three paragraphs before the list', () => {
    let listsAndParagraphs = atjson.where({ type: '-offset-list' }).as('list')
      .join(
        atjson.where({ type: '-offset-paragraph'}).as('paragraphs'),
        (l, r) => r.end <= l.start
      );

    expect(listsAndParagraphs.toJSON()[0]).toEqual({
      list: {
        attributes: {
          '-offset-type': 'numbered'
        },
        start: 214,
        end: 486,
        id: 'Any<id>',
        type: '-offset-list'
      },
      paragraphs: [
        {
          attributes: {},
          start: 0,
          end: 117,
          id: 'Any<id>',
          type: '-offset-paragraph'
        },
        {
          attributes: {},
          start: 119,
          end: 163,
          id: 'Any<id>',
          type: '-offset-paragraph'
        },
        {
          attributes: {},
          start: 166,
          end: 214,
          id: 'Any<id>',
          type: '-offset-paragraph'
        }
      ]
    });
  });
});
