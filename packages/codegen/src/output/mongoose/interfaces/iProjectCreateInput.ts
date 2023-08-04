import { database as databaseTypes } from "@glyphx/types";
import { Types as mongooseTypes } from "mongoose";

export interface IProjectCreateInput
  extends Omit<
    databaseTypes.IProject,
    "_id" | "createdAt" | "updatedAt" | "workspace" | "template"
  > {
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;

  template: mongooseTypes.ObjectId | databaseTypes.IProjecttemplate;
}
