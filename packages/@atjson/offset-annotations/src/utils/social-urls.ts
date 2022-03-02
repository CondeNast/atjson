import {
  IframeEmbed,
  FacebookEmbed,
  GiphyEmbed,
  InstagramEmbed,
  PinterestEmbed,
  TelegramEmbed,
  TikTokEmbed,
  TwitterEmbed,
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

function getSearchString(
  searchParams: { [key: string]: string } | URLSearchParams
) {
  if (searchParams instanceof URLSearchParams) {
    return "?" + searchParams.toString();
  }
  return (
    "?" +
    Object.entries(searchParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")
  );
}

// Instagram
// - www.instagram.com/p/:id
// - www.instagr.am/p/:id
// - instagram.com/p/:id
// - instagr.am/p/:id
function isInstagramPhotoURL(url: IUrl) {
  return (
    [
      "www.instagram.com",
      "www.instagr.am",
      "instagram.com",
      "instagr.am",
    ].includes(url.host) && url.pathname.startsWith("/p/")
  );
}

function normalizeInstagramPhotoURL(url: IUrl) {
  let [, id] = without<string>(url.pathname.split("/"), "");
  return {
    attributes: { url: `https://www.instagram.com/p/${id}` },
    Class: InstagramEmbed,
  };
}

// Instagram
// - www.instagram.com/tv/:id
// - www.instagr.am/tv/:id
// - instagram.com/tv/:id
// - instagr.am/tv/:id
function isInstagramTVURL(url: IUrl) {
  return (
    [
      "www.instagram.com",
      "www.instagr.am",
      "instagram.com",
      "instagr.am",
    ].includes(url.host) && url.pathname.startsWith("/tv/")
  );
}

function normalizeInstagramTVURL(url: IUrl) {
  let [, id] = without<string>(url.pathname.split("/"), "");
  return {
    attributes: { url: `https://www.instagram.com/tv/${id}` },
    Class: InstagramEmbed,
  };
}

// Instagram
// - www.instagram.com/p/:id
// - www.instagr.am/p/:id
// - instagram.com/p/:id
// - instagr.am/p/:id
function isInstagramReelURL(url: IUrl) {
  return (
    [
      "www.instagram.com",
      "www.instagr.am",
      "instagram.com",
      "instagr.am",
    ].includes(url.host) && url.pathname.startsWith("/reel/")
  );
}

function normalizeInstagramReelURL(url: IUrl) {
  let [, id] = without<string>(url.pathname.split("/"), "");
  return {
    attributes: { url: `https://www.instagram.com/reel/${id}` },
    Class: InstagramEmbed,
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
      url: `https://twitter.com/${username}/status/${tweetId}`,
    },
    Class: TwitterEmbed,
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
      url: `https://www.pinterest.com${url.pathname}`,
    },
    Class: PinterestEmbed,
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
      url: `https://www.facebook.com/${username}/posts/${id}`,
    },
    Class: FacebookEmbed,
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
    Class: GiphyEmbed,
  };
}

// Spotify URLs
// - open.spotify.com/album/:id
// - open.spotify.com/playlist/:id
// - open.spotify.com/track/:id
// - open.spotify.com/artist/:id
// - open.spotify.com/episode/:id
// - open.spotify.com/show/:id
// - open.spotify.com/embed
function isSpotifyUrl(url: IUrl) {
  return url.host === "open.spotify.com";
}

const spotifyEmbedTypes: {
  [index: string]: string;
} = {
  episode: "embed-podcast",
  show: "embed-podcast",
  default: "embed",
};

const spotifyEmbedSizes: {
  [index: string]: { height: string; width: string };
} = {
  default: {
    height: "380",
    width: "300",
  },
  track: {
    height: "80",
    width: "300",
  },
  episode: {
    height: "232",
    width: "100%",
  },
  show: {
    height: "232",
    width: "100%",
  },
};

// parses a spotify uri, in the form spotify:<type>:<id>
function parseSpotifyEmbedUri(uri: string) {
  let uriParts = uri.split(":");
  return {
    type: uriParts[1],
    id: uriParts[2],
  };
}

function parseSpotifyEmbedPath(pathname: string) {
  let pathParts = without<string>(pathname.split("/"), "");
  if (pathParts[0] === "embed" || pathParts[0] === "embed-podcast") {
    pathParts.shift();
  }

  return {
    type: pathParts[0],
    id: pathParts[1],
  };
}

