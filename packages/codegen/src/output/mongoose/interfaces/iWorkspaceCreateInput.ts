import { database as databaseTypes } from "@glyphx/types";
import { Types as mongooseTypes } from "mongoose";

export interface IWorkspaceCreateInput
  extends Omit<
    databaseTypes.IWorkspace,
    "_id" | "createdAt" | "updatedAt" | "creator"
  > {
  creator: mongooseTypes.ObjectId | databaseTypes.IUser;
}
