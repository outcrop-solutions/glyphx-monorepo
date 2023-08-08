import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IAnnotationDocument, IAnnotationCreateInput, IAnnotationStaticMethods, IAnnotationMethods} from '../interfaces';
import { AuthorModel} from './author'

const SCHEMA = new Schema<IAnnotationDocument, IAnnotationStaticMethods, IAnnotationMethods>({
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
  author: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'user'
  },
  value: {
    type: String,
    required: true,
      default: false
      },
  projectId: {
    type: string | ObjectId,
    required: false,
      default: false
      },
  stateId: {
    type: string | ObjectId,
    required: false,
      default: false
      }
})

SCHEMA.static(
  'annotationIdExists',
  async (annotationId: mongooseTypes.ObjectId): Promise<boolean> => {
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
  }
);

SCHEMA.static(
  'allAnnotationIdsExist',
  async (annotationIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await ANNOTATION_MODEL.find({_id: {$in: annotationIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      annotationIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
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
          { annotationIds: annotationIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (
    annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a annotation with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

        if (annotation.author)
          tasks.push(
            idValidator(
              annotation.author._id as mongooseTypes.ObjectId,
              'Author',
              AuthorModel.authorIdExists
            )
          );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (annotation.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: annotation.createdAt}
      );
    if (annotation.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: annotation.updatedAt}
      );
    if ((annotation as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The annotation._id is immutable and cannot be changed',
        {_id: (annotation as Record<string, unknown>)['_id']}
      );
  }
);

SCHEMA.static(
  'createAnnotation',
  async (input: IAnnotationCreateInput): Promise<databaseTypes.IAnnotation> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [ 
        ] = await Promise.all([
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IAnnotationDocument = {
        createdAt: createDate,
        updatedAt: createDate,
          author: input.author,
          value: input.value,
          projectId: input.projectId,
          stateId: input.stateId
      };
      try {
        await ANNOTATION_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IAnnotationDocument',
          resolvedInput,
          err
        );
      }
      const annotationDocument = (
        await ANNOTATION_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = annotationDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the annotation.  See the inner error for additional details',
          'mongoDb',
          'addAnnotation',
          {},
          err
        );
      }
    }
    if (id) return await ANNOTATION_MODEL.getAnnotationById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the annotation may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static('getAnnotationById', async (annotationId: mongooseTypes.ObjectId) => {
  try {
    const annotationDocument = (await ANNOTATION_MODEL.findById(annotationId)
      .populate('author')
      .lean()) as databaseTypes.IAnnotation;
    if (!annotationDocument) {
      throw new error.DataNotFoundError(
        `Could not find a annotation with the _id: ${ annotationId}`,
        'annotation_id',
        annotationId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (annotationDocument as any)['__v'];

    delete (annotationDocument as any).author?.['__v'];

    return annotationDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getAnnotationById',
        err
      );
  }
});

SCHEMA.static(
  'updateAnnotationWithFilter',
  async (
    filter: Record<string, unknown>,
    annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>
  ): Promise<void> => {
    try {
      await ANNOTATION_MODEL.validateUpdateObject(annotation);
      const updateDate = new Date();
      const transformedObject: Partial<IAnnotationDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in annotation) {
        const value = (annotation as Record<string, any>)[key];
          if (key === 'author')
            transformedObject.author =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await ANNOTATION_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No annotation document with filter: ${filter} was found',
          'filter',
          filter
        );
      }
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      )
        throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update annotation',
          {filter: filter, annotation : annotation },
          err
        );
    }
  }
);

SCHEMA.static(
  'queryAnnotations',
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

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      annotationDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      delete (doc as any).author?.['__v'];
      });

      const retval: IQueryResult<databaseTypes.IAnnotation> = {
        results: annotationDocuments,
        numberOfItems: count,
        page: page,
        itemsPerPage: itemsPerPage,
      };

      return retval;
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while getting the annotations.  See the inner error for additional information',
          'mongoDb',
          'queryAnnotations',
          err
        );
    }
  }
);

SCHEMA.static(
  'deleteAnnotationById',
  async (annotationId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await ANNOTATION_MODEL.deleteOne({_id: annotationId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A annotation with a _id: ${ annotationId} was not found in the database`,
          '_id',
          annotationId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the annotation from the database. The annotation may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete annotation',
          {_id: annotationId},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateAnnotationById',
  async (
    annotationId: mongooseTypes.ObjectId,
    annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>
  ): Promise<databaseTypes.IAnnotation> => {
    await ANNOTATION_MODEL.updateAnnotationWithFilter({_id: annotationId}, annotation);
    return await ANNOTATION_MODEL.getAnnotationById(annotationId);
  }
);





// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['annotation'];

const ANNOTATION_MODEL = model<IAnnotationDocument, IAnnotationStaticMethods>(
  'annotation',
  SCHEMA
);

export { ANNOTATION_MODEL as AnnotationModel };
;
