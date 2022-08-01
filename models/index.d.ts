import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type OrganizationMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

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

export declare class Organization {
  readonly id: string;
  readonly name: string;
  readonly slug?: string | null;
  readonly members?: (string | null)[] | null;
  readonly invites?: (string | null)[] | null;
  readonly addressLine1?: string | null;
  readonly addressLine2?: string | null;
  readonly city?: string | null;
  readonly postalCode?: string | null;
  readonly country?: string | null;
  readonly subscription?: string | null;
  readonly stripeCustomerId?: string | null;
  readonly owner: string;
  readonly projects?: (Project | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Organization, OrganizationMetaData>);
  static copyOf(source: Organization, mutator: (draft: MutableModel<Organization, OrganizationMetaData>) => MutableModel<Organization, OrganizationMetaData> | void): Organization;
}

export declare class Project {
  readonly id: string;
  readonly name: string;
  readonly slug?: string | null;
  readonly description?: string | null;
  readonly filePath?: string | null;
  readonly expiry?: string | null;
  readonly properties?: (string | null)[] | null;
  readonly url?: string | null;
  readonly author?: string | null;
  readonly shared?: (string | null)[] | null;
  readonly files?: (string | null)[] | null;
  readonly organization?: Organization | null;
  readonly states?: (State | null)[] | null;
  readonly filters?: (Filter | null)[] | null;
  readonly columns?: (Column | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Project, ProjectMetaData>);
  static copyOf(source: Project, mutator: (draft: MutableModel<Project, ProjectMetaData>) => MutableModel<Project, ProjectMetaData> | void): Project;
}

export declare class State {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly camera?: string | null;
  readonly query?: string | null;
  readonly project?: Project | null;
  readonly comments?: (Comment | null)[] | null;
  readonly filters?: (StateFilter | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<State, StateMetaData>);
  static copyOf(source: State, mutator: (draft: MutableModel<State, StateMetaData>) => MutableModel<State, StateMetaData> | void): State;
}

export declare class Comment {
  readonly id: string;
  readonly author: string;
  readonly state?: State | null;
  readonly content?: string | null;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Comment, CommentMetaData>);
  static copyOf(source: Comment, mutator: (draft: MutableModel<Comment, CommentMetaData>) => MutableModel<Comment, CommentMetaData> | void): Comment;
}

export declare class StateFilter {
  readonly id: string;
  readonly state: State;
  readonly filter: Filter;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<StateFilter, StateFilterMetaData>);
  static copyOf(source: StateFilter, mutator: (draft: MutableModel<StateFilter, StateFilterMetaData>) => MutableModel<StateFilter, StateFilterMetaData> | void): StateFilter;
}

export declare class Filter {
  readonly id: string;
  readonly name: string;
  readonly project?: Project | null;
  readonly columns?: (ColumnFilter | null)[] | null;
  readonly states?: (StateFilter | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Filter, FilterMetaData>);
  static copyOf(source: Filter, mutator: (draft: MutableModel<Filter, FilterMetaData>) => MutableModel<Filter, FilterMetaData> | void): Filter;
}

export declare class ColumnFilter {
  readonly id: string;
  readonly column: Column;
  readonly filter: Filter;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<ColumnFilter, ColumnFilterMetaData>);
  static copyOf(source: ColumnFilter, mutator: (draft: MutableModel<ColumnFilter, ColumnFilterMetaData>) => MutableModel<ColumnFilter, ColumnFilterMetaData> | void): ColumnFilter;
}

export declare class Column {
  readonly id: string;
  readonly name: string;
  readonly min?: string | null;
  readonly max?: string | null;
  readonly project?: Project | null;
  readonly filters?: (ColumnFilter | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Column, ColumnMetaData>);
  static copyOf(source: Column, mutator: (draft: MutableModel<Column, ColumnMetaData>) => MutableModel<Column, ColumnMetaData> | void): Column;
}