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
      let canonicalURL = SocialURLs.identify(annotation.attributes);
      if (canonicalURL) {
        let { attributes, Class } = canonicalURL;
        doc.replaceAnnotation(
          annotation,
          new Class({
            id: annotation.id,
            start: annotation.start,
            end: annotation.end,
            attributes
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
      } else {
        // If we've found a URL Annotation that doesn't match a SocialURL
        // pattern, remove it for our purposes here.
        doc.removeAnnotation(annotation);
      }
    });

  return new OffsetSource(doc.toJSON());
});
