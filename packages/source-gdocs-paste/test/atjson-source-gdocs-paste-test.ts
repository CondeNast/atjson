import Document from '@atjson/document';
import { HIR } from '@atjson/hir';
import KIXSource from '@atjson/source-gdocs-paste';
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

    it('does not throw an error when instantiating with KIXSource', () => {
      expect(new KIXSource(atjson)).toBeDefined();
    });

    it('correctly sets the content');

    it('extracts bold', () => {
      let gdocs = new KIXSource(atjson);
      let annotations = gdocs.getAnnotations().filter(a => a.type === 'ts_bd');
      expect(annotations.length).toEqual(2);

      let a0 = annotations[0];
      let a1 = annotations[1];
      expect(gdocs.getContent().substring(a0.start, a0.end)).toEqual('simple te');
      expect(gdocs.getContent().substring(a1.start, a1.end)).toEqual('re is so');
    });

    it('extracts italic', () => {
      let gdocs = new KIXSource(atjson);
      let annotations = gdocs.getAnnotations().filter(a => a.type === 'ts_it');
      expect(annotations.length).toEqual(2);

      let a0 = annotations[0];
      let a1 = annotations[1];
      expect(gdocs.getContent().substring(a0.start, a0.end)).toEqual('simple ');
      expect(gdocs.getContent().substring(a1.start, a1.end)).toEqual('some ');
    });

    it('extracts headings', () => {
      let gdocs = new KIXSource(atjson);
      let annotations = gdocs.getAnnotations().filter(a => a.type === 'ps_hd').sort((a,b) => a.start - b.start);
      expect(annotations.length).toEqual(4);

      let a0 = annotations[0];
      let a1 = annotations[1];
      let a2 = annotations[2];
      let a3 = annotations[3];

      expect(gdocs.getContent().substring(a0.start, a0.end)).toEqual('Heading 1');
      expect(a0.level).toEqual(1);

      expect(gdocs.getContent().substring(a1.start, a1.end)).toEqual('Heading 2');
      expect(a1.level).toEqual(2);

      expect(gdocs.getContent().substring(a2.start, a2.end)).toEqual('Title');
      expect(a2.level).toEqual(100);

      expect(gdocs.getContent().substring(a3.start, a3.end)).toEqual('Subtitle');
      expect(a3.level).toEqual(101);

    });

    it('extracts lists', () => {
      let gdocs = new KIXSource(atjson);
      let annotations = gdocs.getAnnotations().filter(a => a.type === 'list');
      expect(annotations.length).toEqual(1);

      let a0 = annotations[0];
      
      expect(gdocs.getContent().substring(a0.start, a0.end)).toEqual('Here’s a numbered list\nAnd another item');
      expect(a0.ls_id).toEqual('kix.r139o3ivf8cd');
    });

    it('extracts list items', () => {
      let gdocs = new KIXSource(atjson);
      let annotations = gdocs.getAnnotations().filter(a => a.type === 'list-item');
      expect(annotations.length).toEqual(2);

      let a0 = annotations[0];
      let a1 = annotations[1];

      expect(gdocs.getContent().substring(a0.start, a0.end)).toEqual('Here’s a numbered list');
      expect(a0.ls_id).toEqual('kix.r139o3ivf8cd');
      expect(a0.ls_nest).toEqual(0);

      expect(gdocs.getContent().substring(a1.start, a1.end)).toEqual('And another item');
      expect(a1.ls_id).toEqual('kix.r139o3ivf8cd');
      expect(a1.ls_nest).toEqual(0);
    });

    it('extracts images');

    it('extracts subscript');

    it('extracts superscript');

  });
});
