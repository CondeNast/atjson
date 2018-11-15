import OffsetSource, { Italic } from '@atjson/offset-annotations';

jest.setTimeout(10000);

describe('offset', () => {
  beforeAll(async () => {
    let example = new OffsetSource({
      content: 'Hello, world',
      annotations: [
        new Italic({ start: 7, end: 15 })
      ]
    });
    await page.goto(`http://localhost:1234?document=${encodeURIComponent(JSON.stringify(example.toJSON()))}`);
  });

  test('the document is rendered', async () => {
    await expect(page).toMatchElement('.editor', { text: 'Hello, world' });
    await expect(page).toMatchElement('offset-italic', { text: 'world' });
  });
});
