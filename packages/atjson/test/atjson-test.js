MyRenderer.registerAnnotations(..);
let rendererInterface = new MyRenderer({comment: commentRenderer, });
rendererInterface.regsiterAnnotations(..)

AtJSON.registerParser(parserInterface);
AtJSON.registerRenderer(rendererInterface);

let mydoc = new AtJSON(jsonobj);

mydoc.annotations
  .filter((a) => a.type === 'paragraph-break-meta')
  .forEach((a) => a.deleteText())
