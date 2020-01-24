import OffsetSource, {
  SocialURLs,
  VideoURLs,
  VideoEmbed
} from "@atjson/offset-annotations";
import { URLAnnotation } from "./annotations";
import URLSource from "./source";

function isURL(annotation: URLAnnotation): annotation is URLAnnotation {
  return annotation.type === "url";
}

URLSource.defineConverterTo(OffsetSource, doc => {
  doc
    .where(isURL)
    .update(function identifyAndReplaceSocialURLs(annotation: URLAnnotation) {
      let { url, AnnotationClass, attributes } = SocialURLs.identify(
        annotation.attributes
      );
      if (url && AnnotationClass) {
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

  doc
    .where(isURL)
    .update(function identifyAndReplaceVidoURLs(annotation: URLAnnotation) {
      let url = VideoURLs.identify(annotation.attributes);
      if (url) {
        doc.replaceAnnotation(
          annotation,
          new VideoEmbed({
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
