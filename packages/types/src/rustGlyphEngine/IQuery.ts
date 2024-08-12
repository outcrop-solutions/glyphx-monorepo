interface IOperator {
  name: string;
}

interface IGreaterThan extends IOperator {
  name: 'GreaterThan';
}
interface IGreaterThanEqual extends IOperator {
  name: 'GreaterThanEqual';
}

type Operator = IGreaterThan | IGreaterThanEqual;
interface IQueryType {
  sub_type: SubType;
  operator: Operator;
}
type SubType = IValue;

interface ISubType {
  name: string;
}
interface IValue extends ISubType {
  name: 'Value';
  type: 'String' | 'Number' | 'Integer';
  value: string | number;
}
export interface IInclude extends IQueryType {}
export interface IExclude extends IQueryType {}
export interface INoOp {}

interface query_type {
  include?: IInclude;
  exclude?: IExclude;
  no_op?: INoOp;
}

export interface IQuery {
  X: query_type;
  Y: query_type;
  Z: query_type;
}

let query: IQuery = {
  X: {
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
  Y: {},
  Z: {},
};

console.log(query);
