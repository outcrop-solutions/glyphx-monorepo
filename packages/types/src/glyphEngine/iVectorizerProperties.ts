import {IAxis} from './iAxis';
import {IZAxis} from './iZAxis';
import {IFilter} from './iFilter';
import {FIELD_TYPE} from '../fileIngestion/constants';
import {FIELD_DEFINITION_TYPE, DATE_GROUPING, ACCUMULATOR_TYPE, FILTER_TYPE, FORMULA_SYNTAX} from './constants';
export interface IVectorizerProperties {
  workpaceId: string;
  projectId: string;
  dataTableName: string;
  xAxis: IAxis;
  yAxis: IAxis;
  zAxis: IZAxis;
  //Formulas (both filters and displayed fields) can reference fields not contained in the displayed axis.  This field will allow us to pass these definitions to the vectorizer so that they can be included in the computations.
  supportingFields?: IAxis[];
  //filters can be applied to both displayed axis fields and fields defined in supporting fields.
  filters?: IFilter[];
}
//The following are examples of how the vectorizer properties would be defined.
const test1: IVectorizerProperties = {
  workpaceId: '123',
  projectId: '123',
  dataTableName: '123',
  xAxis: {
    fieldDisplayName: 'Field1',
    fieldDataType: FIELD_TYPE.STRING,
    fieldDefinition: {
      fieldType: FIELD_DEFINITION_TYPE.STANDARD,
      fieldName: 'cola',
    },
  },
  yAxis: {
    fieldDisplayName: 'Field2',
    fieldDataType: FIELD_TYPE.INTEGER,
    fieldDefinition: {
      fieldType: FIELD_DEFINITION_TYPE.DATE,
      fieldName: 'colb',
      dateGrouping: DATE_GROUPING.MONTH_OF_YEAR,
    },
  },
  zAxis: {
    fieldDisplayName: 'colc',
    fieldDataType: FIELD_TYPE.NUMBER,
    fieldDefinition: {
      fieldType: FIELD_DEFINITION_TYPE.ACCUMULATED,
      accumulatedFieldDefinition: {
        fieldType: FIELD_DEFINITION_TYPE.STANDARD,
        fieldName: 'colc',
      },
      accumulator: ACCUMULATOR_TYPE.SUM,
    },
  },
  filters: [
    {
      fieldDisplayName: 'Field1',
      filterDefinition: {
        filterType: FILTER_TYPE.INCLUDE,
        filterValues: ['a', 'b', 'c'],
      },
    },
    {
      fieldDisplayName: 'Field2',
      filterDefinition: {
        filterType: FILTER_TYPE.INCLUDE_BY_RANGE,
        minValue: new Date('2020-01-01'),
        maxValue: new Date('2020-12-31'),
      },
    },
  ],
};

const test2: IVectorizerProperties = {
  workpaceId: '123',
  projectId: '123',
  dataTableName: '123',
  xAxis: {
    fieldDisplayName: 'field1',
    fieldDataType: FIELD_TYPE.NUMBER,
    fieldDefinition: {
      fieldType: FIELD_DEFINITION_TYPE.FORMULA,
      formulaSyntax: FORMULA_SYNTAX.JAVASCRIPT,
      formula: {
        input: {
          cola: 'cola',
          colb: 'colb',
        },
        formula: ['cola + colb'],
      },
    },
  },
  yAxis: {
    fieldDisplayName: 'field2',
    fieldDataType: FIELD_TYPE.STRING,
    fieldDefinition: {
      fieldType: FIELD_DEFINITION_TYPE.STANDARD,
      fieldName: 'colb',
    },
  },
  zAxis: {
    fieldDisplayName: 'colc',
    fieldDataType: FIELD_TYPE.NUMBER,
    fieldDefinition: {
      fieldType: FIELD_DEFINITION_TYPE.ACCUMULATED,
      accumulatedFieldDefinition: {
        fieldType: FIELD_DEFINITION_TYPE.STANDARD,
        fieldName: 'colc',
      },
      accumulator: ACCUMULATOR_TYPE.SUM,
    },
  },
  supportingFields: [
    {
      fieldDisplayName: 'field3',
      fieldDataType: FIELD_TYPE.NUMBER,
      fieldDefinition: {
        fieldType: FIELD_DEFINITION_TYPE.STANDARD,
        fieldName: 'cold',
      },
    },
    {
      fieldDisplayName: 'field4',
      fieldDataType: FIELD_TYPE.NUMBER,
      fieldDefinition: {
        fieldType: FIELD_DEFINITION_TYPE.STANDARD,
        fieldName: 'cole',
      },
    },
  ],
  filters: [
    {
      fieldDisplayName: 'field3',
      filterDefinition: {
        filterType: FILTER_TYPE.FORMULA,
        formulaSyntax: FORMULA_SYNTAX.JAVASCRIPT,
        input: {
          field3: 'field3',
        },
        formula: ['field3 > 50'],
      },
    },
    {
      fieldDisplayName: 'field4',
      filterDefinition: {
        filterType: FILTER_TYPE.FORMULA,
        formulaSyntax: FORMULA_SYNTAX.JAVASCRIPT,
        input: {
          field1: 'field1',
          field4: 'field4',
        },
        formula: ['field1/field4 > 0.50'],
      },
    },
  ],
};
