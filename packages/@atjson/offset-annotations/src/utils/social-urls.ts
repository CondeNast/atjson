import { URL } from "url";
import {
  IframeEmbed,
  FacebookEmbed,
  GiphyEmbed,
  InstagramEmbed,
  PinterestEmbed,
  TwitterEmbed,
  YouTubeEmbed
} from "../annotations";

function without<T>(array: T[], value: T): T[] {
  let result: T[] = [];
  return array.reduce((presentParts, part) => {
    if (part !== value) {
      presentParts.push(part);
    }
    return presentParts;
  }, result);
}

interface IUrl {
  protocol: string;
  host: string;
  pathname: string;
  hash: string;
  searchParams: { [key: string]: string } | URLSearchParams;
}

interface SocialURL {
  url?: string;
  AnnotationClass?: typeof IframeEmbed;
}

function getSearchParam(
  searchParams: { [key: string]: string } | URLSearchParams,
  name: string
) {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(name);
  }
  return searchParams[name];
}

function isYouTubeURL(url: IUrl) {
  return isYouTubeEmbedURL(url) || isYouTubeWatchURL(url);
}

// Youtube embed code
// - youtu.be/
// - youtube-nocookie.com/embed/
// - youtube.com/embed
function isYouTubeEmbedURL(url: IUrl) {
  return (
    url.host === "youtu.be" ||
    (["www.youtube-nocookie.com", "www.youtube.com"].includes(url.host) &&
      url.pathname.startsWith("/embed/"))
  );
}

// Youtube watch URLs
// - www.youtube.com/watch?v=
// - m.youtube.com/watch?v=
// - youtube.com/watch?v=
function isYouTubeWatchURL(url: IUrl) {
  return (
    ["www.youtube.com", "m.youtube.com", "youtube.com"].includes(url.host) &&
    url.pathname.startsWith("/watch") &&
    getSearchParam(url.searchParams, "v") !== null
  );
}

function normalizeYouTubeURL(url: IUrl) {
  let normalized =
    url.host === "www.youtube-nocookie.com"
      ? new URL("https://www.youtube-nocookie.com")
      : new URL("https://www.youtube.com");

  let timestamp = getSearchParam(url.searchParams, "t");
  if (timestamp) {
    normalized.searchParams.set("t", timestamp);
  }

  if (isYouTubeEmbedURL(url)) {
    let parts = without<string>(url.pathname.split("/"), "");
    let id = parts.pop();
    normalized.pathname = `/embed/${id}`;

    let controls = getSearchParam(url.searchParams, "controls");
    if (controls) {
      normalized.searchParams.set("controls", controls);
    }
  } else {
    normalized.pathname = `/embed/${getSearchParam(url.searchParams, "v")}`;
  }

  return normalized.href;
}

// Instagram
// - www.instagram.com/p/:id
// - www.instagr.am/p/:id
// - instagram.com/p/:id
// - instagr.am/p/:id
function isInstagramURL(url: IUrl) {
  return (
    [
      "www.instagram.com",
      "www.instagr.am",
      "instagram.com",
      "instagr.am"
    ].includes(url.host) && url.pathname.startsWith("/p/")
  );
}

function normalizeInstagramURL(url: IUrl) {
  let [, id] = without<string>(url.pathname.split("/"), "");
  return `https://www.instagram.com/p/${id}`;
}

// Twitter
// - www.twitter.com/:handle/status/:tweetId
// - m.twitter.com/:handle/status/:tweetId
function isTwitterURL(url: IUrl) {
  return (
    (url.host === "twitter.com" || /.*\.twitter\.com$/.test(url.host)) &&
    /\/[^\/]+\/status\/[^\/]+/.test(url.pathname)
  );
}

function normalizeTwitterURL(url: IUrl) {
  let [username, , tweetId] = without<string>(url.pathname.split("/"), "");
  return `https://twitter.com/${username}/status/${tweetId}`;
}

// Pinterest embeds
// - www.pinterest.com/:user
// - www.pinterest.com/:user/:board
// - www.pinterest.com/pin/:id
function isPinterestURL(url: IUrl) {
  return ["www.pinterest.com"].includes(url.host);
}

function normalizePinterestURL(url: IUrl) {
  return `https://www.pinterest.com${url.pathname}`;
}

// Facebook URLs
// - www.facebook.com/:user/:type/:id
// - www.facebook.com/:user/:type/:context-id/:id
function isFacebookPostURL(url: IUrl) {
  return (
    url.host === "www.facebook.com" &&
    (!!url.pathname.match(/^\/[^\/]+\/[^\/]+\/[^\/]+/) ||
      !!url.pathname.match(/^\/[^\/]+\/[^\/]+\/[^\/]+\/[^\/]+/))
  );
}

// Facebook embed urls
// - www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2F{user}}%2Fposts%2F{id}"
function isFacebookEmbedURL(url: IUrl) {
  let href = getSearchParam(url.searchParams, "href");

  try {
    return (
      url.host === "www.facebook.com" &&
      url.pathname === "/plugins/post.php" &&
      !!href &&
      isFacebookPostURL(new URL(href))
    );
  } catch {
    return false;
  }
}

function isFacebookURL(url: IUrl) {
  return isFacebookPostURL(url) || isFacebookEmbedURL(url);
}

function normalizeFacebookURL(url: IUrl): string {
  if (isFacebookEmbedURL(url)) {
    return normalizeFacebookURL(
      new URL(getSearchParam(url.searchParams, "href") as string)
    );
  }

  let parts = without<string>(url.pathname.split("/"), "");
  let id = parts.pop();
  let username = parts.shift();

  return `https://www.facebook.com/${username}/posts/${id}`;
}

// Giphy URLs
// - giphy.com/gifs/:slug-:id
// - giphy.com/embed/:id
function isGiphyURL(url: IUrl) {
  return (
    url.host === "giphy.com" &&
    (url.pathname.startsWith("/gifs/") || url.pathname.startsWith("/embed/"))
  );
}

function normalizeGiphyURL(url: IUrl) {
  let pathParts = without<string>(url.pathname.split("/"), "");
  let id = "";
  if (pathParts[0] === "embed") {
    id = pathParts[1];
  } else {
    let prettySlug = pathParts[1].split("-");
    id = prettySlug[prettySlug.length - 1];
  }

  return `https://giphy.com/embed/${id}`;
}

export function identify(url: IUrl): SocialURL {
  if (isFacebookURL(url)) {
    return { url: normalizeFacebookURL(url), AnnotationClass: FacebookEmbed };
  }

  if (isGiphyURL(url)) {
    return { url: normalizeGiphyURL(url), AnnotationClass: GiphyEmbed };
  }

  if (isInstagramURL(url)) {
    return { url: normalizeInstagramURL(url), AnnotationClass: InstagramEmbed };
  }

  if (isPinterestURL(url)) {
    return { url: normalizePinterestURL(url), AnnotationClass: PinterestEmbed };
  }

  if (isTwitterURL(url)) {
    return { url: normalizeTwitterURL(url), AnnotationClass: TwitterEmbed };
  }

  if (isYouTubeURL(url)) {
    return { url: normalizeYouTubeURL(url), AnnotationClass: YouTubeEmbed };
  }

  return {};
}
