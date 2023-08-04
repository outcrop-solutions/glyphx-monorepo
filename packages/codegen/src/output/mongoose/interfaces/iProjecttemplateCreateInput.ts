import { database as databaseTypes } from "@glyphx/types";
import { Types as mongooseTypes } from "mongoose";

export interface IProjecttemplateCreateInput
  extends Omit<
    databaseTypes.IProjecttemplate,
    "_id" | "createdAt" | "updatedAt"
  > {}
