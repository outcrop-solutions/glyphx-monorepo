export const toSnakeCase = (value: string): string => {
  return value
    ? value?.replace(/([A-Z])/g, (match, letter, index) =>
        index > 0 ? '_' + letter?.toLowerCase() : letter?.toLowerCase()
      )
    : value;
};
