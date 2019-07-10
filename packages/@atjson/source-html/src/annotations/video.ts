// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.8.9 The video element](https://html.spec.whatwg.org/multipage/media.html#the-video-element)
export default class Video extends BlockAnnotation<GlobalAttributes & {
  src?: string;
  crossorigin?: string;
  poster?: string;
  preload?: string;
  autoplay?: string;
  playsinline?: string;
  loop?: string;
  muted?: string;
  controls?: string;
  width?: string;
  height?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'video';
}
