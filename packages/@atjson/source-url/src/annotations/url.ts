import { ObjectAnnotation } from "@atjson/document";

export class URL extends ObjectAnnotation {
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
