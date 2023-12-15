import {fileIngestionTypes, webTypes} from 'types';

export const isValidPayload = (properties) => {
  let retval = true;
  const axisArray = Object.values(webTypes.constants.AXIS);
  for (const axis of axisArray.slice(0, 3)) {
    const prop = properties[axis];
    // properties
    console.log({properties});
    // check if all props have values and Z is numeric
    if (prop?.key === '' || prop?.key.includes('Column ')) {
      retval = false;
    }
  }
  return retval;
};
