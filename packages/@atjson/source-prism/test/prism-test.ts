import * as fs from 'fs';
import * as path from 'path';
import { HIR } from '@atjson/hir';
import PRISMSource from '../src';
import OffsetSource from '@atjson/offset-annotations';

describe('@atjson/source-prism', () => {
  it('parses xml declaration', () => {
    let doc = PRISMSource.fromRaw('<?xml version="1.0" encoding="utf-8"?>');

    expect(doc.where({}).toJSON()).toMatchObject([
      {
        type: '-atjson-ParseToken',
        start: 0,
        end: doc.content.length,
        attributes: {
          '-atjson-reason': '<?xml>'
        }
      }
    ]);
  });

  it('does not require xml declaration', () => {
    let doc = PRISMSource.fromRaw('<body>some text</body>');

    expect(doc.where({}).sort().toJSON()).toMatchObject([
      { type: '-atjson-ParseToken', start: 0, end: 6, attributes: { '-atjson-reason': '<body>' } },
      { type: '-html-body', start: 0, end: 22 },
      { type: '-atjson-ParseToken', start: 15, end: 22, attributes: { '-atjson-reason': '</body>' } }
    ]);
  });

  it('parses xml tags', () => {
    let doc = PRISMSource.fromRaw(`<?xml version="1.0" encoding="utf-8"?><pam:message><pam:article><head /><body>text</body></pam:article></pam:message>`);
    let hir = new HIR(doc);

    expect(hir.toJSON()).toMatchObject({
      children: [
        {
          type: 'message',
          children: [
            {
              type: 'article',
              children: [
                { type: 'head' },
                { type: 'body', children: ['text'] }
              ]
            }
          ]
        }
      ]
    });

    expect(doc.where({}).sort().toJSON()).toMatchObject([
      { type: '-atjson-ParseToken', start: 0, end: 38, attributes: { '-atjson-reason': '<?xml>' } },
      { type: '-atjson-ParseToken', start: 38, end: 51, attributes: { '-atjson-reason': '<pam:message>' } },
      { type: '-pam-message', start: 38, end: 117 },
      { type: '-atjson-ParseToken', start: 51, end: 64, attributes: { '-atjson-reason': '<pam:article>' } },
      { type: '-pam-article', start: 51, end: 103 },
      { type: '-html-head', start: 64, end: 72 },
      { type: '-atjson-ParseToken', start: 64, end: 72, attributes: { '-atjson-reason': '<head/>' } },
      { type: '-atjson-ParseToken', start: 72, end: 78, attributes: { '-atjson-reason': '<body>' } },
      { type: '-html-body', start: 72, end: 89 },
      { type: '-atjson-ParseToken', start: 82, end: 89, attributes: { '-atjson-reason': '</body>' } },
      { type: '-atjson-ParseToken', start: 89, end: 103, attributes: { '-atjson-reason': '</pam:article>' } },
      { type: '-atjson-ParseToken', start: 103, end: 117, attributes: { '-atjson-reason': '</pam:message>' } }
    ]);
  });

  describe('xml entities', () => {
    test.each([
      [ '&#8704;', '∀' ], // dec entity
      [ '&#x201C;', '“' ], // hex entity
      [ '&quot;', '"' ], // five named xml entities
      [ '&amp;', '&' ],
      [ '&apos;', '\'' ],
      [ '&lt;', '<' ],
      [ '&gt;', '>' ],
      [ '&rsquo;', '&rsquo;' ] // other named entities are not supported
    ])('converts %s to %s', (entity, expected) => {
      let doc = PRISMSource.fromRaw(`<?xml version="1.0" encoding="utf-8"?><body>${entity}</body>`);

      expect(doc.content).toEqual(`<?xml version="1.0" encoding="utf-8"?><body>${expected}</body>`);
    });

    it('repositions annotations after replacing entities', () => {
      let doc = PRISMSource.fromRaw('<pam:article><head><dc:title>Title</dc:title></head><body><p>&#8704;x&#8712;Λ, x&#8744;&#172;x&#x220E;</p></body></pam:article>');

      expect(doc.content).toEqual('<pam:article><head><dc:title>Title</dc:title></head><body><p>∀x∈Λ, x∨¬x∎</p></body></pam:article>');
      expect(doc.where({}).sort().toJSON()).toMatchObject([
        { type: '-atjson-ParseToken', start: 0, end: 13, attributes: { '-atjson-reason': '<pam:article>' } },
        { type: '-pam-article', start: 0, end: 97 },
        { type: '-atjson-ParseToken', start: 13, end: 19, attributes: { '-atjson-reason': '<head>' } },
        { type: '-html-head', start: 13, end: 52 },
        { type: '-atjson-ParseToken', start: 19, end: 29, attributes: { '-atjson-reason': '<dc:title>' } },
        { type: '-dc-title', start: 19, end: 45 },
        { type: '-atjson-ParseToken', start: 34, end: 45, attributes: { '-atjson-reason': '</dc:title>' } },
        { type: '-atjson-ParseToken', start: 45, end: 52, attributes: { '-atjson-reason': '</head>' } },
        { type: '-atjson-ParseToken', start: 52, end: 58, attributes: { '-atjson-reason': '<body>' } },
        { type: '-html-body', start: 52, end: 83 },
        { type: '-atjson-ParseToken', start: 58, end: 61, attributes: { '-atjson-reason': '<p>' } },
        { type: '-html-p', start: 58, end: 76 },
        { type: '-atjson-ParseToken', start: 72, end: 76, attributes: { '-atjson-reason': '</p>' } },
        { type: '-atjson-ParseToken', start: 76, end: 83, attributes: { '-atjson-reason': '</body>' } },
        { type: '-atjson-ParseToken', start: 83, end: 97, attributes: { '-atjson-reason': '</pam:article>' } }
      ]);
    });
  });

  describe('prism snapshots', () => {
    test.each([
      [ 'gq-fresh-paint.xml' ],
      [ 'gq-santoni.xml' ],
      [ 'gq-yuketen.xml' ]
    ])('parses %s', xmlFile => {
      let fixturePath = path.join(__dirname, 'fixtures', xmlFile);
      let xml = fs.readFileSync(fixturePath).toString();

      let doc = PRISMSource.fromRaw(xml);
      let hir = new HIR(doc);

      expect(hir.toJSON()).toMatchSnapshot();
      expect(doc.convertTo(OffsetSource).toJSON()).toMatchSnapshot();
    })
  })
});
