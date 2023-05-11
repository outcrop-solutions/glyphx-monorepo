import { BasicColumnNameCleaner } from '@glyphx/fileingestion';
import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';

export const generateFilterQuery = (prop: webTypes.Property) => {
  const cleaner = new BasicColumnNameCleaner();
  const name = cleaner.cleanColumnName(prop.key);

  switch (prop.dataType) {
    case fileIngestionTypes.constants.FIELD_TYPE.NUMBER:
      const numFilter = prop.filter as unknown as webTypes.INumbericFilter;
      return `${name || '-'} BETWEEN ${numFilter.min || '-'} AND ${numFilter.max || '-'}`;
    case fileIngestionTypes.constants.FIELD_TYPE.STRING:
      const strFilter = prop.filter as unknown as webTypes.IStringFilter;
      return `MATCH ${name || '-'} AGAINST (${strFilter.keywords.join(' ') || '-'})`;
    default:
      return '';
  }
};
