// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, databaseTypes} from 'types';
import {DBFormatter} from '../../lib/format';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from 'core';
import {IAnnotationDocument, IAnnotationCreateInput, IAnnotationStaticMethods, IAnnotationMethods} from '../interfaces';
import {UserModel} from './user';
import {StateModel} from './state';

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
  id: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'user',
  },
  state: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'state',
  },
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

SCHEMA.static(
  'validateUpdateObject',
  async (annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>): Promise<void> => {
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
      tasks.push(idValidator(annotation.author._id as mongooseTypes.ObjectId, 'User', UserModel.userIdExists));
    if (annotation.state)
      tasks.push(idValidator(annotation.state._id as mongooseTypes.ObjectId, 'State', StateModel.stateIdExists));

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (annotation.createdAt)
      throw new error.InvalidOperationError('The createdAt date is set internally and cannot be altered externally', {
        createdAt: annotation.createdAt,
      });
    if (annotation.updatedAt)
      throw new error.InvalidOperationError('The updatedAt date is set internally and cannot be altered externally', {
        updatedAt: annotation.updatedAt,
      });
    if ((annotation as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError('The annotation._id is immutable and cannot be changed', {
        _id: (annotation as Record<string, unknown>)['_id'],
      });
  }
);

// CREATE
SCHEMA.static('createAnnotation', async (input: IAnnotationCreateInput): Promise<databaseTypes.IAnnotation> => {
  let id: undefined | mongooseTypes.ObjectId = undefined;

  try {
    const [author, state] = await Promise.all([
      ANNOTATION_MODEL.validateAuthor(input.author),
      ANNOTATION_MODEL.validateState(input.state),
    ]);

    const createDate = new Date();

    //istanbul ignore next
    const resolvedInput: IAnnotationDocument = {
      createdAt: createDate,
      updatedAt: createDate,
      id: input.id,
      content: input.content,
      author: author,
      state: state,
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
    const annotationDocument = (await ANNOTATION_MODEL.create([resolvedInput], {validateBeforeSave: false}))[0];
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
  if (id) return await ANNOTATION_MODEL.getAnnotationById(id.toString());
  else
    throw new error.UnexpectedError(
      'An unexpected error has occurred and the annotation may not have been created.  I have no other information to provide.'
    );
});

// READ
SCHEMA.static('getAnnotationById', async (annotationId: string) => {
  try {
    const annotationDocument = (await ANNOTATION_MODEL.findById(annotationId)
      .populate('author')
      .populate('state')
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
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getAnnotationById',
        err
      );
  }
});

SCHEMA.static('queryAnnotations', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
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
      .populate('state')
      .lean()) as databaseTypes.IAnnotation[];

    const format = new DBFormatter();
    const annotations = annotationDocuments?.map((doc: any) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.IAnnotation> = {
      results: annotations as unknown as databaseTypes.IAnnotation[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the annotations.  See the inner error for additional information',
        'mongoDb',
        'queryAnnotations',
        err
      );
  }
});

// UPDATE
SCHEMA.static(
  'updateAnnotationWithFilter',
  async (
    filter: Record<string, unknown>,
    annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>
  ): Promise<void> => {
    try {
      await ANNOTATION_MODEL.validateUpdateObject(annotation);
      const updateDate = new Date();
      const transformedObject: Partial<IAnnotationDocument> & Record<string, unknown> = {updatedAt: updateDate};
      for (const key in annotation) {
        const value = (annotation as Record<string, any>)[key];
        if (key === 'author')
          transformedObject.author =
            value instanceof mongooseTypes.ObjectId ? value : (value._id as mongooseTypes.ObjectId);
        if (key === 'state')
          transformedObject.state =
            value instanceof mongooseTypes.ObjectId ? value : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await ANNOTATION_MODEL.updateOne(filter, transformedObject);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No annotation document with filter: ${filter} was found',
          'filter',
          filter
        );
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update annotation',
          {filter: filter, annotation: annotation},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateAnnotationById',
  async (
    annotationId: string,
    annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>
  ): Promise<databaseTypes.IAnnotation> => {
    await ANNOTATION_MODEL.updateAnnotationWithFilter({_id: annotationId}, annotation);
    return await ANNOTATION_MODEL.getAnnotationById(annotationId);
  }
);

// DELETE
SCHEMA.static('deleteAnnotationById', async (annotationId: string): Promise<void> => {
  try {
    const results = await ANNOTATION_MODEL.deleteOne({_id: annotationId});
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `A annotation with a _id: ${annotationId} was not found in the database`,
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
});

SCHEMA.static(
  'addAuthor',
  async (annotationId: string, author: databaseTypes.IUser | string): Promise<databaseTypes.IAnnotation> => {
    try {
      if (!author) throw new error.InvalidArgumentError('You must supply at least one id', 'author', author);
      const annotationDocument = await ANNOTATION_MODEL.findById(annotationId);

      if (!annotationDocument)
        throw new error.DataNotFoundError(
          'A annotationDocument with _id cannot be found',
          'annotation._id',
          annotationId
        );

      const reconciledId = await ANNOTATION_MODEL.validateAuthor(author);

      if (annotationDocument.author?.toString() !== reconciledId.toString()) {
        const reconciledId = await ANNOTATION_MODEL.validateAuthor(author);

        // @ts-ignore
        annotationDocument.author = reconciledId;
        await annotationDocument.save();
      }

      return await ANNOTATION_MODEL.getAnnotationById(annotationId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the author. See the inner error for additional information',
          'mongoDb',
          'annotation.addAuthor',
          err
        );
      }
    }
  }
);

SCHEMA.static('removeAuthor', async (annotationId: string): Promise<databaseTypes.IAnnotation> => {
  try {
    const annotationDocument = await ANNOTATION_MODEL.findById(annotationId);
    if (!annotationDocument)
      throw new error.DataNotFoundError(
        'A annotationDocument with _id cannot be found',
        'annotation._id',
        annotationId
      );

    // @ts-ignore
    annotationDocument.author = undefined;
    await annotationDocument.save();

    return await ANNOTATION_MODEL.getAnnotationById(annotationId);
  } catch (err) {
    if (
      err instanceof error.DataNotFoundError ||
      err instanceof error.DataValidationError ||
      err instanceof error.InvalidArgumentError
    )
      throw err;
    else {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while removing the author. See the inner error for additional information',
        'mongoDb',
        'annotation.removeAuthor',
        err
      );
    }
  }
});

SCHEMA.static('validateAuthor', async (input: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId> => {
  const authorId = typeof input === 'string' ? new mongooseTypes.ObjectId(input) : new mongooseTypes.ObjectId(input.id);

  if (!(await UserModel.userIdExists(authorId))) {
    throw new error.InvalidArgumentError(`The author: ${authorId} does not exist`, 'authorId', authorId);
  }
  return authorId;
});

SCHEMA.static(
  'addState',
  async (annotationId: string, state: databaseTypes.IState | string): Promise<databaseTypes.IAnnotation> => {
    try {
      if (!state) throw new error.InvalidArgumentError('You must supply at least one id', 'state', state);
      const annotationDocument = await ANNOTATION_MODEL.findById(annotationId);

      if (!annotationDocument)
        throw new error.DataNotFoundError(
          'A annotationDocument with _id cannot be found',
          'annotation._id',
          annotationId
        );

      const reconciledId = await ANNOTATION_MODEL.validateState(state);

      if (annotationDocument.state?.toString() !== reconciledId.toString()) {
        const reconciledId = await ANNOTATION_MODEL.validateState(state);

        // @ts-ignore
        annotationDocument.state = reconciledId;
        await annotationDocument.save();
      }

      return await ANNOTATION_MODEL.getAnnotationById(annotationId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the state. See the inner error for additional information',
          'mongoDb',
          'annotation.addState',
          err
        );
      }
    }
  }
);

SCHEMA.static('removeState', async (annotationId: string): Promise<databaseTypes.IAnnotation> => {
  try {
    const annotationDocument = await ANNOTATION_MODEL.findById(annotationId);
    if (!annotationDocument)
      throw new error.DataNotFoundError(
        'A annotationDocument with _id cannot be found',
        'annotation._id',
        annotationId
      );

    // @ts-ignore
    annotationDocument.state = undefined;
    await annotationDocument.save();

    return await ANNOTATION_MODEL.getAnnotationById(annotationId);
  } catch (err) {
    if (
      err instanceof error.DataNotFoundError ||
      err instanceof error.DataValidationError ||
      err instanceof error.InvalidArgumentError
    )
      throw err;
    else {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while removing the state. See the inner error for additional information',
        'mongoDb',
        'annotation.removeState',
        err
      );
    }
  }
});

SCHEMA.static('validateState', async (input: databaseTypes.IState | string): Promise<mongooseTypes.ObjectId> => {
  const stateId = typeof input === 'string' ? new mongooseTypes.ObjectId(input) : new mongooseTypes.ObjectId(input.id);

  if (!(await StateModel.stateIdExists(stateId))) {
    throw new error.InvalidArgumentError(`The state: ${stateId} does not exist`, 'stateId', stateId);
  }
  return stateId;
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['annotation'];

const ANNOTATION_MODEL = model<IAnnotationDocument, IAnnotationStaticMethods>('annotation', SCHEMA);

export {ANNOTATION_MODEL as AnnotationModel};
