import Document, { Block } from "@atjson/document";
import Renderer from "@atjson/renderer-hir";
import { BulletList, OrderedList } from "../src";

class PlainTextRenderer extends Renderer {
  tight?: boolean;

  *root() {
    let text: string[] = yield;
    return text.join("");
  }
  *hardbreak() {
    return "\n";
  }
  *code_inline() {
    let text: string[] = yield;
    return text.join("");
  }
  *s() {
    let text: string[] = yield;
    return text.join("");
  }
  *list_item() {
    let text: string[] = yield;
    return text.join("");
  }
  *bullet_list(list: Block<BulletList>): Generator<void, string, string[]> {
    let wasTight = this.tight;
    this.tight = !list.attributes.loose;
    let text = yield;
    this.tight = wasTight;
    return text.join("");
  }
  *ordered_list(list: Block<OrderedList>): Generator<void, string, string[]> {
    let wasTight = this.tight;
    this.tight = !list.attributes.loose;
    let text = yield;
    this.tight = wasTight;
    return text.join("");
  }
  *paragraph(): Generator<void, string, string[]> {
    let text = yield;
    if (this.tight) {
      return `${text.join("")}\n`;
    }
    return `${text.join("")}\n\n`;
  }
}

export function render(doc: Document) {
  return PlainTextRenderer.render(doc);
}
