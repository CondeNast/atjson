import { Display } from "@atjson/document";

export default {
  bullet_list: {
    display: 'block' as Display,
    attributes: [
      'tight'
    ]
  },
  blockquote: {
    display: 'block' as Display
  },
  code_block: {
    display: 'block' as Display
  },
  code_inline: {
    display: 'inline' as Display
  },
  em: {
    display: 'inline' as Display
  },
  fence: {
    display: 'block' as Display,
    attributes: [
      'info'
    ]
  },
  hardbreak: {
    display: 'object' as Display
  },
  heading: {
    display: 'block' as Display,
    attributes: [
      'level'
    ]
  },
  hr: {
    display: 'object' as Display
  },
  html: {
    display: 'block' as Display
  },
  image: {
    display: 'object' as Display,
    attributes: [
      'src',
      'alt',
      'title'
    ]
  },
  link: {
    display: 'inline' as Display,
    attributes: [
      'href',
      'title'
    ]
  },
  list_item: {
    display: 'block' as Display
  },
  ordered_list: {
    display: 'block' as Display,
    attributes: [
      'start',
      'tight'
    ]
  },
  paragraph: {
    display: 'paragraph' as Display
  },
  strong: {
    display: 'inline' as Display
  }
};
