import Document, { Annotation, is, SliceAnnotation } from "@atjson/document";
import uuid from "uuid-random";
import {
  getClosestAspectRatio,
  VideoEmbed,
  VideoURLs,
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
    annotation.attributes.href?.indexOf("https://vimeo.com") !== -1
  );
}

function getSize(annotation: Iframe, name: "width" | "height") {
  let dimension = annotation.attributes[name];
  if (dimension) {
    return parseInt(dimension, 10);
  }
  return undefined;
}

export default function (doc: Document) {
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
    .outerJoin(
      doc.where(isVimeoLink).as("links"),
      function vimeoCaptionJoin({ paragraph }, link) {
        return covers(paragraph[0], link);
      }
    )
    .update(function convertVimeoVideos({ video, paragraph, links }) {
      let captionId = uuid();
      let src = video.attributes.src;
      if (src?.indexOf("//") === 0) {
        src = `https:${src}`;
      }
      let urlAttributes = VideoURLs.identify(new URL(src));
      assert(
        urlAttributes && urlAttributes.url,
        `The Vimeo embed ${video.attributes.src} was definitely defined in our queries, but was not identified.`
      );

      if (paragraph.length === 1 && links.length > 0) {
        doc.replaceAnnotation(
          paragraph[0],
          new SliceAnnotation({
            id: captionId,
            start: paragraph[0].start,
            end: paragraph[0].end,
            attributes: {
              refs: [video.id],
            },
          })
        );
      }

      let width = getSize(video, "width");
      let height = getSize(video, "height");
      doc.replaceAnnotation(
        video,
        new VideoEmbed({
          id: video.id,
          start: video.start,
          end: video.end,
          attributes: {
            ...urlAttributes,
            width,
            height,
            aspectRatio:
              width && height
                ? getClosestAspectRatio(width, height)
                : undefined,
            caption: captionId,
            anchorName: video.attributes.id,
          },
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
            provider: VideoURLs.Provider.BRIGHTCOVE,
            width,
            height,
            aspectRatio:
              width && height
                ? getClosestAspectRatio(width, height)
                : undefined,
            anchorName: video.attributes.id,
          },
        })
      );
      doc.removeAnnotations(divsToToss);
    });

  doc.where(isIframe).update(function convertIdentifiedVideos(iframe) {
    let src = iframe.attributes.src;
    if (src?.indexOf("//") === 0) {
      src = `https:${src}`;
    }
    let urlAttributes = VideoURLs.identify(new URL(src));
    if (urlAttributes) {
      let width = getSize(iframe, "width");
      let height = getSize(iframe, "height");

      doc.replaceAnnotation(
        iframe,
        new VideoEmbed({
          start: iframe.start,
          end: iframe.end,
          attributes: {
            ...urlAttributes,
            width,
            height,
            aspectRatio:
              width && height
                ? getClosestAspectRatio(width, height)
                : undefined,
            anchorName: iframe.attributes.id,
          },
        })
      );
    }
  });

  return doc;
}
