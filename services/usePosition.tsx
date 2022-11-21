import { useState, useLayoutEffect } from "react";
import useResizeObserver from "@react-hook/resize-observer";

/**
 * Dynamically retrieves the div position via getBoundingClient for Qt drawer repositionsing
 * @param {DOMElement} target
 * @returns {Object}
 */
export const usePosition = (target) => {
  const [entry, setEntry] = useState();

  useLayoutEffect(() => {
    if (target.current) setEntry(target.current.getBoundingClientRect());
  }, [target]);
  // Where the magic happens
  // @ts-ignore
  useResizeObserver(target, (entry) => setEntry(entry));

  return entry;
};
