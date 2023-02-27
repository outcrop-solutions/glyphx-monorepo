import { Project, Filter, Column, State } from "./schema";

export interface States {
  states: Array<State> | null;
}

export interface WithProjectState extends State {
  project: Project | null;
}

export interface WithProjectStates {
  states: Array<WithProjectState>;
}

export interface WithFiltersState extends State {
  filters: Array<Filter> | null;
}

export interface WithFiltersStates {
  states: Array<WithFiltersState>;
}

export interface WithCommentsState extends State {
  comments: Array<Comment> | null;
}

export interface WithCommentsStates {
  states: Array<WithCommentsState>;
}
