import OffsetSource, { SocialURLs } from "@atjson/offset-annotations";
import URLSource from "./source";

URLSource.defineConverterTo(OffsetSource, function urlToOffset(doc) {
  for (let annotation of doc.where({ type: "-whatwg-url" }).annotations) {
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
    }
  }

  return new OffsetSource(doc.toJSON());
});
