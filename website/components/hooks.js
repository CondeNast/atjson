import { useLayoutEffect } from 'react';
import { ResizeObserver } from 'resize-observer';

export const useResizeObserver = (ref, fn, dependencies) => {
  useLayoutEffect(function () {
    let resizeObserver = new ResizeObserver(fn);
    resizeObserver.observe(ref.current);
    return () => {
      resizeObserver.unobserve(ref.current)
    };
  }, dependencies);
};
