import { database as databaseTypes } from "@glyphx/types";
import { Types as mongooseTypes } from "mongoose";

export interface IActivitylogCreateInput
  extends Omit<
    databaseTypes.IActivitylog,
    "_id" | "createdAt" | "updatedAt" | "actor" | "userAgent"
  > {
  actor: mongooseTypes.ObjectId | databaseTypes.IUser;

  userAgent: mongooseTypes.ObjectId | databaseTypes.IUseragent;
}
