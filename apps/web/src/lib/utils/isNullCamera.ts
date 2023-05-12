import { web as webTypes } from '@glyphx/types';

export const isNullCamera = (obj: any): obj is webTypes.Camera => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const keys = ['pos', 'dir'];
  for (const key of keys) {
    if (!obj.hasOwnProperty(key)) {
      return false;
    }

    const subObj = obj[key];
    if (typeof subObj !== 'object' || subObj === null) {
      return false;
    }

    const subKeys = ['x', 'y', 'z'];
    for (const subKey of subKeys) {
      if (!subObj.hasOwnProperty(subKey) || typeof subObj[subKey] !== 'number' || subObj[subKey] !== 0) {
        return false;
      }
    }
  }

  return true;
};
