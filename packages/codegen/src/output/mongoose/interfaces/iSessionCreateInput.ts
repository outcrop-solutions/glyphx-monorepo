import { database as databaseTypes } from "@glyphx/types";
import { Types as mongooseTypes } from "mongoose";

export interface ISessionCreateInput
  extends Omit<
    databaseTypes.ISession,
    "_id" | "createdAt" | "updatedAt" | "user"
  > {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
}
