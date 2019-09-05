// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import {
  Anchor,
  Behavior,
  ComponentAnimation,
  ComponentLayout,
  ComponentStyle,
  ConditionalComponent,
  DataTableSorting,
  RecordStore
} from "../apple-news-format";

export class DataTable extends ObjectAnnotation<{
  data: RecordStore;
  role: "datatable";
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  behavior?: Behavior | "none";
  conditional?: ConditionalComponent | ConditionalComponent[];
  dataOrientation?: "horizontal" | "vertical";
  hidden?: boolean;
  identifier?: string;
  layout?: ComponentLayout | string;
  showDescriptorLabels?: boolean;
  sortBy?: DataTableSorting[];
  style?: ComponentStyle | string | "none";
}> {
  static vendorPrefix = "apple-news";
  static type = "DataTable";
}
