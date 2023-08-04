import { database as databaseTypes } from "@glyphx/types";
import { Types as mongooseTypes } from "mongoose";

export interface IMemberCreateInput
  extends Omit<
    databaseTypes.IMember,
    | "_id"
    | "createdAt"
    | "updatedAt"
    | "member"
    | "invitedBy"
    | "workspace"
    | "project"
  > {
  member: mongooseTypes.ObjectId | databaseTypes.IUser;
  invitedBy: mongooseTypes.ObjectId | databaseTypes.IUser;
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
  project: mongooseTypes.ObjectId | databaseTypes.IProject;
}
