import Document from "@atjson/document";
import { CerosEmbed } from "@atjson/offset-annotations";

export default function(doc: Document) {
  /**
   * Ceros Embeds are iframes wrapped in divs:
   *   <div id="experience-*" data-aspectRatio="{aspectRatio}" data-mobile-aspectRatio="{mobileAspectRatio}">
   *     <iframe src="{url}" class="ceros-experience"></iframe>
   *   </div>
   *   <script type="text/javascript" src="//view.ceros.com/scroll-proxy.min.js" data-ceros-origin-domains="view.ceros.com"></script>
   */
  let containers = doc
    .where(a => {
      return (
        (a.attributes.id ?? "").match(/^experience-.*$/) &&
        a.attributes.dataset?.aspectratio != null
      );
    })
    .as("container");
  let iframeTags = doc
    .where(a => {
      return a.type === "iframe" && a.attributes.class === "ceros-experience";
    })
    .as("iframes");

  doc
    .where(a => {
      return (
        a.type === "script" &&
        a.attributes.dataset &&
        a.attributes.dataset["ceros-origin-domains"] != null
      );
    })
    .remove();

  containers
    .join(iframeTags, (container, iframe) => {
      return container.start < iframe.start && container.end > iframe.end;
    })
    .update(({ container, iframes }) => {
      iframes.forEach(iframe => doc.removeAnnotation(iframe));

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
