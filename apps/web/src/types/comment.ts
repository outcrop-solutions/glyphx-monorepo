import { Comment, State } from "./schema";

export interface Comments {
  comments: Array<Comment> | null;
}

export interface WithStateComment extends Comment {
  state: State;
}

export interface WithStatesComments extends Comments {
  comments: Array<WithStateComment>;
}
