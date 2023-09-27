import {databaseTypes, IQueryResult} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {IAnnotationMethods, IAnnotationStaticMethods, IAnnotationDocument, IAnnotationCreateInput} from '../interfaces';
import {error} from 'core';
import {UserModel} from './user';
import {ProjectModel} from './project';
import {StateModel} from './state';
import {DBFormatter} from '../../lib/format';

const SCHEMA = new Schema<IAnnotationDocument, IAnnotationStaticMethods, IAnnotationMethods>({
  createdAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  deletedAt: {type: Date, required: false},
  updatedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  value: {type: String, required: false},
  author: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  projectId: {type: Schema.Types.ObjectId, required: false},
  stateId: {type: Schema.Types.ObjectId, required: false},
});

SCHEMA.static('annotationIdExists', async (annotationId: mongooseTypes.ObjectId): Promise<boolean> => {
  let retval = false;
  try {
    const result = await ANNOTATION_MODEL.findById(annotationId, ['_id']);
    if (result) retval = true;
  } catch (err) {
    throw new error.DatabaseOperationError(
      'an unexpected error occurred while trying to find the annotation.  See the inner error for additional information',
      'mongoDb',
      'annotationIdExists',
      {_id: annotationId},
      err
    );
  }
  return retval;
});

SCHEMA.static('allAnnotationIdsExist', async (annotationIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await ANNOTATION_MODEL.find({_id: {$in: annotationIds}}, ['_id'])) as {
      _id: mongooseTypes.ObjectId;
    }[];

    annotationIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
    });

    if (notFoundIds.length) {
      throw new error.DataNotFoundError(
        'One or more annotationIds cannot be found in the database.',
        'annotation._id',
        notFoundIds
      );
    }
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the annotationIds.  See the inner error for additional information',
        'mongoDb',
        'allAnnotationIdsExists',
        {annotationIds: annotationIds},
        err
      );
    }
  }
  return true;
});

SCHEMA.static('getAnnotationById', async (annotationId: string) => {
  try {
    const annotationDocument = (await ANNOTATION_MODEL.findById(annotationId)
      .populate('author')
      .lean()) as databaseTypes.IAnnotation;
    if (!annotationDocument) {
      throw new error.DataNotFoundError(
        `Could not find a annotation with the _id: ${annotationId}`,
        'annotation_id',
        annotationId
      );
    }

    const format = new DBFormatter();
    return format.toJS(annotationDocument);
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the annotation.  See the inner error for additional information',
        'mongoDb',
        'getAnnotationById',
        err
      );
  }
});

SCHEMA.static(
  'queryAnnotations',
  //istanbul ignore next
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await ANNOTATION_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find annotations with the filter: ${filter}`,
          'queryAnnotations',
          filter
        );
      }

      const skip = itemsPerPage * page;
      if (skip > count) {
        throw new error.InvalidArgumentError(
          `The page number supplied: ${page} exceeds the number of pages contained in the reults defined by the filter: ${Math.floor(
            count / itemsPerPage
          )}`,
          'page',
          page
        );
      }

      const annotationDocuments = (await ANNOTATION_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('author')
        .lean()) as databaseTypes.IAnnotation[];

      const format = new DBFormatter();
      const formattedAnnotations = annotationDocuments?.map((doc: any) => {
        return format.toJS(doc);
      });

      const retval: IQueryResult<databaseTypes.IAnnotation> = {
        results: formattedAnnotations as unknown as databaseTypes.IAnnotation[],
        numberOfItems: count,
        page: page,
        itemsPerPage: itemsPerPage,
      };

      return retval;
    } catch (err) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while querying the annotations.  See the inner error for additional information',
          'mongoDb',
          'queryProjectTemplates',
          err
        );
    }
  }
);

SCHEMA.static('createAnnotation', async (input: IAnnotationCreateInput): Promise<databaseTypes.IAnnotation> => {
  const userId =
    input.author instanceof mongooseTypes.ObjectId
      ? input.author
      : // @ts-ignore
        new mongooseTypes.ObjectId(input.author._id);

  const userExists = await UserModel.userIdExists(userId);
  if (!userExists)
    throw new error.InvalidArgumentError(
      `A user with _id : ${userId} cannot be found`,
      'user._id',
      (input.author as databaseTypes.IUser)._id
    );

  let projectId;
  //istanbul ignore else
  if (input.projectId) {
    projectId =
      input.projectId instanceof mongooseTypes.ObjectId
        ? input.projectId
        : // @ts-ignore
          new mongooseTypes.ObjectId(input.projectId);

    const projectExists = await ProjectModel.projectIdExists(projectId);
    if (!projectExists)
      throw new error.InvalidArgumentError(
        `A project with _id : ${projectId} cannot be found`,
        'project._id',
        input.projectId
      );
  }

  let stateId;
  //istanbul ignore else
  if (input.stateId) {
    stateId =
      input.stateId instanceof mongooseTypes.ObjectId
        ? input.stateId
        : // @ts-ignore
          new mongooseTypes.ObjectId(input.stateId);

    const stateExists = await StateModel.stateIdExists(stateId);
    if (!stateExists)
      throw new error.InvalidArgumentError(`A state with _id : ${stateId} cannot be found`, 'state._id', input.stateId);
  }

  const createDate = new Date();

  const transformedDocument: IAnnotationDocument = {
    createdAt: createDate,
    updatedAt: createDate,
    author: userId,
    value: input.value,
    stateId: input.stateId,
    projectId: input?.projectId,
  };

  try {
    await ANNOTATION_MODEL.validate(transformedDocument);
  } catch (err) {
    throw new error.DataValidationError(
      'An error occurred while validating the annotation document.  See the inner error for additional details.',
      'annotation',
      transformedDocument,
      err
    );
  }

  try {
    const createdDocument = (
      await ANNOTATION_MODEL.create([transformedDocument], {
        validateBeforeSave: false,
      })
    )[0];
    return await ANNOTATION_MODEL.getAnnotationById(createdDocument._id.toString());
  } catch (err) {
    throw new error.DatabaseOperationError(
      'An unexpected error occurred wile creating the annotation. See the inner error for additional information',
      'mongoDb',
      'create annotation',
      input,
      err
    );
  }
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['annotation'];

const ANNOTATION_MODEL = model<IAnnotationDocument, IAnnotationStaticMethods>('annotation', SCHEMA);

export {ANNOTATION_MODEL as AnnotationModel};
