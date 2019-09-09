// ⚠️ Generated via script; modifications may be overridden
import { ArticleStructure, Component, Text } from "./apple-news-format";
import {
  ARKit,
  ArticleLink,
  ArticleThumbnail,
  ArticleTitle,
  Aside,
  Audio,
  Author,
  BannerAdvertisement,
  Body,
  Byline,
  Caption,
  Chapter,
  Container,
  DataTable,
  Divider,
  EmbedWebVideo,
  FacebookPost,
  Figure,
  Gallery,
  HTMLTable,
  Header,
  Heading,
  Illustrator,
  Image,
  Instagram,
  Intro,
  Logo,
  Map,
  MediumRectangleAdvertisement,
  Mosaic,
  Music,
  Photo,
  Photographer,
  Place,
  Portrait,
  PullQuote,
  Quote,
  ReplicaAdvertisement,
  Section,
  Title,
  Tweet,
  Video
} from "./annotations";

export function createAnnotation(
  start: number,
  end: number,
  component: Component
) {
  switch (component.role) {
    case "arkit": {
      let { ...attributes } = component;
      return new ARKit({
        start,
        end,
        attributes
      });
    }
    case "article_link": {
      let { components, ...attributes } = component;
      return new ArticleLink({
        start,
        end,
        attributes
      });
    }
    case "article_thumbnail": {
      let { ...attributes } = component;
      return new ArticleThumbnail({
        start,
        end,
        attributes
      });
    }
    case "article_title": {
      let { text, ...attributes } = component;
      return new ArticleTitle({
        start,
        end,
        attributes
      });
    }
    case "aside": {
      let { components, ...attributes } = component;
      return new Aside({
        start,
        end,
        attributes
      });
    }
    case "audio": {
      let { ...attributes } = component;
      return new Audio({
        start,
        end,
        attributes
      });
    }
    case "author": {
      let { text, ...attributes } = component;
      return new Author({
        start,
        end,
        attributes
      });
    }
    case "banner_advertisement": {
      let { ...attributes } = component;
      return new BannerAdvertisement({
        start,
        end,
        attributes
      });
    }
    case "body": {
      let { text, ...attributes } = component;
      return new Body({
        start,
        end,
        attributes
      });
    }
    case "byline": {
      let { text, ...attributes } = component;
      return new Byline({
        start,
        end,
        attributes
      });
    }
    case "caption": {
      let { text, ...attributes } = component;
      return new Caption({
        start,
        end,
        attributes
      });
    }
    case "chapter": {
      let { components, ...attributes } = component;
      return new Chapter({
        start,
        end,
        attributes
      });
    }
    case "container": {
      let { components, ...attributes } = component;
      return new Container({
        start,
        end,
        attributes
      });
    }
    case "datatable": {
      let { ...attributes } = component;
      return new DataTable({
        start,
        end,
        attributes
      });
    }
    case "divider": {
      let { ...attributes } = component;
      return new Divider({
        start,
        end,
        attributes
      });
    }
    case "embedwebvideo":
    case "embedvideo": {
      let { ...attributes } = component;
      return new EmbedWebVideo({
        start,
        end,
        attributes
      });
    }
    case "facebook_post": {
      let { ...attributes } = component;
      return new FacebookPost({
        start,
        end,
        attributes
      });
    }
    case "figure": {
      let { ...attributes } = component;
      return new Figure({
        start,
        end,
        attributes
      });
    }
    case "gallery": {
      let { ...attributes } = component;
      return new Gallery({
        start,
        end,
        attributes
      });
    }
    case "htmltable": {
      let { ...attributes } = component;
      return new HTMLTable({
        start,
        end,
        attributes
      });
    }
    case "header": {
      let { components, ...attributes } = component;
      return new Header({
        start,
        end,
        attributes
      });
    }
    case "heading":
    case "heading1":
    case "heading2":
    case "heading3":
    case "heading4":
    case "heading5":
    case "heading6": {
      let { text, ...attributes } = component;
      return new Heading({
        start,
        end,
        attributes
      });
    }
    case "illustrator": {
      let { text, ...attributes } = component;
      return new Illustrator({
        start,
        end,
        attributes
      });
    }
    case "image": {
      let { ...attributes } = component;
      return new Image({
        start,
        end,
        attributes
      });
    }
    case "instagram": {
      let { ...attributes } = component;
      return new Instagram({
        start,
        end,
        attributes
      });
    }
    case "intro": {
      let { text, ...attributes } = component;
      return new Intro({
        start,
        end,
        attributes
      });
    }
    case "logo": {
      let { ...attributes } = component;
      return new Logo({
        start,
        end,
        attributes
      });
    }
    case "map": {
      let { ...attributes } = component;
      return new Map({
        start,
        end,
        attributes
      });
    }
    case "medium_rectangle_advertisement": {
      let { ...attributes } = component;
      return new MediumRectangleAdvertisement({
        start,
        end,
        attributes
      });
    }
    case "mosaic": {
      let { ...attributes } = component;
      return new Mosaic({
        start,
        end,
        attributes
      });
    }
    case "music": {
      let { ...attributes } = component;
      return new Music({
        start,
        end,
        attributes
      });
    }
    case "photo": {
      let { ...attributes } = component;
      return new Photo({
        start,
        end,
        attributes
      });
    }
    case "photographer": {
      let { text, ...attributes } = component;
      return new Photographer({
        start,
        end,
        attributes
      });
    }
    case "place": {
      let { ...attributes } = component;
      return new Place({
        start,
        end,
        attributes
      });
    }
    case "portrait": {
      let { ...attributes } = component;
      return new Portrait({
        start,
        end,
        attributes
      });
    }
    case "pullquote": {
      let { text, ...attributes } = component;
      return new PullQuote({
        start,
        end,
        attributes
      });
    }
    case "quote": {
      let { text, ...attributes } = component;
      return new Quote({
        start,
        end,
        attributes
      });
    }
    case "replica_advertisement": {
      let { ...attributes } = component;
      return new ReplicaAdvertisement({
        start,
        end,
        attributes
      });
    }
    case "section": {
      let { components, ...attributes } = component;
      return new Section({
        start,
        end,
        attributes
      });
    }
    case "title": {
      let { text, ...attributes } = component;
      return new Title({
        start,
        end,
        attributes
      });
    }
    case "tweet": {
      let { ...attributes } = component;
      return new Tweet({
        start,
        end,
        attributes
      });
    }
    case "video": {
      let { ...attributes } = component;
      return new Video({
        start,
        end,
        attributes
      });
    }
    default:
      throw new Error(
        `🚨 No annotation was found that matched the role in ${JSON.stringify(
          component,
          null,
          2
        )}`
      );
  }
}

export function hasText(component: Component): component is Text {
  return (
    [
      "article_title",
      "author",
      "body",
      "byline",
      "caption",
      "heading",
      "heading1",
      "heading2",
      "heading3",
      "heading4",
      "heading5",
      "heading6",
      "illustrator",
      "intro",
      "photographer",
      "pullquote",
      "quote",
      "title"
    ].indexOf(component.role) !== -1
  );
}

export function hasComponents(
  component: Component
): component is ArticleStructure {
  return (
    [
      "article_link",
      "aside",
      "chapter",
      "container",
      "header",
      "section"
    ].indexOf(component.role) !== -1
  );
}
