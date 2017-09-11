Hello *world* this is some _text_

{
  content: 'Hello *world* this is some _text',
  contentType: 'markdown',
  virtualAnnotations: [
    { type: 'bold', content: 'world' }
    { type: 'parse-token', content: '*' }
    { type: 'parse-token', content: '*' }
    { type: 'parse-element', content: '*world*' }
  ]
}

{ type: 'root',
  children: [
    'Hello ',
    { type: 'markdown-span',
      children: [
        { type: 'markdown-meta', subtype: 'start', children: ['*'] },
        { type: 'bold', children: ['world'] },
        { type: 'markdown-meta', subtype: 'end', children: ['*'] }
      ]
    }
