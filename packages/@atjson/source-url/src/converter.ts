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
      let { url, AnnotationClass } = SocialURLs.identify(annotation.attributes);
      if (url && AnnotationClass) {
        doc.replaceAnnotation(
          annotation,
          new AnnotationClass({
            id: annotation.id,
            start: annotation.start,
            end: annotation.end,
            attributes: {
              url
            }
          })
        );
      } else {
        // If we've found a URL Annotation that doesn't match a SocialURL
        // pattern, remove it for our purposes here.
        doc.removeAnnotation(annotation);
      }
    });

  return new OffsetSource(doc.toJSON());
});
