import atjsonSchema from '@atjson/schema';
import Document from '@atjson/document';

export default class HTMLSchemaTranslator extends Document {
  constructor(document: Document) {
    super({
      content: document.content,
      contentType: 'text/atjson',
      annotations: [...document.annotations],
      schema: atjsonSchema
    });

    this.where({type: 'a'}).set({type: 'link'});
    this.where({type: 'a'}).map({attributes: { href: 'url' });

    this.where({type: 'h1'}).set({type: 'heading', attributes: {level: 1}});
    this.where({type: 'h2'}).set({type: 'heading', attributes: {level: 2}});
    this.where({type: 'h3'}).set({type: 'heading', attributes: {level: 3}});
    this.where({type: 'h4'}).set({type: 'heading', attributes: {level: 4}});
    this.where({type: 'h5'}).set({type: 'heading', attributes: {level: 5}});
    this.where({type: 'h6'}).set({type: 'heading', attributes: {level: 6}});

    this.where({type: 'p'}).set({type: 'paragraph'});
    this.where({type: 'br'}).set({type: 'line-break'});
    this.where({type: 'hr'}).set({type: 'horizontal-rule'});

    this.where({type: 'ul'}).set({type: 'list', attributes: { type: 'unordered-list' });
    this.where({type: 'ol'}).set({type: 'list', attributes: { type: 'ordered-list' });
    this.where({type: 'li'}).set({type: 'list-item'});

    this.where({type: 'em'}).set({type: 'italic'});
    this.where({type: 'i'}).set({type: 'italic'});
    this.where({type: 'strong'}).set({type: 'bold'});
    this.where({type: 'b'}).set({type: 'bold'});

    this.where({type: 'img'}).set({type: 'image'});
    this.where({type: 'img'}).map({attributes: { src: 'url', alt: 'title' });

    this.where({type: 'blockquote'}).set({type: 'quotation'});
  }
}
