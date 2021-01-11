import { BlockAnnotation } from "@atjson/document";

/**
 * A group contains a collection of group items that
 * are arranged with a specific art direction.
 *
 * These art directions can be stored separately to
 * share between text editing and display.
 *
 * An example of this may be a diptych or triptych,
 * where images are displayed side by side in a
 * group that makes up a single work.
 *
 * We recommend storing the ID of the artDirection
 * here and having the actual art direction layout
 * and logic stored elsewhere so it can be reused
 * across multiple documents.
 */
export class Group<T = {}> extends BlockAnnotation<
  T & {
    artDirection: string;
    /**
     * A named identifier used to quickly jump to this item
     */
    anchorName?: string;
  }
> {
  static type = "group";
  static vendorPrefix = "offset";
}
