import { InlineAnnotation } from "@atjson/document";

export default class Link extends InlineAnnotation<{
  ulnk_url: string;
  lnk_type: number;
}> {
  static vendorPrefix = "gdocs";
  static type = "lnks_link";
}
