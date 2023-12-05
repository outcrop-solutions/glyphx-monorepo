// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, databaseTypes} from 'types';
import {DBFormatter} from '../../lib/format';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from 'core';
import {IDocumentDocument, IDocumentCreateInput, IDocumentStaticMethods, IDocumentMethods} from '../interfaces';
import {PresenceModel} from './presence';
import {AnnotationModel} from './annotation';
import {ThresholdModel} from './threshold';
import {ModelConfigModel} from './modelConfig';

const SCHEMA = new Schema<IDocumentDocument, IDocumentStaticMethods, IDocumentMethods>({
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
  presence: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'presence',
    },
  ],
  annotations: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'annotations',
    },
  ],
  thresholds: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'thresholds',
    },
  ],
  configs: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'configs',
    },
  ],
});

SCHEMA.static('documentIdExists', async (documentId: mongooseTypes.ObjectId): Promise<boolean> => {
  let retval = false;
  try {
    const result = await DOCUMENT_MODEL.findById(documentId, ['_id']);
    if (result) retval = true;
  } catch (err) {
    throw new error.DatabaseOperationError(
      'an unexpected error occurred while trying to find the document.  See the inner error for additional information',
      'mongoDb',
      'documentIdExists',
      {_id: documentId},
      err
    );
  }
  return retval;
});

SCHEMA.static('allDocumentIdsExist', async (documentIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await DOCUMENT_MODEL.find({_id: {$in: documentIds}}, ['_id'])) as {_id: mongooseTypes.ObjectId}[];

    documentIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
    });

    if (notFoundIds.length) {
      throw new error.DataNotFoundError(
        'One or more documentIds cannot be found in the database.',
        'document._id',
        notFoundIds
      );
    }
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the documentIds.  See the inner error for additional information',
        'mongoDb',
        'allDocumentIdsExists',
        {documentIds: documentIds},
        err
      );
    }
  }
  return true;
});

SCHEMA.static(
  'validateUpdateObject',
  async (document: Omit<Partial<databaseTypes.IDocument>, '_id'>): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a document with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (document.createdAt)
      throw new error.InvalidOperationError('The createdAt date is set internally and cannot be altered externally', {
        createdAt: document.createdAt,
      });
    if (document.updatedAt)
      throw new error.InvalidOperationError('The updatedAt date is set internally and cannot be altered externally', {
        updatedAt: document.updatedAt,
      });
    if ((document as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError('The document._id is immutable and cannot be changed', {
        _id: (document as Record<string, unknown>)['_id'],
      });
  }
);

// CREATE
SCHEMA.static('createDocument', async (input: IDocumentCreateInput): Promise<databaseTypes.IDocument> => {
  let id: undefined | mongooseTypes.ObjectId = undefined;

  try {
    const [presence, annotations, thresholds, configs] = await Promise.all([
      DOCUMENT_MODEL.validatePresences(input.presence ?? []),
      DOCUMENT_MODEL.validateAnnotations(input.annotations ?? []),
      DOCUMENT_MODEL.validateThresholds(input.thresholds ?? []),
      DOCUMENT_MODEL.validateConfigs(input.configs ?? []),
    ]);

    const createDate = new Date();

    //istanbul ignore next
    const resolvedInput: IDocumentDocument = {
      createdAt: createDate,
      updatedAt: createDate,
      id: input.id,
      presence: presence,
      annotations: annotations,
      thresholds: thresholds,
      configs: configs,
    };
    try {
      await DOCUMENT_MODEL.validate(resolvedInput);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the document before creating it.  See the inner error for additional information',
        'IDocumentDocument',
        resolvedInput,
        err
      );
    }
    const documentDocument = (await DOCUMENT_MODEL.create([resolvedInput], {validateBeforeSave: false}))[0];
    id = documentDocument._id;
  } catch (err) {
    if (err instanceof error.DataValidationError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'An Unexpected Error occurred while adding the document.  See the inner error for additional details',
        'mongoDb',
        'addDocument',
        {},
        err
      );
    }
  }
  if (id) return await DOCUMENT_MODEL.getDocumentById(id.toString());
  else
    throw new error.UnexpectedError(
      'An unexpected error has occurred and the document may not have been created.  I have no other information to provide.'
    );
});

