import Document, { Annotation, is } from "@atjson/document";
import { CerosEmbed, FireworkEmbed } from "@atjson/offset-annotations";
import { Embed } from "../annotations";

function isEmbed(a: Annotation<any>, type: string) {
  // return is(a, Embed) && a.attributes.type.toLowerCase().trim() === type;

  if (a?.attributes?.type?.toLowerCase().trim() === type) {
    return a;
  }
  //return a?.attributes?.type?.toLowerCase().trim() === type && a;
}
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

  //let fireworkContainer = doc.where(isCerosContainer).as("firework");
  //  let Fcontainers = doc.where(isCerosContainer).as("container");
  //  doc.where({ type: "-html-fw-embed-feed" }).update(function joinContainerWithFrames({}) {
  //     console.log("DDDD3",doc.content.split(" "))
  //   doc.replaceAnnotation(
  //     new FireworkEmbed({
  //       start: doc.start,
  //       end: 100,
  //       attributes: {
  //         id: '1',
  //         channel: 'abc',
  //         open:'_modal'
  //       },
  //     })
  //   );

  doc.where((a) => {
    console.log("Docs Old", a);
  });

  doc
    .where((a) => isEmbed(a, "-html-fw-embed-feed"))
    .update((embed: any) => {
      doc.replaceAnnotation(
        embed,
        new FireworkEmbed({
          id: embed.id,
          start: embed.start,
          end: embed.end,
          attributes: {
            id: embed.id,
            channel: embed.attributes.attributes["-html-channel"],
            open: embed.attributes.attributes["-html-open_in"],
          },
        })
      );
    });

  // doc.where((a) => {
  //   console.log(
  //     "aaaa",a,"is(a, Embed)",is(temp, Embed)
  //   )
  //   if(a?.attributes?.type?.toLowerCase().trim() === '-html-fw-embed-feed'){
  //     const temp = {...a,
  //       type:'embeds',
  //       vendorPrefix:'html'
  //     }
  //     console.log(
  //       "aaaa",a,"is(a, Embed)",is(temp, Embed)
  //     )
  //   }

  // })

  //   let Fcontainers = doc.where({ type: "-html-fw-embed-feed" }).as("embed");
  //  let fireworkTag = doc.where(isFireworkFrame).as("firework");
  // console.log("Fcontainerss",Fcontainers)
  //  Fcontainers.join(fireworkTag,aCoversB).update(function joinContainerWithFrames({firework}) {
  //     console.log("firework",firework)
  //   doc.replaceAnnotation(
  //     firework,
  //     new FireworkEmbed({
  //       start: 0,
  //       end: 0,
  //       attributes: {
  //         id: firework[0].attributes.id,
  //         channel: firework[0].attributes.channel,
  //         open: firework[0].attributes.vf
  //       },
  //     })
  //   );

  // });

  return doc;
}
