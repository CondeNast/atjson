import Document, { Annotation } from "@atjson/document";
import { FireworkEmbed } from "@atjson/offset-annotations";
// import { Embed } from "../annotations";

function isEmbed(a: Annotation<any>, type: string) {
  // return is(a, Embed) && a.attributes.type.toLowerCase().trim() === type;

  if (a?.attributes?.type?.toLowerCase().trim() === type) {
    return a;
  }
  //return a?.attributes?.type?.toLowerCase().trim() === type && a;
}

export default function (doc: Document) {
  /**
   *
   * <fw-embed-feed channel="vanity_fair" playlist="gYNwOv" mode="row"
   * open_in="_modal" max_videos="0" placement="middle" player_placement="bottom-right"
   * pip="false" player_minimize="false" branding="false"></fw-embed-feed>
   *
   */

  doc.where((a) => {
    console.log("Docs Ashish", a);
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

  return doc;
}
