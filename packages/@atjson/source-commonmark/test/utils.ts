import Document from '@atjson/document';
import Renderer from '@atjson/renderer-hir';
import { BulletList, OrderedList } from '../src';

class PlainTextRenderer extends Renderer {

  tight?: boolean;

  *Root() {
    let text: string[] = yield;
    return text.join('');
  }
  *hardbreak() {
    return '\n';
  }
  *bullet_list(list: BulletList) {
    let wasTight = this.tight;
    this.tight = list.attributes.tight;
    let text = yield;
    this.tight = wasTight;
    return text;
  }
  *ordered_list(list: OrderedList) {
    let wasTight = this.tight;
    this.tight = list.attributes.tight;
    let text = yield;
    this.tight = wasTight;
    return text;
  }
  *paragraph() {
    let text = yield;
    if (this.tight) {
      return `${text.join('')}\n`;
    }
    return `${text.join('')}\n\n`;
  }
}

export function render(doc: Document) {
  return PlainTextRenderer.render(doc);
}
