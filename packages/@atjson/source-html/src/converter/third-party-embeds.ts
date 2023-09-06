import Document, { Annotation } from "@atjson/document";
import {
  CerosEmbed,
  FireworkEmbed,
  CneAudioEmbed,
} from "@atjson/offset-annotations";
import { Script } from "../annotations";

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

function isCneAudioScript(a: Annotation<any>) {
  return (
    a.attributes.src &&
    a.attributes.src.match(/embed-audio(-sandbox)?\.cnevids\.com/)
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

  // See https://docs.firework.com/home/web/integration-guide/components/embed-feed
  // for documentation on this.
  doc
    .where({ type: "-html-fw-embed-feed" })
    .as("embed")
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      function scriptBeforeEmbed(embed, script: Script) {
        let src = script.attributes.src;
        return (
          (script.end === embed.start || script.end === embed.start - 1) &&
          (!src ||
            src.match(/fwcdn\d\.com\//) != null ||
            src.match(/fwpub\d\.com\//) != null)
        );
      }
    )
    .update(({ embed, scripts }) => {
      let playlist = embed.attributes.playlist;
      let channel = embed.attributes.channel;
      let pipeIndex = playlist.indexOf("|");
      if (pipeIndex !== -1) {
        channel = playlist.slice(0, pipeIndex);
        playlist = playlist.slice(pipeIndex + 1);
      }

      doc.replaceAnnotation(
        embed,
        new FireworkEmbed({
          id: embed.id,
          start: embed.start,
          end: embed.end,
          attributes: {
            playlistId: playlist,
            channel: channel,
            open: embed.attributes.open_in,
          },
        })
      );
      // Remove newlines from embed code
      if (scripts.length) {
        doc.deleteText(scripts[0].end, embed.start);
      }
      doc.removeAnnotations(scripts);
    });

  /**
   * CNE Audio script code
   * The script code has this format:
   *
   *  <script src="https://{host}/script/{type}/{id}?skin={brand}&target={div_id}" defer></script><div id="{div_id}"></div>
   *
   * The Iframe code has this format:
   *
   *  <iframe src="https://{host}/iframe/{type}/{id}?skin={brand}" frameborder="0" height="244" sandbox=allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
   *
   */
  doc
    .where(isCneAudioScript)
    .as("embed")
    .update((embed) => {
      const anchorName = `js-audio1-${new Date().getTime()}`;
      let url = embed.attributes.src;
      const urlObject = new URL(url);
      urlObject.searchParams.set("target", anchorName);

      doc.replaceAnnotation(
        embed,
        new CneAudioEmbed({
          id: embed.id,
          start: embed.start,
          end: embed.end,
          attributes: {
            url,
            anchorName,
          },
        })
      );
    });

  return doc;
}
