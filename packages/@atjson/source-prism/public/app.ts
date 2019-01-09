import PRISMSource from '../src';

document.addEventListener('paste', (evt: ClipboardEvent) => {
  let xml = evt.clipboardData.getData('text/plain');
  if (xml !== '') {
    document.body.innerText = JSON.stringify(PRISMSource.fromRaw(xml).toJSON(), null, 2);
  }
});
