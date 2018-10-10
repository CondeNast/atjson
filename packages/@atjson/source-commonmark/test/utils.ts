import Document from '@atjson/document';
import Renderer from '@atjson/renderer-hir';

class PlainTextRenderer extends Renderer {

  tight?: boolean;

  *root() {
    let text: string[] = yield;
    return text.join('');
  }
  *hardbreak() {
    return '\n';
  }
  *bullet_list({ tight }: { tight: boolean }) {
    let wasTight = this.tight;
    this.tight = tight;
    let text = yield;
    this.tight = wasTight;
    return text;
  }
  *ordered_list({ tight }: { tight: boolean }) {
    let wasTight = this.tight;
    this.tight = tight;
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
  let renderer = new PlainTextRenderer();
  return renderer.render(doc);
}
