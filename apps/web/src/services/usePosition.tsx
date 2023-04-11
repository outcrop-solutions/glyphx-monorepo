import { useState, useLayoutEffect } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

/**
 * Dynamically retrieves the div position via getBoundingClient for Qt drawer repositionsing
 * @param {DOMElement} target
 * @returns {Object}
 */
export const usePosition = (target) => {
  const [entry, setEntry] = useState(null);
  // Where the magic happens
  useResizeObserver(target, (entry) => setEntry(entry.contentRect));

  return entry;
};