function normalizeSpotifyUrl(url: IUrl) {
  const embedUri = getSearchParam(url.searchParams, "uri");

  let { id, type } = embedUri
    ? parseSpotifyEmbedUri(embedUri)
    : parseSpotifyEmbedPath(url.pathname);
  let embedType = spotifyEmbedTypes[type] || spotifyEmbedTypes.default;
  let { height, width } = spotifyEmbedSizes[type] || spotifyEmbedSizes.default;

  return {
    Class: IframeEmbed,
    attributes: {
      url: `https://open.spotify.com/${embedType}/${type}/${id}`,
      width,
      height,
    },
  };
}

// Megaphone URLs
// - playlist.megaphone.fm/?p=playlistId
// - playlist.megaphone.fm/?p-playlistId&light=true
// - playlist.megaphone.fm/?e=episodeId
// - playlist.megaphone.fm/?e=episodeId&light=true
function isMegaphoneUrl(url: IUrl) {
  return url.host === "playlist.megaphone.fm";
}

function normalizeMegaphoneUrl(url: IUrl) {
  let height = getSearchParam(url.searchParams, "p") ? "485" : "200";
  return {
    Class: IframeEmbed,
    attributes: {
      url: `https://playlist.megaphone.fm/${getSearchString(url.searchParams)}`,
      height,
      width: "100%",
    },
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
      url: `https://www.tiktok.com/${handle}/${type}/${id}`,
    },
  };
}

// Telegram URLs
// Needs to covert post URL (https://t.me/:channelSlug/:postId) to post slug (:channelSlug/:postId)
// Docs here https://core.telegram.org/widgets/post

function isTelegramUrl(url: IUrl) {
  return url.host === "t.me";
}

function normalizeTelegramUrl(url: IUrl) {
  let [cahnnelSlug, postId] = without<string>(url.pathname.split("/"), "");
  return {
    Class: TelegramEmbed,
    attributes: {
      url: `${cahnnelSlug}/${postId}`,
    },
  };
}
function isRedditURL(url: IUrl) {
  return (
    (url.host === "www.redditmedia.com" && url.pathname.startsWith("/r/")) ||
    (url.host === "www.reddit.com" && url.pathname.startsWith("/r/"))
  );
}

function normalizeRedditURL(url: IUrl) {
  let ref_source = getSearchParam(url.searchParams, "ref_source") || "embed";
  let ref = getSearchParam(url.searchParams, "ref") || "share";
  let embed = getSearchParam(url.searchParams, "embed") || true;
  let showmedia = getSearchParam(url.searchParams, "showmedia") || "false";
  let created = getSearchParam(url.searchParams, "created");
  let theme = getSearchParam(url.searchParams, "theme");
  let showedits = getSearchParam(url.searchParams, "showedits");
  let sandbox = "allow-scripts allow-same-origin allow-popups";
  let width = getSearchParam(url.searchParams, "width") || "640";
  let height = getSearchParam(url.searchParams, "height") || "141";
  let searchString = `?ref_source=${ref_source}&ref=${ref}&embed=${embed}&showmedia=${showmedia}`;
  if (showedits) {
    searchString += `&showedits=${showedits}`;
  }
  if (created) {
    searchString += `&created=${encodeURIComponent(created)}`;
  }
  if (theme) {
    searchString += `&theme=${theme}`;
  }

  return {
    attributes: {
      url: `https://www.redditmedia.com${url.pathname}${searchString}`,
      width,
      height,
      sandbox,
    },
    Class: IframeEmbed,
  };
}

export function identify(url: IUrl): {
  attributes: {
    url: string;
    width?: string;
    height?: string;
    sandbox?: string;
  };
  Class: typeof IframeEmbed;
} | null {
  if (isRedditURL(url)) {
    return normalizeRedditURL(url);
  }
  if (isFacebookURL(url)) {
    return normalizeFacebookURL(url);
  }

  if (isGiphyURL(url)) {
    return normalizeGiphyURL(url);
  }

  if (isInstagramPhotoURL(url)) {
    return normalizeInstagramPhotoURL(url);
  }

  if (isInstagramTVURL(url)) {
    return normalizeInstagramTVURL(url);
  }

  if (isInstagramReelURL(url)) {
    return normalizeInstagramReelURL(url);
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

  if (isMegaphoneUrl(url)) {
    return normalizeMegaphoneUrl(url);
  }

  if (isTikTokUrl(url)) {
    return normalizeTikTokUrl(url);
  }

  if (isTelegramUrl(url)) {
    return normalizeTelegramUrl(url);
  }

  return null;
}
