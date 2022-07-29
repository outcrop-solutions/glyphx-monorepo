// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Project, State, Comment, StateFilter, Filter, ColumnFilter, Column } = initSchema(schema);

export {
  Project,
  State,
  Comment,
  StateFilter,
  Filter,
  ColumnFilter,
  Column
};