import atjsonSchema from '@atjson/schema';
import Doucment from '@atjson/document';

export default class HTMLSchemaTranslator {
  translate(document: Document): Document {
    let doc = new Document({
      content: document.content,
      contentType: 'text/atjson',
      annotations: [...document.annotations],
      schema: atjsonSchema
    });

    doc.where({type: 'a'}).set({type: 'link'});
    doc.where({type: 'a'}).map({attributes: { href: 'url' });

    doc.where({type: 'h1'}).set({type: 'heading', attributes: {level: 1}});
    doc.where({type: 'h2'}).set({type: 'heading', attributes: {level: 2}});
    doc.where({type: 'h3'}).set({type: 'heading', attributes: {level: 3}});
    doc.where({type: 'h4'}).set({type: 'heading', attributes: {level: 4}});
    doc.where({type: 'h5'}).set({type: 'heading', attributes: {level: 5}});
    doc.where({type: 'h6'}).set({type: 'heading', attributes: {level: 6}});

    doc.where({type: 'p'}).set({type: 'paragraph'});
    doc.where({type: 'br'}).set({type: 'line-break'});
    doc.where({type: 'hr'}).set({type: 'horizontal-rule'});

    doc.where({type: 'ul'}).set({type: 'list', attributes: { type: 'unordered-list' });
    doc.where({type: 'ol'}).set({type: 'list', attributes: { type: 'ordered-list' });
    doc.where({type: 'li'}).set({type: 'list-item'});

    doc.where({type: 'em'}).set({type: 'italic'});
    doc.where({type: 'i'}).set({type: 'italic'});
    doc.where({type: 'strong'}).set({type: 'bold'});
    doc.where({type: 'b'}).set({type: 'bold'});

    doc.where({type: 'img'}).set({type: 'image'});
    doc.where({type: 'img'}).map({attributes: { src: 'url', alt: 'title' });

    doc.where({type: 'blockquote'}).set({type: 'quotation'});
  }
}
