import Document, { Annotation } from "@atjson/document";
import { CerosEmbed, FireworkEmbed } from "@atjson/offset-annotations";

function isCerosExperienceFrame(a: Annotation<any>) {
  return a.type === "iframe" && a.attributes.class === "ceros-experience";
}

function isCerosOriginDomainsScript(a: Annotation<any>) {
  if (a.type !== "script") {
    return false;
  }

  let src = a.attributes.src;
  if (src && src.indexOf("//") === 0) {
    src = `https:${src}`;
  }
  try {
    return src && new URL(src).hostname === "view.ceros.com";
  } catch (error) {
    return false;
  }
}

function isCerosContainer(a: Annotation<any>) {
  return (
    a.attributes.id != null &&
    a.attributes.id.match(/^experience-.*$/) &&
    a.attributes.dataset &&
    a.attributes.dataset.aspectratio != null
  );
}

function aCoversB(a: Annotation<any>, b: Annotation<any>) {
  return a.start < b.start && a.end > b.end;
}

export default function convertThirdPartyEmbeds(doc: Document) {
  /**
   * Ceros Embeds are iframes wrapped in divs:
   *   <div id="experience-*" data-aspectRatio="{aspectRatio}" data-mobile-aspectRatio="{mobileAspectRatio}">
   *     <iframe src="{url}" class="ceros-experience"></iframe>
   *   </div>
   *   <script type="text/javascript" src="//view.ceros.com/scroll-proxy.min.js" data-ceros-origin-domains="view.ceros.com"></script>
   */
  let containers = doc.where(isCerosContainer).as("container");
  let iframeTags = doc.where(isCerosExperienceFrame).as("iframes");

  doc.where(isCerosOriginDomainsScript).remove();

  containers
    .join(iframeTags, aCoversB)
    .update(function joinContainerWithFrames({ container, iframes }) {
      doc.removeAnnotations(iframes);

      let aspectRatio = parseFloat(container.attributes.dataset.aspectratio);
      let mobileAspectRatio =
        container.attributes.dataset["mobile-aspectratio"];

      if (mobileAspectRatio) {
        mobileAspectRatio = parseFloat(mobileAspectRatio);
      }

      doc.replaceAnnotation(
        container,
        new CerosEmbed({
          id: container.attributes.id.replace(/^experience-(.*)/, "$1"),
          start: container.start,
          end: container.end,
          attributes: {
            anchorName: iframes[0].attributes.id,
            aspectRatio,
            mobileAspectRatio,
            url: iframes[0].attributes.src,
          },
        })
      );
    });

  /**
   *
   * <fw-embed-feed channel="vanity_fair" playlist="gYNwOv" mode="row"
   * open_in="_modal" max_videos="0" placement="middle" player_placement="bottom-right"
   * pip="false" player_minimize="false" branding="false"></fw-embed-feed>
   *
   */

  function isFireworkEmbed(a: Annotation<any>) {
    return a?.type?.toLowerCase().trim() === "fw-embed-feed";
  }

  doc
    .where((a) => isFireworkEmbed(a))
    .update((embed) => {
      doc.replaceAnnotation(
        embed,
        new FireworkEmbed({
          id: embed.id,
          start: embed.start,
          end: embed.end,
          attributes: {
            id: embed.attributes.id,
            channel: embed.attributes.channel,
            open: embed.attributes.open_in,
          },
        })
      );
    });

  return doc;
}
