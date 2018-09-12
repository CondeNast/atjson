import Document from '@atjson/document';
import * as fs from 'fs';
import * as path from 'path';
import GDocsSource from '../src/index';

describe('@atjson/source-gdocs-paste', () => {
  describe('relatively complex document', () => {
    let atjson;

    beforeAll(() => {
      // https://docs.google.com/document/d/18pp4dAGx5II596HHGOLUXXcc6VKLAVRBUMLm9Ge8eOE/edit?usp=sharing
      let fixturePath = path.join(__dirname, 'fixtures', 'complex.json');
      atjson = JSON.parse(fs.readFileSync(fixturePath).toString());
    });

    it('has some json', () =>  {
      expect(atjson).toHaveProperty('resolved');
    });

    it('does not throw an error when instantiating with GDocsSource', () => {
      expect(new GDocsSource(atjson)).toBeDefined();
    });

    it('correctly sets the content', () => {
      let gdocs = new GDocsSource(atjson);
      expect(gdocs.content.length).toEqual(438);
      expect(gdocs.content).toMatchSnapshot();
    });

    it('extracts bold', () => {
      let gdocs = new GDocsSource(atjson);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-ts_bd');
      expect(annotations.length).toEqual(2);

      let [a0, a1] = annotations;
      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('simple te');
      expect(gdocs.content.substring(a1.start, a1.end)).toEqual('re is so');
    });

    it('extracts italic', () => {
      let gdocs = new GDocsSource(atjson);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-ts_it');
      expect(annotations.length).toEqual(2);

      let [a0, a1] = annotations;
      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('simple ');
      expect(gdocs.content.substring(a1.start, a1.end)).toEqual('some ');
    });

    it('extracts headings', () => {
      let gdocs = new GDocsSource(atjson);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-ps_hd').sort((a, b) => a.start - b.start);
      expect(annotations.length).toEqual(4);

      let [a0, a1, a2, a3] = annotations;

      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('Heading 1');
      expect(a0.attributes['-gdocs-level']).toEqual(1);

      expect(gdocs.content.substring(a1.start, a1.end)).toEqual('Heading 2');
      expect(a1.attributes['-gdocs-level']).toEqual(2);

      expect(gdocs.content.substring(a2.start, a2.end)).toEqual('Title');
      expect(a2.attributes['-gdocs-level']).toEqual(100);

      expect(gdocs.content.substring(a3.start, a3.end)).toEqual('Subtitle');
      expect(a3.attributes['-gdocs-level']).toEqual(101);

    });

    it('extracts lists', () => {
      let gdocs = new GDocsSource(atjson);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-list');
      expect(annotations.length).toEqual(2);

      let a0 = annotations[0];

      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('Here’s a numbered list\nAnd another item');
      expect(a0.attributes['-gdocs-ls_id']).toEqual('kix.trdi2u6o1bvt');
    });

    it('extracts list items', () => {
      let gdocs = new GDocsSource(atjson);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-list-item');
      expect(annotations.length).toEqual(4);

      let [a0, a1] = annotations;

      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('Here’s a numbered list');
      expect(a0.attributes['-gdocs-ls_id']).toEqual('kix.trdi2u6o1bvt');
      expect(a0.attributes['-gdocs-ls_nest']).toEqual(0);

      expect(gdocs.content.substring(a1.start, a1.end)).toEqual('And another item');
      expect(a1.attributes['-gdocs-ls_id']).toEqual('kix.trdi2u6o1bvt');
      expect(a1.attributes['-gdocs-ls_nest']).toEqual(0);
    });

    it('extracts links', () => {
      let gdocs = new GDocsSource(atjson);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-lnks_link');
      expect(annotations.length).toEqual(1);

      let link = annotations[0];

      expect(gdocs.content.substring(link.start, link.end)).toEqual(' is ');
      expect(link.attributes['-gdocs-ulnk_url']).toEqual('https://www.google.com/');
      expect(link.attributes['-gdocs-lnk_type']).toEqual(0);
    });
  });

  describe('a grab-bag of Google Docs features', () => {
    let gdocsBuffer;

    beforeAll(() => {
      // https://docs.google.com/document/d/18pp4dAGx5II596HHGOLUXXcc6VKLAVRBUMLm9Ge8eOE/edit?usp=sharing
      let fixturePath = path.join(__dirname, 'fixtures', 'formats-and-tabs.json');
      gdocsBuffer = JSON.parse(fs.readFileSync(fixturePath).toString());
    });

    it('has some json', () => {
      expect(gdocsBuffer).toHaveProperty('resolved');
    });

    it('does not throw an error when instantiating with GDocsSource', () => {
      expect(new GDocsSource(gdocsBuffer)).toBeDefined();
    });

    it('correctly sets the content', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      expect(gdocs.content.length).toEqual(219);
      expect(gdocs.content).toMatchSnapshot();
    });

    it('extracts bold', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-ts_bd');
      expect(annotations.length).toEqual(1);

      let [bold] = annotations;
      expect(gdocs.content.substring(bold.start, bold.end)).toEqual('bold');
    });

    it('extracts italic', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-ts_it');
      expect(annotations.length).toEqual(1);

      let [italic] = annotations;
      expect(gdocs.content.substring(italic.start, italic.end)).toEqual('italic');
    });

    it('extracts underline', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-ts_un');
      expect(annotations.length).toEqual(1);

      let [underline] = annotations;
      expect(gdocs.content.substring(underline.start, underline.end)).toEqual('underlined');
    });

    it('extracts horizontal rules', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-horizontal_rule');
      expect(annotations.length).toEqual(1);

      let [hr] = annotations;
      expect(gdocs.content.substring(hr.start, hr.end)).toEqual('-');
    });

    it('extracts strikethrough', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-ts_st');
      expect(annotations.length).toEqual(1);

      let [strikethrough] = annotations;
      expect(gdocs.content.substring(strikethrough.start, strikethrough.end)).toEqual('strikethrough');
    });

    it('extracts superscript', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-ts_va' && a.attributes['-gdocs-va'] === 'sup');
      expect(annotations.length).toEqual(1);

      let [superscript] = annotations;
      expect(gdocs.content.substring(superscript.start, superscript.end)).toEqual('TM');
    });

    it('extracts subscript', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-ts_va' && a.attributes['-gdocs-va'] === 'sub');
      expect(annotations.length).toEqual(1);

      let [subscript] = annotations;
      expect(gdocs.content.substring(subscript.start, subscript.end)).toEqual('2');
    });
  });

  describe('list styles', () => {
    let gdocsBuffer;

    beforeAll(() => {
      let fixturePath = path.join(__dirname, 'fixtures', 'list-styles.json');
      gdocsBuffer = JSON.parse(fs.readFileSync(fixturePath).toString());
    });

    it('creates the right number of list annotations', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      let lists = gdocs.annotations.filter(a => a.type === '-gdocs-list');

      expect(lists.length).toEqual(2);
    });

    it('captures list-specific attributes', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      let lists = gdocs.annotations.filter(a => a.type === '-gdocs-list');
      let expectedShape = expect.objectContaining({
        '-gdocs-ls_b_gs': expect.anything(),
        '-gdocs-ls_b_gt': expect.anything(),
        '-gdocs-ls_b_a' : expect.anything()
      });

      lists.forEach((list) => {
        expect(list.attributes).toEqual(expectedShape);
      });
    });

    it('distinguishes numbered from bulleted lists', () => {
      let gdocs = new GDocsSource(gdocsBuffer);
      let lists = gdocs.annotations
        .filter(a => a.type === '-gdocs-list')
        .filter(a => a.attributes['-gdocs-ls_b_gt'] === 9);

      expect(lists.length).toEqual(1);
    });
  });
});
