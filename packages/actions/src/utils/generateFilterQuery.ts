import {BasicColumnNameCleaner} from 'fileingestion';
import {webTypes, fileIngestionTypes, databaseTypes} from 'types';

/**
 * Generates a query segment from a column name and state property
 * @param name
 * @param prop
 * @returns
 */
export const generateSegment = (name: string, prop: webTypes.Property) => {
  switch (prop.dataType) {
    case fileIngestionTypes.constants.FIELD_TYPE.NUMBER:
      const {min, max} = prop.filter as unknown as webTypes.INumbericFilter;
      if (min === 0 && max === 0) {
        return '';
      } else {
        return `${name || '-'} BETWEEN ${min} AND ${max}`;
      }
    case fileIngestionTypes.constants.FIELD_TYPE.STRING:
      const {keywords} = prop.filter as unknown as webTypes.IStringFilter;
      if (keywords && keywords.length === 0) {
        return '';
      } else {
        const formatted = keywords
          .map((word) => {
            if (typeof word === 'string') {
              return `'${word}'`;
            } else {
              Object.values(word).join('');
            }
          })
          .filter((val) => typeof val !== 'undefined');

        if (formatted.length > 0) {
          return `${name || '-'} IN (${formatted.join(',')})`;
        } else {
          return '';
        }
      }
    // TODO: fileIngestionTypes.constants.FIELD_TYPE.DATE
    default:
      return '';
  }
};

/**
 * Generatesthe filter segment of a Query
 * @param prop
 * @returns
 */
export const generateFilter = (prop: webTypes.Property) => {
  const cleaner = new BasicColumnNameCleaner();
  const name = cleaner.cleanColumnName(prop.key);
  return generateSegment(name, prop);
};

export const generateFilterQuery = (properties: databaseTypes.IProject['state']['properties']) => {
  const axes = Object.values(webTypes.constants.AXIS);

  const segments: string[] = [];

  for (const axis of axes) {
    const segment = generateFilter(properties[axis]);
    segments.push(segment);
  }

  return segments
    .filter((val) => val !== '')
    .join(' AND ')
    .trimEnd();
};
