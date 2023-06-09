export const isJsons = (array) =>
  Array.isArray(array) && array.every((row) => typeof row === 'object' && !(row instanceof Array));

export const isArrays = (array) => Array.isArray(array) && array.every((row) => Array.isArray(row));

export const jsonsHeaders = (array) =>
  Array.from(array.map((json) => Object.keys(json)).reduce((a, b) => new Set([...a, ...b]), []));

export const jsons2arrays = (jsons, headers) => {
  headers = headers || jsonsHeaders(jsons);

  // allow headers to have custom labels, defaulting to having the header data key be the label
  let headerLabels = headers;
  let headerKeys = headers;
  if (isJsons(headers)) {
    headerLabels = headers.map((header) => header.label);
    headerKeys = headers.map((header) => header.key);
  }

  const data = jsons.map((object) => headerKeys.map((header) => getHeaderValue(header, object)));
  return [headerLabels, ...data];
};

export const getHeaderValue = (property, obj) => {
  const foundValue = property
    .replace(/\[([^\]]+)]/g, '.$1')
    .split('.')
    .reduce(function (o, p, i, arr) {
      // if at any point the nested keys passed do not exist, splice the array so it doesnt keep reducing
      const value = o[p];
      if (value === undefined || value === null) {
        arr.splice(1);
      } else {
        return value;
      }
    }, obj);
  // if at any point the nested keys passed do not exist then looks for key `property` in object obj
  return foundValue === undefined ? (property in obj ? obj[property] : '') : foundValue;
};

export const elementOrEmpty = (element) => {
  return typeof element === 'undefined' || element === null ? '' : element;
};

export const joiner = (data, separator = ',', enclosingCharacter = '"') => {
  return data
    .filter((e) => e)
    .map((row, idx) => {
      row = row.map((element) => {
        const result = elementOrEmpty(element);
        return result;
      });
      row = row.map((column) => `${enclosingCharacter}${column}${enclosingCharacter}`).join(separator);
      console.log({ row, idx });
      return row;
    })
    .join(`\n`);
};

export const arrays2csv = (data, headers, separator, enclosingCharacter) =>
  joiner(headers ? [headers, ...data] : data, separator, enclosingCharacter);

export const jsons2csv = (data, headers, separator, enclosingCharacter) =>
  joiner(jsons2arrays(data, headers), separator, enclosingCharacter);

export const string2csv = (data, headers, separator) =>
  headers ? `${headers.join(separator)}\n${data}` : data.replace(/"/g, '""');

export const toCSV = (data, headers, separator, enclosingCharacter) => {
  if (isJsons(data)) return jsons2csv(data, headers, separator, enclosingCharacter);
  if (isArrays(data)) return arrays2csv(data, headers, separator, enclosingCharacter);
  if (typeof data === 'string') return string2csv(data, headers, separator);
  throw new TypeError(`Data should be a "String", "Array of arrays" OR "Array of objects" `);
};
