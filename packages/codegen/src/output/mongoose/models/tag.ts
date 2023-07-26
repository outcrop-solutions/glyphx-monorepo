import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {ITagDocument, ITagStaticMethods, ITagMethods} from '../interfaces';

const SCHEMA = new Schema<ITagDocument, ITagStaticMethods, ITagMethods>({
  createdAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  deletedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  createdAt: { type:
  Date, 
  required: false,
  
  },
  updatedAt: { type:
  Date, 
  required: false,
  
  },
  workspaces: { type:
  IWorkspace[], 
  required: false,
  
  },
  templates: { type:
  IProjectTemplate[], 
  required: false,
  
  },
  projects: { type:
  IProject[], 
  required: false,
  
  },
  value: { type:
  string, 
  required: false,
  
  },
})



export default mongoose.model('Tag', SCHEMA);
