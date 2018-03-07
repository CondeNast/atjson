import Document from '@atjson/document';
import GDocsSource from '@atjson/source-gdocs-paste';
import * as fs from 'fs';
import * as path from 'path';

describe('@atjson/source-gdocs-paste', () => {
  describe('relatively complex document', () => {
    var atjson;

    beforeAll(() => {
      // https://docs.google.com/document/d/1xP_M2SchJt81ZuivsO7oix8Q_fCx4PENKJFJR5npFNM/edit
      let fixturePath = path.join(__dirname, 'fixtures', 'complex.json');
      atjson = JSON.parse(fs.readFileSync(fixturePath));
    });

    it('has some json', () =>  {
      expect(atjson).toHaveProperty('resolved')
    });

    it('does not throw an error when instantiating with GDocsSource', () => {
      expect(new GDocsSource(atjson)).toBeDefined();
    });

    it('correctly sets the content', () => {
      let gdocs = new GDocsSource(atjson);
      expect(gdocs.content.length).toEqual(384);
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
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-ps_hd').sort((a,b) => a.start - b.start);
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
      expect(annotations.length).toEqual(1);

      let a0 = annotations[0];
      
      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('Here’s a numbered list\nAnd another item');
      expect(a0.attributes['-gdocs-ls_id']).toEqual('kix.r139o3ivf8cd');
    });

    it('extracts list items', () => {
      let gdocs = new GDocsSource(atjson);
      let annotations = gdocs.annotations.filter(a => a.type === '-gdocs-list-item');
      expect(annotations.length).toEqual(2);

      let [a0, a1] = annotations;

      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('Here’s a numbered list');
      expect(a0.attributes['-gdocs-ls_id']).toEqual('kix.r139o3ivf8cd');
      expect(a0.attributes['-gdocs-ls_nest']).toEqual(0);

      expect(gdocs.content.substring(a1.start, a1.end)).toEqual('And another item');
      expect(a1.attributes['-gdocs-ls_id']).toEqual('kix.r139o3ivf8cd');
      expect(a1.attributes['-gdocs-ls_nest']).toEqual(0);
    });

    it('extracts images');

    it('extracts subscript');

    it('extracts superscript');

  });
});
