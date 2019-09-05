// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import {
  AdvertisingSettings,
  AutoPlacement,
  ComponentLayout,
  ComponentStyle,
  ComponentTextStyle,
  DocumentStyle,
  Layout,
  Metadata,
  TextStyle
} from "../apple-news-format";

export class ArticleDocument extends BlockAnnotation<{
  componentTextStyles: {
    [key: string]: ComponentTextStyle;
  };
  identifier: string;
  language: string;
  layout: Layout;
  title: string;
  version: string;
  advertisingSettings?: AdvertisingSettings;
  autoplacement?: AutoPlacement;
  componentLayouts?: {
    [key: string]: ComponentLayout;
  };
  componentStyles?: {
    [key: string]: ComponentStyle;
  };
  documentStyle?: DocumentStyle;
  metadata?: Metadata;
  subtitle?: string;
  textStyles?: {
    [key: string]: TextStyle;
  };
}> {
  static vendorPrefix = "apple-news";
  static type = "ArticleDocument";
}
