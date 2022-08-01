// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Organization, Project, State, Comment, StateFilter, Filter, ColumnFilter, Column } = initSchema(schema);

export {
  Organization,
  Project,
  State,
  Comment,
  StateFilter,
  Filter,
  ColumnFilter,
  Column
};