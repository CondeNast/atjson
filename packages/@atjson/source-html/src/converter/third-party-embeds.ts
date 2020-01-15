import Document, { Annotation } from "@atjson/document";
import { CerosEmbed } from "@atjson/offset-annotations";

function isCerosExperienceFrame(a: Annotation<any>) {
  return a.type === "iframe" && a.attributes.class === "ceros-experience";
}

function isCerosOriginDomainsScript(a: Annotation<any>) {
  return (
    a.type === "script" && a.attributes.src?.indexOf("view.ceros.com") !== -1
  );
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
            aspectRatio,
            mobileAspectRatio,
            url: iframes[0].attributes.src
          }
        })
      );
    });

  return doc;
}
