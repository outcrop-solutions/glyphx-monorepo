import { database as databaseTypes } from "@glyphx/types";
import { Types as mongooseTypes } from "mongoose";

export interface IUseragentCreateInput
  extends Omit<databaseTypes.IUseragent, "_id" | "createdAt" | "updatedAt"> {}
