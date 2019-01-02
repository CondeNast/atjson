import OffsetSource from '@atjson/offset-annotations';
import Renderer from '@atjson/renderer-commonmark';
import GoogleDocsPasteSource from '../src';

document.addEventListener('paste', (evt: ClipboardEvent) => {
  let gdocsPaste = evt.clipboardData.getData('application/x-vnd.google-docs-document-slice-clip+wrapped');
  if (gdocsPaste !== '') {
    let data = JSON.parse(JSON.parse(gdocsPaste).data);
    document.body.innerText = new Renderer().render(GoogleDocsPasteSource.fromRaw(data).convertTo(OffsetSource)) + '\n\n----------------------------------\n\n' +
    JSON.stringify(GoogleDocsPasteSource.fromRaw(data).convertTo(OffsetSource).toJSON(), null, 2);
  }
});
