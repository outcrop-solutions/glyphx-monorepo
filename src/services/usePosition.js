import { useState, useLayoutEffect } from "react";
import useResizeObserver from "@react-hook/resize-observer";
export const usePosition = (target) => {
  const [entry, setEntry] = useState();

  useLayoutEffect(() => {
    if (target.current) setEntry(target.current.getBoundingClientRect());
  }, [target]);
  // Where the magic happens
  useResizeObserver(target, (entry) => setEntry(entry));

  return entry;
};
