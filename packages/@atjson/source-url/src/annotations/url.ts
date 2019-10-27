import { ObjectAnnotation } from "@atjson/document";

export class URLAnnotation extends ObjectAnnotation<{
  host: string;
  hash: string;
  pathname: string;
  protocol: string;
  searchParams: {
    [key: string]: string;
  };
}> {
  static type = "url";
  static vendorPrefix = "whatwg";
}
