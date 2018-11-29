import OffsetSource from '@atjson/offset-annotations';
import GoogleDocsPasteSource from '../src';

document.addEventListener('paste', (evt: ClipboardEvent) => {
  let gdocsPaste = evt.clipboardData.getData('application/x-vnd.google-docs-document-slice-clip+wrapped');
  if (gdocsPaste !== '') {
    let data = JSON.parse(JSON.parse(gdocsPaste).data);
    document.body.innerHTML = JSON.stringify(GoogleDocsPasteSource.fromSource(data).toJSON(), null, 2);
  }
});
