import { Annotation, getConverterFor } from "@atjson/document";
import OffsetSource from "@atjson/schema-offset";
import HTMLSource from "@atjson/source-html";
import PRISMSource from "./source";

PRISMSource.defineConverterTo(OffsetSource, function PRISMToOffset(doc) {
  let convertHTML = getConverterFor(HTMLSource, OffsetSource);
  convertHTML(doc);

  function deleteCoveringAnnotations(a: Annotation<any>) {
    doc
      .where(function coversAnnotation(b) {
        return b.start >= a.start && b.end <= a.end;
      })
      .remove();

    return { retain: [a] };
  }

  let heads = doc.where({ type: "-html-head" });
  heads.update(deleteCoveringAnnotations);
  doc.deleteTextRanges(heads.annotations);

  let medias = doc.where({ type: "-pam-media" });
  medias.update(deleteCoveringAnnotations);
  doc.deleteTextRanges(medias.annotations);

  return doc;
});
