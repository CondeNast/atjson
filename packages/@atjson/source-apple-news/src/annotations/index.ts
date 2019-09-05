// ⚠️ Generated via script; modifications may be overridden
import { Component } from "../apple-news-format";

import { ARKit } from "./ARKit";
import { ArticleDocument } from "./ArticleDocument";
import { ArticleLink } from "./ArticleLink";
import { ArticleThumbnail } from "./ArticleThumbnail";
import { ArticleTitle } from "./ArticleTitle";
import { Aside } from "./Aside";
import { Audio } from "./Audio";
import { Author } from "./Author";
import { BannerAdvertisement } from "./BannerAdvertisement";
import { Body } from "./Body";
import { Byline } from "./Byline";
import { Caption } from "./Caption";
import { Chapter } from "./Chapter";
import { Container } from "./Container";
import { DataTable } from "./DataTable";
import { Divider } from "./Divider";
import { EmbedWebVideo } from "./EmbedWebVideo";
import { FacebookPost } from "./FacebookPost";
import { Figure } from "./Figure";
import { Gallery } from "./Gallery";
import { HTMLTable } from "./HTMLTable";
import { Header } from "./Header";
import { Heading } from "./Heading";
import { Illustrator } from "./Illustrator";
import { Image } from "./Image";
import { Instagram } from "./Instagram";
import { Intro } from "./Intro";
import { Logo } from "./Logo";
import { Map } from "./Map";
import { MediumRectangleAdvertisement } from "./MediumRectangleAdvertisement";
import { Mosaic } from "./Mosaic";
import { Music } from "./Music";
import { Photo } from "./Photo";
import { Photographer } from "./Photographer";
import { Place } from "./Place";
import { Portrait } from "./Portrait";
import { PullQuote } from "./PullQuote";
import { Quote } from "./Quote";
import { ReplicaAdvertisement } from "./ReplicaAdvertisement";
import { Section } from "./Section";
import { Title } from "./Title";
import { Tweet } from "./Tweet";
import { Video } from "./Video";

export { ARKit };
export { ArticleDocument };
export { ArticleLink };
export { ArticleThumbnail };
export { ArticleTitle };
export { Aside };
export { Audio };
export { Author };
export { BannerAdvertisement };
export { Body };
export { Byline };
export { Caption };
export { Chapter };
export { Container };
export { DataTable };
export { Divider };
export { EmbedWebVideo };
export { FacebookPost };
export { Figure };
export { Gallery };
export { HTMLTable };
export { Header };
export { Heading };
export { Illustrator };
export { Image };
export { Instagram };
export { Intro };
export { Logo };
export { Map };
export { MediumRectangleAdvertisement };
export { Mosaic };
export { Music };
export { Photo };
export { Photographer };
export { Place };
export { Portrait };
export { PullQuote };
export { Quote };
export { ReplicaAdvertisement };
export { Section };
export { Title };
export { Tweet };
export { Video };

export default [
  ARKit,
  ArticleDocument,
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
];

export function getAnnotationFor(component: Component) {
  switch (component.role) {
    case "body":
      return Body;
    case "title":
      return Title;
    case "heading":
    case "heading1":
    case "heading2":
    case "heading3":
    case "heading4":
    case "heading5":
    case "heading6":
      return Heading;
    case "article_title":
      return ArticleTitle;
    case "intro":
      return Intro;
    case "caption":
      return Caption;
    case "author":
      return Author;
    case "byline":
      return Byline;
    case "illustrator":
      return Illustrator;
    case "photographer":
      return Photographer;
    case "quote":
      return Quote;
    case "pullquote":
      return PullQuote;
    case "image":
      return Image;
    case "photo":
      return Photo;
    case "figure":
      return Figure;
    case "portrait":
      return Portrait;
    case "logo":
      return Logo;
    case "article_thumbnail":
      return ArticleThumbnail;
    case "gallery":
      return Gallery;
    case "mosaic":
      return Mosaic;
    case "audio":
      return Audio;
    case "music":
      return Music;
    case "video":
      return Video;
    case "embedwebvideo":
    case "embedvideo":
      return EmbedWebVideo;
    case "map":
      return Map;
    case "place":
      return Place;
    case "instagram":
      return Instagram;
    case "facebook_post":
      return FacebookPost;
    case "tweet":
      return Tweet;
    case "datatable":
      return DataTable;
    case "htmltable":
      return HTMLTable;
    case "banner_advertisement":
      return BannerAdvertisement;
    case "medium_rectangle_advertisement":
      return MediumRectangleAdvertisement;
    case "replica_advertisement":
      return ReplicaAdvertisement;
    case "container":
      return Container;
    case "section":
      return Section;
    case "chapter":
      return Chapter;
    case "aside":
      return Aside;
    case "header":
      return Header;
    case "divider":
      return Divider;
    case "article_link":
      return ArticleLink;
    case "arkit":
      return ARKit;
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
