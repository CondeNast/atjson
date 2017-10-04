/// <amd-module name="@atjson/renderer-plain-text"/>
import Renderer from '@atjson/renderer-hir';

export default class PlainTextRenderer extends Renderer {
  *renderAnnotation(): IterableIterator<string> {
    let text: string[] = yield;
    return text.join('');
  }
}
