import Document, { Annotation } from "@atjson/document";
import { Image } from "@atjson/offset-annotations";
import { Link as MDLink } from "../annotations/link";

function getWrappingLink(doc: Document, links: Annotation<unknown>[]) {
  if (links.length !== 1) {
    return;
  }

  const link = links[0];
  const linkSlice = doc
    .slice(link.start, link.end, function isInside(a) {
      return link.start <= a.start && a.end <= link.end;
    })
    .canonical();

  // only set the link attribute if the wrapping link only covers
  // the image. we do not support links wrapping multiple images or image + text
  // at this time
  if (linkSlice.content === "" && linkSlice.annotations.length === 2) {
    return link as MDLink;
  }

  return;
}

export const convertImage = (doc: Document) => {
  const images = doc.where({ type: "-commonmark-image" }).as("image");
  const links = doc.where({ type: "-commonmark-link" }).as("links");

  images
    .outerJoin(links, function isImageInsideLink(image, link) {
      return link.start <= image.start && image.end <= link.end;
    })
    .update(({ image, links }) => {
      const link = getWrappingLink(doc, links);
      doc.replaceAnnotation(
        image,
        new Image({
          start: image.start,
          end: image.end,
          attributes: {
            url: image.attributes.src,
            title: image.attributes.title,
            description: image.attributes.alt,
            link: link
              ? {
                  url: link.attributes.href,
                  title: link.attributes.title,
                }
              : undefined,
          },
        })
      );
      if (link) {
        doc.removeAnnotation(link);
      }
    });
};
