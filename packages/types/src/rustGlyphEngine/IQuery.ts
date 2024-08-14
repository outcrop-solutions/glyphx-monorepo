//IOperator interfaces determine how values will be compared.
//Each IOperator will have a name that will be used to descriminate
//the type.  Additional data for the operator, if needed, will be
//added to the individual operator interfaces.
interface IOperator {
  name: string;
}

//IGreaterThan equates to > in the model.
interface IGreaterThan extends IOperator {
  name: 'GreaterThan';
}

//IGreaterThanEqual equates to >== in the model.
interface IGreaterThanEqual extends IOperator {
  name: 'GreaterThanEqual';
}

//ILessThan equates to < in the model.
interface ILessThan extends IOperator {
  name: 'LessThan';
}

//ILessThanEqual equates to <== in the model.
interface ILessThanEqual extends IOperator {
  name: 'LessThanEqual';
}

//IEqual equates to === in the model.
interface IEqual extends IOperator {
  name: 'Equal';
}

//IEqual equates to === in the model.
interface INotEqual extends IOperator {
  name: 'NotEqual';
}

//The descriminator to determine our valid operators.
type Operator = IGreaterThan | IGreaterThanEqual | ILessThan | ILessThanEqual | IEqual | INotEqual;

//ISubType provides a key, name, that is used to descriminate the type of the sub type.
interface ISubType {
  name: string;
}

//The IValue interface defines a QueryType as being related to the vectorized
//values in our model and provides the information needed to convert the value
//to a vector.  This allows the user to deine a query in terms related to the
//data, while providing information needed to look up the values in the vector
//tables.  The name should always be 'Value'.  The type defines
//how we will convert this value into a vector.  All axis values in the model
//are f64 values, but data in our csv files can be Strings, Integers or Numbers.
//Value is the value to use look up the vector value.
interface IValue extends ISubType {
  name: 'Value';
  type: 'String' | 'Number' | 'Integer';
  value: string | number;
}

//A disciminator that defines the valid values for an IStatistic.value field.
type StatisticValue =
  | 'mean'
  | 'median'
  | 'pct_0'
  | 'pct_5'
  | 'pct_10'
  | 'pct_15'
  | 'pct_20'
  | 'pct_25'
  | 'pct_30'
  | 'pct_33'
  | 'pct_35'
  | 'pct_40'
  | 'pct_45'
  | 'pct_50'
  | 'pct_55'
  | 'pct_60'
  | 'pct_65'
  | 'pct_67'
  | 'pct_70'
  | 'pct_75'
  | 'pct_80'
  | 'pct_85'
  | 'pct_90'
  | 'pct_95'
  | 'pct_99';

//The IStatistic interface defines a QueryType as being related to the statistics for an axis.  In essence, the Query will extract the comprison value from the statistics precomputed by glyphngine.
interface IStatistic extends ISubType {
  name: 'Statistic';
  value: StatisticValue;
}
//The descriminator to determine our valid sub types.
type SubType = IValue | IStatistic;

//Our IQueryTypeDefinition defines how values will be extracted from the axis and
//how they will be compared.  SubType defines the type of the value that will be
//used for camparison.  Currently there are two types of values for a single value
//related to the vectorized value in our model and statistics, which are compiled
//in the glyphengine against our vector values.  The operator defines how the
//values will be compared.
interface IQueryTypeDefinition {
  sub_type: SubType;
  operator: Operator;
}

//These are our interfaces which defines how the model will handle values on an
//axis that match the query. INoOp includes all values and is the default behavior.
export interface IInclude extends IQueryTypeDefinition {}
export interface IExclude extends IQueryTypeDefinition {}
export interface INoOp {}

//IQueryType defines the type of operation to performed on a given axis.  Under the covers,
//the model will convert empty axix values to no_op which always evaluates to true in the model
//causing all values on the axis to be included.
export interface IQueryType {
  include?: IInclude;
  exclude?: IExclude;
  no_op?: INoOp;
  and?: IQueryType[];
  or?: IQueryType[];
}

//IQuery defines our query.  X, Y, and Z are optional and will defult to np_op in the model when they are parsed.
//When passed to the model, use the user land definitions of the the axis.  In the binding layer, (lib.rs) the model
//will convert these into the appropriate axis definitions for use with WGPU.
export interface IQuery {
  x?: IQueryType;
  y?: IQueryType;
  z?: IQueryType;
}

//Here is an example query that will include all glyphs whose raw (unvectorized) value is
//greater than 5.0.  Since the type is a number, the vector will most likelly match the
//origional value.
let numberValueQuery: IQuery = {
  x: {
    include: {
      sub_type: {
        name: 'Value',
        type: 'Number',
        value: 5.0,
      },
      operator: {
        name: 'GreaterThan',
      },
    },
  },
  y: {},
  z: {},
};

//Here is an example query that will include all glyphs whose raw (unvectorized) value is
//greater than 'Sam'.  Since the type is a string, the filtering module will look up the
//vector value for 'Sam' and compare it to the vectorized value in the model. So when using
//strings it is important to include a value that is in the csv file.
let stringValueQuery: IQuery = {
  x: {
    include: {
      sub_type: {
        name: 'Value',
        type: 'String',
        value: 'Sam',
      },
      operator: {
        name: 'GreaterThan',
      },
    },
  },
  y: {},
  z: {},
};

//Here is an example query that will include all glyphs whose raw (unvectorized) value is
//greater than the 99th percentile.
//origional value.
let statisticValueQuery: IQuery = {
  x: {
    include: {
      sub_type: {
        name: 'Statistic',
        value: 'pct_99',
      },
      operator: {
        name: 'GreaterThan',
      },
    },
  },
  y: {},
  z: {},
};
//Here is an example query that will include all glyphs whose raw (unvectorized) value is
//greater than 5.0 and less than 8.  Since the type is a number, the vector will most likelly match the
//origional value.
let numberValueAndQuery: IQuery = {
  x: {
    and: [
      {
        include: {
          sub_type: {
            name: 'Value',
            type: 'Number',
            value: 5.0,
          },
          operator: {
            name: 'GreaterThan',
          },
        },
      },
      {
        include: {
          sub_type: {
            name: 'Value',
            type: 'Number',
            value: 8.0,
          },
          operator: {
            name: 'LessThan',
          },
        },
      },
    ],
  },
  y: {},
  z: {},
};

//Here is an example query that will include all glyphs whose raw (unvectorized) value is
//less than 5.0 or greater than 8.  Since the type is a number, the vector will most likelly match the
//origional value.
let numberValueOrQuery: IQuery = {
  x: {
    or: [
      {
        include: {
          sub_type: {
            name: 'Value',
            type: 'Number',
            value: 5.0,
          },
          operator: {
            name: 'GreaterThan',
          },
        },
      },
      {
        include: {
          sub_type: {
            name: 'Value',
            type: 'Number',
            value: 8.0,
          },
          operator: {
            name: 'LessThan',
          },
        },
      },
    ],
  },
  y: {},
  z: {},
};
