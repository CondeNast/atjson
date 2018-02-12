export default {
  'link': {
    type: 'inline',
    attributes: [
      'url',
      'title'
    ]
  },
  'paragraph': {
    type: 'paragraph'
  },
  'heading': {
    type: 'block',
    attributes: [
      'level'
    ]
  },
  'item': {
    type: 'block'
  },
  'list': {
    type: 'block',
    attributes: [
      'type',
      'startsAt'
    ]
  },
  'bold': {
    type: 'inline'
  },
  'italic': {
    type: 'inline'
  },
  'quotation': {
    type: 'block'
  },
  'line-break': {
    type: 'object'
  },
  'image': {
    type: 'object',
    attributes: [
      'url',
      'description'
    ]
  }
};
