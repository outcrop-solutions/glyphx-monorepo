import { database as databaseTypes } from "@glyphx/types";
import { Types as mongooseTypes } from "mongoose";

export interface IProcesstrackingCreateInput
  extends Omit<
    databaseTypes.IProcesstracking,
    "_id" | "createdAt" | "updatedAt"
  > {}
