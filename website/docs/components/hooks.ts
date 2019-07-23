import { MutableRefObject, useLayoutEffect } from 'react';
import { ResizeObserver } from 'resize-observer';
import { ResizeObserverCallback } from 'resize-observer/lib/ResizeObserverCallback';

export const useResizeObserver = (
  ref: MutableRefObject<any>,
  fn: ResizeObserverCallback,
  dependencies?: any[]
) => {
  useLayoutEffect(() => {
    let resizeObserver = new ResizeObserver(fn);
    resizeObserver.observe(ref.current);
    return () => {
      resizeObserver.unobserve(ref.current);
    };
  }, dependencies);
};
