import Document, { Annotation, AnnotationConstructor } from "@atjson/document";
import OffsetSource, {
  VideoEmbed,
  VideoURLs,
  CaptionSource
} from "@atjson/offset-annotations";
import { Iframe, Anchor, Div } from "../annotations";

function covers(a: Annotation<any>, b: Annotation<any>) {
  return a.start < b.start && a.end > b.end;
}

function assert(value: any, message: string): asserts value {
  if (!value) {
    throw new Error(message);
  }
}

function is<T extends AnnotationConstructor<any, any>>(
  annotation: Annotation<any>,
  Class: T
): annotation is InstanceType<T> {
  let AnnotationClass = annotation.getAnnotationConstructor();
  return (
    AnnotationClass.vendorPrefix === Class.vendorPrefix &&
    annotation.type === Class.type
  );
}

function isIframe(annotation: Annotation<any>) {
  return is(annotation, Iframe) && annotation.attributes.src;
}

function isVimeoEmbed(annotation: Annotation<any>) {
  return (
    is(annotation, Iframe) &&
    annotation.attributes.src?.indexOf("https://player.vimeo.com/video") === 0
  );
}

function isBrightcoveEmbed(annotation: Annotation<any>) {
  return (
    is(annotation, Iframe) &&
    annotation.attributes.src?.indexOf("https://players.brightcove.net") === 0
  );
}

function isBrightcoveWrapper(annotation: Annotation<any>) {
  return (
    is(annotation, Div) && annotation.attributes.style?.match(/padding\-top/)
  );
}

function isVimeoLink(annotation: Annotation<any>) {
  return (
    is(annotation, Anchor) &&
    annotation.attributes.href?.indexOf("https://vimeo.com")
  );
}

function getSize(annotation: Iframe, name: "width" | "height") {
  let dimension = annotation.attributes[name];
  if (dimension) {
    return parseInt(dimension, 10);
  }
  return undefined;
}

export default function(doc: Document) {
  doc
    .where(isVimeoEmbed)
    .as("video")
    .outerJoin(
      doc.where({ type: "-html-p" }).as("paragraph"),
      function findPossibleVimeoCaptions(embed, paragraph) {
        return (
          paragraph.start === embed.end || paragraph.start === embed.end + 1
        );
      }
    )
    .outerJoin(doc.where(isVimeoLink).as("links"), function vimeoCaptionJoin(
      { paragraph },
      link
    ) {
      return covers(paragraph[0], link);
    })
    .update(function convertVimeoVideos({ video, paragraph }) {
      let url = VideoURLs.identify(new URL(video.attributes.src));
      assert(
        url,
        `The Vimeo embed ${video.attributes.src} was definitely defined in our queries, but was not identified.`
      );

      let caption: CaptionSource | undefined;
      if (paragraph.length) {
        caption = doc
          .cut(paragraph[0].start, paragraph[0].end)
          .convertTo(OffsetSource);
      }
      doc.replaceAnnotation(
        video,
        new VideoEmbed({
          start: video.start,
          end: video.end,
          attributes: {
            url,
            width: getSize(video, "width"),
            height: getSize(video, "height"),
            caption
          }
        })
      );
    });

  doc
    .where(isBrightcoveEmbed)
    .as("video")
    .outerJoin(
      doc.where(isBrightcoveWrapper).as("wrappers"),
      function joinResponsiveDiv(video, div) {
        return covers(div, video);
      }
    )
    .outerJoin(
      doc.where({ type: "-html-div" }).as("divsToToss"),
      function joinWrappingDivs({ video }, div) {
        return covers(div, video);
      }
    )
    .update(function convertBrightcoveVideo({ video, wrappers, divsToToss }) {
      let width: number | undefined;
      let height: number | undefined;
      if (wrappers[0]) {
        let paddingTop = wrappers[0].attributes.style.match(
          /padding\-top: ([.\d]+)/
        )[1];
        assert(
          paddingTop,
          "padding-top must exist on Brightcove embed wrapping divs"
        );
        width = 640;
        height = 640 * (parseFloat(paddingTop) / 100);
      }
      doc.replaceAnnotation(
        video,
        new VideoEmbed({
          start: video.start,
          end: video.end,
          attributes: {
            url: video.attributes.src,
            width,
            height
          }
        })
      );
      doc.removeAnnotations(divsToToss);
    });

  doc.where(isIframe).update(function convertIdentifiedVideos(iframe) {
    let url = VideoURLs.identify(new URL(iframe.attributes.src));
    if (url) {
      doc.replaceAnnotation(
        iframe,
        new VideoEmbed({
          start: iframe.start,
          end: iframe.end,
          attributes: {
            url,
            width: getSize(iframe, "width"),
            height: getSize(iframe, "height")
          }
        })
      );
    }
  });

  return doc;
}
