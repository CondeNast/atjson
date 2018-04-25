import { Display } from '@atjson/document';

export default {
  'bold': {
    display: 'inline' as Display
  },
  'blockquote': {
    display: 'block' as Display
  },
  'code': {
    display: 'inline' as Display,
    attributes: [
      'language'
    ]
  },
  'heading': {
    display: 'block' as Display,
    attributes: [
      'level'
    ]
  },
  'horizontal-rule': {
    display: 'object' as Display
  },
  'html': {
    display: 'block' as Display
  },
  'image': {
    display: 'object' as Display,
    attributes: [
      'url',
      'title',
      'description'
    ]
  },
  'italic': {
    display: 'inline' as Display
  },
  'link': {
    display: 'inline' as Display,
    attributes: [
      'url',
      'title'
    ]
  },
  'line-break': {
    display: 'object' as Display
  },
  'list': {
    display: 'block' as Display,
    attributes: [
      'type',
      'tight',
      'level',
      'startsAt'
    ]
  },
  'list-item': {
    display: 'block' as Display
  },
  'paragraph': {
    display: 'paragraph' as Display
  }
};
