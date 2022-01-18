import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type ProjectMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type StateMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type CommentMetaData = {
  readOnlyFields: 'updatedAt';
}

type StateFilterMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type FilterMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ColumnFilterMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ColumnMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly filePath?: string;
  readonly properties?: (string | null)[];
  readonly author: string;
  readonly shared?: (string | null)[];
  readonly files?: (string | null)[];
  readonly states?: (State | null)[];
  readonly filters?: (Filter | null)[];
  readonly columns?: (Column | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Project, ProjectMetaData>);
  static copyOf(source: Project, mutator: (draft: MutableModel<Project, ProjectMetaData>) => MutableModel<Project, ProjectMetaData> | void): Project;
}

export declare class State {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly camera?: string;
  readonly project?: Project;
  readonly comments?: (Comment | null)[];
  readonly filters?: (StateFilter | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<State, StateMetaData>);
  static copyOf(source: State, mutator: (draft: MutableModel<State, StateMetaData>) => MutableModel<State, StateMetaData> | void): State;
}

export declare class Comment {
  readonly id: string;
  readonly author: string;
  readonly state?: State;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Comment, CommentMetaData>);
  static copyOf(source: Comment, mutator: (draft: MutableModel<Comment, CommentMetaData>) => MutableModel<Comment, CommentMetaData> | void): Comment;
}

export declare class StateFilter {
  readonly id: string;
  readonly state: State;
  readonly filter: Filter;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<StateFilter, StateFilterMetaData>);
  static copyOf(source: StateFilter, mutator: (draft: MutableModel<StateFilter, StateFilterMetaData>) => MutableModel<StateFilter, StateFilterMetaData> | void): StateFilter;
}

export declare class Filter {
  readonly id: string;
  readonly name: string;
  readonly project?: Project;
  readonly columns?: (ColumnFilter | null)[];
  readonly states?: (StateFilter | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Filter, FilterMetaData>);
  static copyOf(source: Filter, mutator: (draft: MutableModel<Filter, FilterMetaData>) => MutableModel<Filter, FilterMetaData> | void): Filter;
}

export declare class ColumnFilter {
  readonly id: string;
  readonly column: Column;
  readonly filter: Filter;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<ColumnFilter, ColumnFilterMetaData>);
  static copyOf(source: ColumnFilter, mutator: (draft: MutableModel<ColumnFilter, ColumnFilterMetaData>) => MutableModel<ColumnFilter, ColumnFilterMetaData> | void): ColumnFilter;
}

export declare class Column {
  readonly id: string;
  readonly name: string;
  readonly min: string;
  readonly max: string;
  readonly project?: Project;
  readonly filters?: (ColumnFilter | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Column, ColumnMetaData>);
  static copyOf(source: Column, mutator: (draft: MutableModel<Column, ColumnMetaData>) => MutableModel<Column, ColumnMetaData> | void): Column;
}