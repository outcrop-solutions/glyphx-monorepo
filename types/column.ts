import { Project, Column, Filter,  } from "./schema";

export interface Columns {
  columns: Array<Column> | null;
}

export interface WithProjectColumn extends Column {
  project: Project | null;
}

export interface WithProjectColumns {
  columns: Array<WithProjectColumn>;
}

export interface WithFiltersColumn extends Column {
  filters: Array<Filter> | null;
}

export interface WithFiltersColumns {
  columns: Array<WithFiltersColumn>;
}