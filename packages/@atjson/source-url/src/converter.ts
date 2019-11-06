import OffsetSource, { SocialURLs } from "@atjson/offset-annotations";
import { URLAnnotation } from "./annotations";
import URLSource from "./source";

URLSource.defineConverterTo(OffsetSource, doc => {
  doc
    .where((annotation: URLAnnotation) => annotation.type === "url")
    .update((annotation: URLAnnotation) => {
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
    });

  return new OffsetSource(doc.toJSON());
});