// READ
SCHEMA.static('getDocumentById', async (documentId: string) => {
  try {
    const documentDocument = (await DOCUMENT_MODEL.findById(documentId)
      .populate('presence')
      .populate('annotations')
      .populate('thresholds')
      .populate('configs')
      .lean()) as databaseTypes.IDocument;
    if (!documentDocument) {
      throw new error.DataNotFoundError(
        `Could not find a document with the _id: ${documentId}`,
        'document_id',
        documentId
      );
    }
    const format = new DBFormatter();
    return format.toJS(documentDocument);
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getDocumentById',
        err
      );
  }
});

SCHEMA.static('queryDocuments', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await DOCUMENT_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(
        `Could not find documents with the filter: ${filter}`,
        'queryDocuments',
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

    const documentDocuments = (await DOCUMENT_MODEL.find(filter, null, {
      skip: skip,
      limit: itemsPerPage,
    })
      .populate('presence')
      .populate('annotations')
      .populate('thresholds')
      .populate('configs')
      .lean()) as databaseTypes.IDocument[];

    const format = new DBFormatter();
    const documents = documentDocuments?.map((doc: any) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.IDocument> = {
      results: documents as unknown as databaseTypes.IDocument[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the documents.  See the inner error for additional information',
        'mongoDb',
        'queryDocuments',
        err
      );
  }
});

// UPDATE
SCHEMA.static(
  'updateDocumentWithFilter',
  async (filter: Record<string, unknown>, document: Omit<Partial<databaseTypes.IDocument>, '_id'>): Promise<void> => {
    try {
      await DOCUMENT_MODEL.validateUpdateObject(document);
      const updateDate = new Date();
      const transformedObject: Partial<IDocumentDocument> & Record<string, unknown> = {updatedAt: updateDate};
      const updateResult = await DOCUMENT_MODEL.updateOne(filter, transformedObject);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError('No document document with filter: ${filter} was found', 'filter', filter);
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update document',
          {filter: filter, document: document},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateDocumentById',
  async (
    documentId: string,
    document: Omit<Partial<databaseTypes.IDocument>, '_id'>
  ): Promise<databaseTypes.IDocument> => {
    await DOCUMENT_MODEL.updateDocumentWithFilter({_id: documentId}, document);
    return await DOCUMENT_MODEL.getDocumentById(documentId);
  }
);

// DELETE
SCHEMA.static('deleteDocumentById', async (documentId: string): Promise<void> => {
  try {
    const results = await DOCUMENT_MODEL.deleteOne({_id: documentId});
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `A document with a _id: ${documentId} was not found in the database`,
        '_id',
        documentId
      );
  } catch (err) {
    if (err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while deleteing the document from the database. The document may still exist.  See the inner error for additional information',
        'mongoDb',
        'delete document',
        {_id: documentId},
        err
      );
  }
});

SCHEMA.static(
  'addPresences',
  async (documentId: string, presences: (databaseTypes.IPresence | string)[]): Promise<databaseTypes.IDocument> => {
    try {
      if (!presences.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'presences', presences);
      const documentDocument = await DOCUMENT_MODEL.findById(documentId);
      if (!documentDocument)
        throw new error.DataNotFoundError('A documentDocument with _id cannot be found', 'document._id', documentId);

      const reconciledIds = await DOCUMENT_MODEL.validatePresences(presences);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (!documentDocument.presence.find((id: any) => id.toString() === p.toString())) {
          dirty = true;
          // @ts-ignore
          documentDocument.presence.push(p as unknown as databaseTypes.IPresence);
        }
      });

      if (dirty) await documentDocument.save();

      return await DOCUMENT_MODEL.getDocumentById(documentId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the Presences. See the inner error for additional information',
          'mongoDb',
          'document.addPresences',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removePresences',
  async (documentId: string, presences: (databaseTypes.IPresence | string)[]): Promise<databaseTypes.IDocument> => {
    try {
      if (!presences.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'presences', presences);
      const documentDocument = await DOCUMENT_MODEL.findById(documentId);
      if (!documentDocument) throw new error.DataNotFoundError('A Document cannot be found', '._id', documentId);

      const reconciledIds = presences.map((i: any) =>
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
      const updatedPresences = documentDocument.presences.filter((p: any) => {
        let retval = true;
        if (reconciledIds.find((r: any) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        // @ts-ignore
        documentDocument.presences = updatedPresences as unknown as databaseTypes.IPresence[];
        await documentDocument.save();
      }

      return await DOCUMENT_MODEL.getDocumentById(documentId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'document.removePresences',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validatePresences',
  async (presences: (databaseTypes.IPresence | string)[]): Promise<mongooseTypes.ObjectId[]> => {
    const presencesIds: mongooseTypes.ObjectId[] = [];
    presences.forEach((p: any) => {
      if (typeof p === 'string') presencesIds.push(new mongooseTypes.ObjectId(p));
      else presencesIds.push(new mongooseTypes.ObjectId(p.id));
    });
    try {
      await PresenceModel.allPresenceIdsExist(presencesIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'presences',
          presences,
          err
        );
      else throw err;
    }

    return presencesIds;
  }
);
SCHEMA.static(
  'addAnnotations',
  async (documentId: string, annotations: (databaseTypes.IAnnotation | string)[]): Promise<databaseTypes.IDocument> => {
    try {
      if (!annotations.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'annotations', annotations);
      const documentDocument = await DOCUMENT_MODEL.findById(documentId);
      if (!documentDocument)
        throw new error.DataNotFoundError('A documentDocument with _id cannot be found', 'document._id', documentId);

      const reconciledIds = await DOCUMENT_MODEL.validateAnnotations(annotations);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (!documentDocument.annotations.find((id: any) => id.toString() === p.toString())) {
          dirty = true;
          // @ts-ignore
          documentDocument.annotations.push(p as unknown as databaseTypes.IAnnotation);
        }
      });

      if (dirty) await documentDocument.save();

      return await DOCUMENT_MODEL.getDocumentById(documentId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the Annotations. See the inner error for additional information',
          'mongoDb',
          'document.addAnnotations',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeAnnotations',
  async (documentId: string, annotations: (databaseTypes.IAnnotation | string)[]): Promise<databaseTypes.IDocument> => {
    try {
      if (!annotations.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'annotations', annotations);
      const documentDocument = await DOCUMENT_MODEL.findById(documentId);
      if (!documentDocument) throw new error.DataNotFoundError('A Document cannot be found', '._id', documentId);

      const reconciledIds = annotations.map((i: any) =>
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
      const updatedAnnotations = documentDocument.annotations.filter((p: any) => {
        let retval = true;
        if (reconciledIds.find((r: any) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        // @ts-ignore
        documentDocument.annotations = updatedAnnotations as unknown as databaseTypes.IAnnotation[];
        await documentDocument.save();
      }

      return await DOCUMENT_MODEL.getDocumentById(documentId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'document.removeAnnotations',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateAnnotations',
  async (annotations: (databaseTypes.IAnnotation | string)[]): Promise<mongooseTypes.ObjectId[]> => {
    const annotationsIds: mongooseTypes.ObjectId[] = [];
    annotations.forEach((p: any) => {
      if (typeof p === 'string') annotationsIds.push(new mongooseTypes.ObjectId(p));
      else annotationsIds.push(new mongooseTypes.ObjectId(p.id));
    });
    try {
      await AnnotationModel.allAnnotationIdsExist(annotationsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'annotations',
          annotations,
          err
        );
      else throw err;
    }

    return annotationsIds;
  }
);
SCHEMA.static(
  'addThresholds',
  async (documentId: string, thresholds: (databaseTypes.IThreshold | string)[]): Promise<databaseTypes.IDocument> => {
    try {
      if (!thresholds.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'thresholds', thresholds);
      const documentDocument = await DOCUMENT_MODEL.findById(documentId);
      if (!documentDocument)
        throw new error.DataNotFoundError('A documentDocument with _id cannot be found', 'document._id', documentId);

      const reconciledIds = await DOCUMENT_MODEL.validateThresholds(thresholds);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (!documentDocument.thresholds.find((id: any) => id.toString() === p.toString())) {
          dirty = true;
          // @ts-ignore
          documentDocument.thresholds.push(p as unknown as databaseTypes.IThreshold);
        }
      });

      if (dirty) await documentDocument.save();

      return await DOCUMENT_MODEL.getDocumentById(documentId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the Thresholds. See the inner error for additional information',
          'mongoDb',
          'document.addThresholds',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeThresholds',
  async (documentId: string, thresholds: (databaseTypes.IThreshold | string)[]): Promise<databaseTypes.IDocument> => {
    try {
      if (!thresholds.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'thresholds', thresholds);
      const documentDocument = await DOCUMENT_MODEL.findById(documentId);
      if (!documentDocument) throw new error.DataNotFoundError('A Document cannot be found', '._id', documentId);

      const reconciledIds = thresholds.map((i: any) =>
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
      const updatedThresholds = documentDocument.thresholds.filter((p: any) => {
        let retval = true;
        if (reconciledIds.find((r: any) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        // @ts-ignore
        documentDocument.thresholds = updatedThresholds as unknown as databaseTypes.IThreshold[];
        await documentDocument.save();
      }

      return await DOCUMENT_MODEL.getDocumentById(documentId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'document.removeThresholds',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateThresholds',
  async (thresholds: (databaseTypes.IThreshold | string)[]): Promise<mongooseTypes.ObjectId[]> => {
    const thresholdsIds: mongooseTypes.ObjectId[] = [];
    thresholds.forEach((p: any) => {
      if (typeof p === 'string') thresholdsIds.push(new mongooseTypes.ObjectId(p));
      else thresholdsIds.push(new mongooseTypes.ObjectId(p.id));
    });
    try {
      await ThresholdModel.allThresholdIdsExist(thresholdsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'thresholds',
          thresholds,
          err
        );
      else throw err;
    }

    return thresholdsIds;
  }
);
SCHEMA.static(
  'addConfigs',
  async (
    documentId: string,
    modelConfigs: (databaseTypes.IModelConfig | string)[]
  ): Promise<databaseTypes.IDocument> => {
    try {
      if (!modelConfigs.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'modelConfigs', modelConfigs);
      const documentDocument = await DOCUMENT_MODEL.findById(documentId);
      if (!documentDocument)
        throw new error.DataNotFoundError('A documentDocument with _id cannot be found', 'document._id', documentId);

      const reconciledIds = await DOCUMENT_MODEL.validateConfigs(modelConfigs);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (!documentDocument.configs.find((id: any) => id.toString() === p.toString())) {
          dirty = true;
          // @ts-ignore
          documentDocument.configs.push(p as unknown as databaseTypes.IModelConfig);
        }
      });

      if (dirty) await documentDocument.save();

      return await DOCUMENT_MODEL.getDocumentById(documentId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the ModelConfigs. See the inner error for additional information',
          'mongoDb',
          'document.addModelConfigs',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeConfigs',
  async (
    documentId: string,
    modelConfigs: (databaseTypes.IModelConfig | string)[]
  ): Promise<databaseTypes.IDocument> => {
    try {
      if (!modelConfigs.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'modelConfigs', modelConfigs);
      const documentDocument = await DOCUMENT_MODEL.findById(documentId);
      if (!documentDocument) throw new error.DataNotFoundError('A Document cannot be found', '._id', documentId);

      const reconciledIds = modelConfigs.map((i: any) =>
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
      const updatedModelConfigs = documentDocument.modelConfigs.filter((p: any) => {
        let retval = true;
        if (reconciledIds.find((r: any) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        // @ts-ignore
        documentDocument.modelConfigs = updatedModelConfigs as unknown as databaseTypes.IModelConfig[];
        await documentDocument.save();
      }

      return await DOCUMENT_MODEL.getDocumentById(documentId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'document.removeModelConfigs',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateConfigs',
  async (modelConfigs: (databaseTypes.IModelConfig | string)[]): Promise<mongooseTypes.ObjectId[]> => {
    const modelConfigsIds: mongooseTypes.ObjectId[] = [];
    modelConfigs.forEach((p: any) => {
      if (typeof p === 'string') modelConfigsIds.push(new mongooseTypes.ObjectId(p));
      else modelConfigsIds.push(new mongooseTypes.ObjectId(p.id));
    });
    try {
      await ModelConfigModel.allModelConfigIdsExist(modelConfigsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'modelConfigs',
          modelConfigs,
          err
        );
      else throw err;
    }

    return modelConfigsIds;
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['document'];

const DOCUMENT_MODEL = model<IDocumentDocument, IDocumentStaticMethods>('document', SCHEMA);

export {DOCUMENT_MODEL as DocumentModel};
