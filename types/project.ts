import { Project, Filter, Column, State } from "./schema";

export interface Projects {
  projects: Array<Project>;
}

export interface WithFilesProject extends Project {
  files: string[] | null;
}

export interface WithFilesProjects {
  projects: Array<WithFilesProject>;
}

export interface WithStatesProject extends Project {
  states: Array<State> | null;
}

export interface WithStatesProjects {
  projects: Array<WithStatesProject>;
}

export interface WithFiltersProject extends Project {
  filters: Array<Filter> | null;
}

export interface WithColumnsProjects {
  projects: Array<WithColumnsProject>;
}

export interface WithColumnsProject extends Project {
  columns: Array<Column> | null;
}
