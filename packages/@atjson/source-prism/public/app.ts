import OffsetSource from '@atjson/offset-annotations';
import Renderer from '@atjson/renderer-commonmark';
import PRISMSource from '../src';

document.addEventListener('paste', (evt: ClipboardEvent) => {
  let xml = evt.clipboardData.getData('text/plain');
  if (xml !== '') {
    let doc = PRISMSource.fromRaw(xml).convertTo(OffsetSource);
    document.body.innerText = new Renderer().render(doc) + '\n\n-----------------\n\n' + JSON.stringify(doc.toJSON(), null, 2);
  }
});
