import { ObjectAnnotation } from "@atjson/document";

export default class URLAnnotation extends ObjectAnnotation {
  static type = "url";
  static vendorPrefix = "whatwg";
  attributes!: {
    host: string;
    hash: string;
    pathname: string;
    protocol: string;
    searchParams: {
      [key: string]: string;
    };
  };
}
