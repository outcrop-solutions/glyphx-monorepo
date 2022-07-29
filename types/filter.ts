import { Project, Filter, Column, State } from "./schema";

export interface Filters {
  filters: Array<Filter> | null;
}

export interface WithProjectFilter extends Filter {
  project: Project | null;
}

export interface WithProjectFilters {
  filters: Array<WithProjectFilter>;
}

export interface WithColumnsFilter extends Filter {
  columns: Array<Column> | null;
}

export interface WithColumnsFilters {
  filters: Array<WithColumnsFilter>;
}

export interface WithStatesFilter extends Filter {
  states: Array<State> | null;
}

export interface WithStatesFilters {
  filters: Array<WithStatesFilter>;
}
