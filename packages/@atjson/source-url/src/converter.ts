import OffsetSource, { SocialURLs } from "@atjson/offset-annotations";
import { URLAnnotation } from "./annotations";
import URLSource from "./source";

function isURL(annotation: URLAnnotation): annotation is URLAnnotation {
  return annotation.type === "url";
}

URLSource.defineConverterTo(OffsetSource, doc => {
  doc
    .where(isURL)
    .update(function identifyAndReplaceURL(annotation: URLAnnotation) {
      let { url, AnnotationClass, attributes } = SocialURLs.identify(
        annotation.attributes
      );
      if (AnnotationClass) {
        doc.replaceAnnotation(
          annotation,
          new AnnotationClass({
            id: annotation.id,
            start: annotation.start,
            end: annotation.end,
            attributes: {
              url,
              ...(attributes || {})
            }
          })
        );
      }
    });

  return new OffsetSource(doc.toJSON());
});
