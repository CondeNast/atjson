import OffsetSource from '@atjson/offset-annotations';
import Renderer from '@atjson/renderer-commonmark';
import * as fs from 'fs';
import PRISMSource from '../src';

const example = fs.readFileSync(__dirname + '/gq-fresh-paint.xml');

document.addEventListener('paste', (evt) => {
  let xml = evt.clipboardData.getData('text/plain');
  if (xml !== '') {
    let doc = PRISMSource.fromRaw(xml).convertTo(OffsetSource);
    document.body.innerText = Renderer.render(doc) + '\n\n-----------------\n\n' + JSON.stringify(doc.toJSON(), null, 2);
  }
});

document.querySelector('button').addEventListener('click', () => {
  let doc = PRISMSource.fromRaw(example.toString()).convertTo(OffsetSource);
  document.body.innerText = Renderer.render(doc) + '\n\n-----------------\n\n' + JSON.stringify(doc.toJSON(), null, 2);
});
