import { Annotation } from "./internals";

/**
 * Checks whether an annotation is an instance
 * of the Annotation class.
 */
export function is<
  T extends {
    vendorPrefix: string;
    type: string;
    new (...args: any[]): Annotation<any>;
  }
>(annotation: Annotation<any>, Class: T): annotation is InstanceType<T> {
  return (
    annotation &&
    annotation.type === Class.type &&
    annotation.vendorPrefix === Class.vendorPrefix
  );
}
