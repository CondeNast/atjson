import OffsetSource, { FacebookEmbed, GiphyEmbed, InstagramEmbed, PinterestEmbed, TwitterEmbed, YouTubeEmbed } from '@atjson/offset-annotations';
import { URLAnnotation } from './annotations';
import URLSource from './source';

function without<T>(array: T[], value: T): T[] {
  let result: T[] = [];
  return array.reduce((presentParts, part) => {
    if (part !== value) {
      presentParts.push(part);
    }
    return presentParts;
  }, result);
}

URLSource.defineConverterTo(OffsetSource, doc => {
  // Instagram
  // - www.instagram.com/p/:id
  // - www.instagr.am/p/:id
  // - instagram.com/p/:id
  // - instagr.am/p/:id
  doc.where((url: URLAnnotation) => {
    return [
      'www.instagram.com',
      'www.instagr.am',
      'instagram.com',
      'instagr.am'
    ].includes(url.attributes.host) &&
      url.attributes.pathname.startsWith('/p/');
  }).update((url: URLAnnotation) => {
    let [, id] = without<string>(url.attributes.pathname.split('/'), '');
    doc.replaceAnnotation(url, new InstagramEmbed({
      id: url.id,
      start: url.start,
      end: url.end,
      attributes: {
        url: `https://www.instagram.com/p/${id}`
      }
    }));
  });

  // Twitter
  // - www.twitter.com/:handle/status/:tweetId
  // - m.twitter.com/:handle/status/:tweetId
  doc.where((url: URLAnnotation) => {
    return (
      url.attributes.host === 'twitter.com' ||
      /.*\.twitter\.com$/.test(url.attributes.host)
    ) && /\/[^\/]+\/status\/[^\/]+/.test(url.attributes.pathname);
  }).update((url: URLAnnotation) => {
    let [username,, tweetId] = without<string>(url.attributes.pathname.split('/'), '');
    doc.replaceAnnotation(url, new TwitterEmbed({
      id: url.id,
      start: url.start,
      end: url.end,
      attributes: {
        url: `https://twitter.com/${username}/status/${tweetId}`
      }
    }));
  });

  // Youtube embed code
  // - youtu.be/
  // - youtube-nocookie.com/embed/
  doc.where((url: URLAnnotation) => {
    return url.attributes.host === 'youtu.be' ||
            url.attributes.host === 'www.youtube-nocookie.com' &&
            url.attributes.pathname.startsWith('/embed/');
  }).update((url: URLAnnotation) => {
    let parts = without<string>(url.attributes.pathname.split('/'), '');
    let id = parts.pop();
    let youtubeURL = `https://www.youtube.com/embed/${id}`;
    if (url.attributes!.host === 'www.youtube-nocookie.com') {
      youtubeURL = `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (url.attributes!.searchParams.t) {
      youtubeURL += `?t=${url.attributes!.searchParams.t}`;
    }
    doc.replaceAnnotation(url, new YouTubeEmbed({
      id: url.id,
      start: url.start,
      end: url.end,
      attributes: {
        url: youtubeURL
      }
    }));
  });

  // Youtube watch URLs
  // - www.youtube.com/watch?v=
  // - m.youtube.com/watch?v=
  // - youtube.com/watch?v=
  doc.where((url: URLAnnotation) => {
    return [
      'www.youtube.com',
      'm.youtube.com',
      'youtube.com'
    ].includes(url.attributes.host) &&
      url.attributes.pathname.startsWith('/watch') &&
      url.attributes.searchParams.v !== null;
  }).update((url: URLAnnotation) => {
    let youtubeURL = `https://www.youtube.com/embed/${url.attributes.searchParams.v}`;
    if (url.attributes.searchParams.t) {
      youtubeURL += `?t=${url.attributes.searchParams.t}`;
    }
    doc.replaceAnnotation(url, new YouTubeEmbed({
      id: url.id,
      start: url.start,
      end: url.end,
      attributes: {
        url: youtubeURL
      }
    }));
  });

  // Pinterest embeds
  // - www.pinterest.com/:user
  // - www.pinterest.com/:user/:board
  // - www.pinterest.com/pin/:id
  doc.where((url: URLAnnotation) => {
    return [
      'www.pinterest.com'
    ].includes(url.attributes.host);
  }).update((url: URLAnnotation) => {
    doc.replaceAnnotation(url, new PinterestEmbed({
      id: url.id,
      start: url.start,
      end: url.end,
      attributes: {
        url: `https://www.pinterest.com${url.attributes.pathname}`
      }
    }));
  });

  // Facebook embeds
  // - www.facebook.com/:user/:type/:id
  // - www.facebook.com/:user/:type/:context-id/:id
  doc.where((url: URLAnnotation) => {
    return url.attributes.host === 'www.facebook.com' &&
            (url.attributes.pathname.match(/^\/[^\/]+\/[^\/]+\/[^\/]+/) ||
            url.attributes.pathname.match(/^\/[^\/]+\/[^\/]+\/[^\/]+\/[^\/]+/));
  }).update((url: URLAnnotation) => {
    let parts = without<string>(url.attributes.pathname.split('/'), '');
    let id = parts.pop();
    let username = parts.shift();
    doc.replaceAnnotation(url, new FacebookEmbed({
      id: url.id,
      start: url.start,
      end: url.end,
      attributes: {
        url: `https://www.facebook.com/${username}/posts/${id}`
      }
    }));
  });

  // Giphy URLs
  // - giphy.com/gifs/:slug-:id
  // - giphy.com/embed/:id
  doc.where((url: URLAnnotation) => {
    return url.attributes.host === 'giphy.com' &&
            (url.attributes.pathname.startsWith('/gifs/') ||
            url.attributes.pathname.startsWith('/embed/'));
  }).update((url: URLAnnotation) => {
    let pathParts = without<string>(url.attributes.pathname.split('/'), '');
    let id = '';
    if (pathParts[0] === 'embed') {
      id = pathParts[1];
    } else {
      let prettySlug = pathParts[1].split('-');
      id = prettySlug[prettySlug.length - 1];
    }
    doc.replaceAnnotation(url, new GiphyEmbed({
      id: url.id,
      start: url.start,
      end: url.end,
      attributes: {
        url: `https://giphy.com/embed/${id}`
      }
    }));
  });

  return new OffsetSource(doc.toJSON());
});
