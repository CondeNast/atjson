import {
  FacebookEmbed,
  GiphyEmbed,
  IframeEmbed,
  InstagramEmbed,
  MastodonEmbed,
  PinterestEmbed,
  ThreadsEmbed,
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

// Instagram TV
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

// Instagram Reel
// - www.instagram.com/reel/:id
// - www.instagr.am/reel/:id
// - instagram.com/reel/:id
// - instagr.am/reel/:id
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

// Threads
// - www.threads.net/:handle/post/:id
function isThreadsURL(url: IUrl) {
  return url.host === "www.threads.net";
}

function normalizeThreadsURL(url: IUrl) {
  return {
    Class: ThreadsEmbed,
    attributes: {
      url: `https://${url.host}${url.pathname}`,
    },
  };
}

// Twitter
// - www.twitter.com/:handle/status/:tweetId
// - m.twitter.com/:handle/status/:tweetId
// - www.x.com/:handle/status/:postId
// - m.x.com/:handle/status/:postId
function isTwitterURL(url: IUrl) {
  return (
    (url.host === "x.com" ||
      /.*\.x\.com$/.test(url.host) ||
      url.host === "twitter.com" ||
      /.*\.twitter\.com$/.test(url.host)) &&
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
// - www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2F{user}}%2Fposts%2F{id}"
// - www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F{user}}%2Fposts%2F{id}"
function isFacebookURL(url: IUrl) {
  let href = getSearchParam(url.searchParams, "href");

  try {
    if (isFacebookPluginURL(url) && href) {
      url = new URL(href);
    }
    return (
      url.host === "www.facebook.com" &&
      (!!url.pathname.match(/^\/[^\/]+\/[^\/]+\/[^\/]+/) ||
        !!url.pathname.match(/^\/[^\/]+\/[^\/]+\/[^\/]+\/[^\/]+/))
    );
  } catch {
    return false;
  }
}

function isFacebookPluginURL(url: IUrl) {
  return (
    url.host === "www.facebook.com" &&
    (url.pathname === "/plugins/post.php" ||
      url.pathname === "/plugins/video.php")
  );
}

function normalizeFacebookURL(url: IUrl) {
  if (isFacebookPluginURL(url)) {
    url = new URL(getSearchParam(url.searchParams, "href") as string);
  }

  return {
    attributes: {
      url: `https://www.facebook.com${url.pathname}`,
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

// For now, we'll support the mastodon.social server
function isMastodonUrl(url: IUrl) {
  return url.host === "mastodon.social";
}

function normalizeMastodonUrl(url: IUrl) {
  return {
    Class: MastodonEmbed,
    attributes: {
      url: `${url.protocol}//${url.host}${url.pathname}`,
    },
  };
}

export function identify(url: IUrl) {
  if (isFacebookURL(url)) {
    return normalizeFacebookURL(url);
  }

  if (isGiphyURL(url)) {
    return normalizeGiphyURL(url);
  }

  if (isThreadsURL(url)) {
    return normalizeThreadsURL(url);
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

  if (isMastodonUrl(url)) {
    return normalizeMastodonUrl(url);
  }

  return null;
}
