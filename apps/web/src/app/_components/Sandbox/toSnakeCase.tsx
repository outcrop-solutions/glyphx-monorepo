export const toSnakeCase = (value: string): string => {
  const withoutSpaces = value.replace(/\s+/g, '');
  return withoutSpaces.replace(/([A-Z])/g, (match, letter, index) =>
    index > 0 ? '_' + letter?.toLowerCase() : letter?.toLowerCase()
  ) ?? value;
};
