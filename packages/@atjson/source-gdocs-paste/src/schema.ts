import { Annotation, Display } from '@atjson/document';

export interface Bold extends Annotation {
  type: '-gdocs-ts_bd';
}

export interface Italic extends Annotation {
  type: '-gdocs-ts_it';
}

export interface Underline extends Annotation {
  type: '-gdocs-ts_un';
}

export interface Strikethrough extends Annotation {
  type: '-gdocs-ts_st';
}

export interface HorizontalRule extends Annotation {
  type: '-gdocs-horizontal_rule';
}

export interface Heading extends Annotation {
  type: '-gdocs-ps_hd';
  attributes: {
    '-gdocs-level': number;
  };
}

export interface Link extends Annotation {
  type: '-gdocs-lnks_link';
  attributes: {
    '-gdocs-ulnk_url': string;
    '-gdocs-lnk_type': string;
  };
}

export interface List extends Annotation {
  type: '-gdocs-list';
  attributes: {
    '-gdocs-ls_id': string;
    '-gdocs-ls_b_gs': string;
    '-gdocs-ls_b_gt': number;
    '-gdocs-ls_b_a' : number;
  };
}

export interface ListItem extends Annotation {
  type: '-gdocs-list-item';
  attributes: {
    '-gdocs-ls_nest': string;
    '-gdocs-ls_id': string;
  };
}

export default {
  '-gdocs-list': {
    display: 'block' as Display,
    attributes: [
      '-gdocs-ls-id'
    ]
  },

  '-gdocs-list-item': {
    display: 'block' as Display,
    attributes: [
      '-gdocs-ls_nest', '-gdocs-ls_id'
    ]
  },

  '-gdocs-ps_hd': {
    display: 'block' as Display,
    attributes: [
      '-gdocs-level'
    ]
  },

  'gdocs-lnks_link': {
    display: 'inline' as Display,
    attributes: [
      '-gdocs-ulnk_url', '-gdocs-lnk-type'
    ]
  },

  '-gdocs-ts_bd': {
    display: 'inline' as Display
  },

  '-gdocs-ts_it': {
    display: 'inline' as Display
  },

  '-gdocs-ts_un': {
    display: 'inline' as Display
  }
};
