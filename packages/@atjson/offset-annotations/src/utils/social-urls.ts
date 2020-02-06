import {
  IframeEmbed,
  FacebookEmbed,
  GiphyEmbed,
  InstagramEmbed,
  PinterestEmbed,
  TwitterEmbed,
  TikTokEmbed
} from "../annotations";

function without<T>(array: T[], value: T): T[] {
  let presentParts: T[] = [];
  for (let part of array) {
    if (part !== value) {
      presentParts.push(part);
    }
  }

  return presentParts;
}

interface IUrl {
  protocol: string;
  host: string;
  pathname: string;
  hash: string;
  searchParams: { [key: string]: string } | URLSearchParams;
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
  return {
    attributes: { url: `https://www.instagram.com/p/${id}` },
    Class: InstagramEmbed
  };
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
  return {
    attributes: {
      url: `https://twitter.com/${username}/status/${tweetId}`
    },
    Class: TwitterEmbed
  };
}

// Pinterest embeds
// - www.pinterest.com/:user
// - www.pinterest.com/:user/:board
// - www.pinterest.com/pin/:id
function isPinterestURL(url: IUrl) {
  return url.host === "www.pinterest.com";
}

function normalizePinterestURL(url: IUrl) {
  return {
    attributes: {
      url: `https://www.pinterest.com${url.pathname}`
    },
    Class: PinterestEmbed
  };
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

function normalizeFacebookURL(url: IUrl) {
  if (isFacebookEmbedURL(url)) {
    url = new URL(getSearchParam(url.searchParams, "href") as string);
  }

  let parts = without<string>(url.pathname.split("/"), "");
  let id = parts.pop();
  let username = parts.shift();

  return {
    attributes: {
      url: `https://www.facebook.com/${username}/posts/${id}`
    },
    Class: FacebookEmbed
  };
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

  return {
    attributes: { url: `https://giphy.com/embed/${id}` },
    Class: GiphyEmbed
  };
}

// Spotify URLs
// - open.spotify.com/album/:id
// - open.spotify.com/playlist/:id
// - open.spotify.com/track/:id
// - open.spotify.com/artist/:id
function isSpotifyUrl(url: IUrl) {
  return url.host === "open.spotify.com";
}

function normalizeSpotifyUrl(url: IUrl) {
  let parts = without<string>(url.pathname.split("/"), "");
  if (parts[0] === "embed") {
    parts.shift();
  }
  let type = parts[0];
  let id = parts[1];

  return {
    Class: IframeEmbed,
    attributes: {
      url: `https://open.spotify.com/embed/${type}/${id}`,
      width: "300",
      height: type === "track" ? "80" : "380"
    }
  };
}

function isTikTokUrl(url: IUrl) {
  return (
    url.host === "www.tiktok.com" ||
    url.host === "tiktok.com" ||
    url.host === "m.tiktok.com"
  );
}

function normalizeTikTokUrl(url: IUrl) {
  let [handle, type, id] = without<string>(url.pathname.split("/"), "");
  return {
    Class: TikTokEmbed,
    attributes: {
      url: `https://www.tiktok.com/${handle}/${type}/${id}`
    }
  };
}

export function identify(
  url: IUrl
): {
  attributes: { url: string; width?: string; height?: string };
  Class: typeof IframeEmbed;
} | null {
  if (isFacebookURL(url)) {
    return normalizeFacebookURL(url);
  }

  if (isGiphyURL(url)) {
    return normalizeGiphyURL(url);
  }

  if (isInstagramURL(url)) {
    return normalizeInstagramURL(url);
  }

  if (isPinterestURL(url)) {
    return normalizePinterestURL(url);
  }

  if (isTwitterURL(url)) {
    return normalizeTwitterURL(url);
  }

  if (isSpotifyUrl(url)) {
    return normalizeSpotifyUrl(url);
  }

  if (isTikTokUrl(url)) {
    return normalizeTikTokUrl(url);
  }

  return null;
}
