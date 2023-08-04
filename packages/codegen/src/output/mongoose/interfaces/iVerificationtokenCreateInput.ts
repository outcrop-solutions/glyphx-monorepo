import { database as databaseTypes } from "@glyphx/types";
import { Types as mongooseTypes } from "mongoose";

export interface IVerificationtokenCreateInput
  extends Omit<
    databaseTypes.IVerificationtoken,
    "_id" | "createdAt" | "updatedAt"
  > {}
