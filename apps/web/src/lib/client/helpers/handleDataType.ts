export const handleDataType = (prop) => {
  if (prop.key.includes('Column ')) {
    return '';
  } else if (prop.dataType === 0) {
    return 'number';
  } else if (prop.dataType === 1) {
    return 'string';
  } else if (prop.dataType === 3) {
    return 'date';
  }
};
