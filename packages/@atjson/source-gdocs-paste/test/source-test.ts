import Document from '@atjson/document';
import * as fs from 'fs';
import * as path from 'path';
import GDocsSource from '../src/index';
import { VerticalAdjust } from '../src/annotations';

describe('@atjson/source-gdocs-paste', () => {
  describe('relatively complex document', () => {
    let pasteBuffer;

    beforeAll(() => {
      // https://docs.google.com/document/d/1xP_M2SchJt81ZuivsO7oix8Q_fCx4PENKJFJR5npFNM/edit
      let fixturePath = path.join(__dirname, 'fixtures', 'complex.json');
      pasteBuffer = JSON.parse(fs.readFileSync(fixturePath).toString());
    });

    it('has some json', () =>  {
      expect(pasteBuffer).toHaveProperty('resolved');
    });

    it('does not throw an error when instantiating with GDocsSource', () => {
      expect(GDocsSource.fromSource(pasteBuffer)).toBeDefined();
    });

    it('correctly sets the content', () => {
      let gdocs = GDocsSource.fromSource(pasteBuffer);
      expect(gdocs.content.length).toEqual(384);
      expect(gdocs.content).toMatchSnapshot();
    });

    it('extracts bold', () => {
      let gdocs = GDocsSource.fromSource(pasteBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'ts_bd');
      expect(annotations.length).toEqual(2);

      let [a0, a1] = annotations;
      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('simple te');
      expect(gdocs.content.substring(a1.start, a1.end)).toEqual('re is so');
    });

    it('extracts italic', () => {
      let gdocs = GDocsSource.fromSource(pasteBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'ts_it');
      expect(annotations.length).toEqual(2);

      let [a0, a1] = annotations;
      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('simple ');
      expect(gdocs.content.substring(a1.start, a1.end)).toEqual('some ');
    });

    it('extracts headings', () => {
      let gdocs = GDocsSource.fromSource(pasteBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'ps_hd').sort((a, b) => a.start - b.start);
      expect(annotations.length).toEqual(4);

      let [a0, a1, a2, a3] = annotations;

      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('Heading 1');
      expect(a0.attributes.level).toEqual(1);

      expect(gdocs.content.substring(a1.start, a1.end)).toEqual('Heading 2');
      expect(a1.attributes.level).toEqual(2);

      expect(gdocs.content.substring(a2.start, a2.end)).toEqual('Title');
      expect(a2.attributes.level).toEqual(100);

      expect(gdocs.content.substring(a3.start, a3.end)).toEqual('Subtitle');
      expect(a3.attributes.level).toEqual(101);

    });

    it('extracts lists', () => {
      let gdocs = GDocsSource.fromSource(pasteBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'list');
      expect(annotations.length).toEqual(1);

      let a0 = annotations[0];

      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('Here’s a numbered list\nAnd another item');
      expect(a0.attributes.ls_id).toEqual('kix.r139o3ivf8cd');
    });

    it('extracts list items', () => {
      let gdocs = GDocsSource.fromSource(pasteBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'list_item');
      expect(annotations.length).toEqual(2);

      let [a0, a1] = annotations;

      expect(gdocs.content.substring(a0.start, a0.end)).toEqual('Here’s a numbered list');
      expect(a0.attributes.ls_id).toEqual('kix.r139o3ivf8cd');
      expect(a0.attributes.ls_nest).toEqual(0);

      expect(gdocs.content.substring(a1.start, a1.end)).toEqual('And another item');
      expect(a1.attributes.ls_id).toEqual('kix.r139o3ivf8cd');
      expect(a1.attributes.ls_nest).toEqual(0);
    });

    it('extracts links', () => {
      let gdocs = GDocsSource.fromSource(pasteBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'lnks_link');
      expect(annotations.length).toEqual(1);

      let link = annotations[0];

      expect(gdocs.content.substring(link.start, link.end)).toEqual(' is ');
      expect(link.attributes.ulnk_url).toEqual('https://www.google.com/');
      expect(link.attributes.lnk_type).toEqual(0);
    });

    it('extracts images');
  });

  describe('a grab-bag of Google Docs features', () => {
    let gdocsBuffer;

    beforeAll(() => {
      // https://docs.google.com/document/d/1xP_M2SchJt81ZuivsO7oix8Q_fCx4PENKJFJR5npFNM/edit
      let fixturePath = path.join(__dirname, 'fixtures', 'formats-and-tabs.json');
      gdocsBuffer = JSON.parse(fs.readFileSync(fixturePath).toString());
    });

    it('has some json', () => {
      expect(gdocsBuffer).toHaveProperty('resolved');
    });

    it('does not throw an error when instantiating with GDocsSource', () => {
      expect(GDocsSource.fromSource(gdocsBuffer)).toBeDefined();
    });

    it('correctly sets the content', () => {
      let gdocs = GDocsSource.fromSource(gdocsBuffer);
      expect(gdocs.content.length).toEqual(219);
      expect(gdocs.content).toMatchSnapshot();
    });

    it('extracts bold', () => {
      let gdocs = GDocsSource.fromSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'ts_bd');
      expect(annotations.length).toEqual(1);

      let [bold] = annotations;
      expect(gdocs.content.substring(bold.start, bold.end)).toEqual('bold');
    });

    it('extracts italic', () => {
      let gdocs = GDocsSource.fromSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'ts_it');
      expect(annotations.length).toEqual(1);

      let [italic] = annotations;
      expect(gdocs.content.substring(italic.start, italic.end)).toEqual('italic');
    });

    it('extracts underline', () => {
      let gdocs = GDocsSource.fromSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'ts_un');
      expect(annotations.length).toEqual(1);

      let [underline] = annotations;
      expect(gdocs.content.substring(underline.start, underline.end)).toEqual('underlined');
    });

    it('extracts horizontal rules', () => {
      let gdocs = GDocsSource.fromSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'horizontal_rule');
      expect(annotations.length).toEqual(1);

      let [hr] = annotations;
      expect(gdocs.content.substring(hr.start, hr.end)).toEqual('-');
    });

    it('extracts strikethrough', () => {
      let gdocs = GDocsSource.fromSource(gdocsBuffer);
      let annotations = gdocs.annotations.filter(a => a.type === 'ts_st');
      expect(annotations.length).toEqual(1);

      let [strikethrough] = annotations;
      expect(gdocs.content.substring(strikethrough.start, strikethrough.end)).toEqual('strikethrough');
    });

    it('extracts vertical adjust', () => {
      let gdocs = GDocsSource.fromSource(gdocsBuffer);
      let annotations: VerticalAdjust[] = gdocs.annotations.filter(a => a instanceof VerticalAdjust) as VerticalAdjust[];
      expect(annotations.length).toEqual(2);

      let [superscript] = annotations.filter(annotation => annotation.attributes.va === 'sup');
      let [subscript] = annotations.filter(annotation => annotation.attributes.va === 'sub');
      expect(gdocs.content.substring(superscript.start, superscript.end)).toEqual('TM');
      expect(gdocs.content.substring(subscript.start, subscript.end)).toEqual('2');
    });
  });
});
