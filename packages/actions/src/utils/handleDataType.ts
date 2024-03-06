export const handleDataType = (prop, project) => {
  if (prop.key.includes('Column ') || prop.key === project?.template?.shape[prop.axis].key) {
    return '';
  } else if (prop.dataType === 0) {
    return 'number';
  } else if (prop.dataType === 1) {
    return 'string';
  } else if (prop.dataType === 3) {
    return 'date';
  }
};
