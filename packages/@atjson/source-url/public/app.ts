import OffsetSource from '@atjson/offset-annotations';
import URLSource from '../src';

document.addEventListener('paste', (evt: ClipboardEvent) => {
  let pasteBuffer = evt.clipboardData.getData('text/plain');
  if (pasteBuffer !== '') {
    document.body.innerText = JSON.stringify(URLSource.fromRaw(pasteBuffer).convertTo(OffsetSource).toJSON(), null, 2);
  }
});
