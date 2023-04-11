export const handleDataType = (prop) => {
  if (prop.key.includes('Column ')) {
    return '';
  } else if (prop.dataType === 0) {
    return 'number';
  } else {
    return 'string';
  }
};
