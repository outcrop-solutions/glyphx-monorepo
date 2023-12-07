// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IDocumentCreateInput} from 'database/src/mongoose/interfaces';

export class DocumentService {
  public static async getDocument(documentId: string): Promise<databaseTypes.IDocument | null> {
    try {
      const document = await mongoDbConnection.models.DocumentModel.getDocumentById(documentId);
      return document;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the document. See the inner error for additional details',
          'document',
          'getDocument',
          {id: documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getDocuments(filter?: Record<string, unknown>): Promise<databaseTypes.IDocument[] | null> {
    try {
      const documents = await mongoDbConnection.models.DocumentModel.queryDocuments(filter);
      return documents?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting documents. See the inner error for additional details',
          'documents',
          'getDocuments',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createDocument(data: Partial<databaseTypes.IDocument>): Promise<databaseTypes.IDocument> {
    try {
      // create document
      const document = await mongoDbConnection.models.DocumentModel.createDocument(data as IDocumentCreateInput);

      return document;
    } catch (err: any) {
      if (
        err instanceof error.InvalidOperationError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.DataValidationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while creating the document. See the inner error for additional details',
          'document',
          'createDocument',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateDocument(
    documentId: string,
    data: Partial<Omit<databaseTypes.IDocument, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IDocument> {
    try {
      const document = await mongoDbConnection.models.DocumentModel.updateDocumentById(documentId, {
        ...data,
      });
      return document;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateDocument',
          {documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteDocument(documentId: string): Promise<databaseTypes.IDocument> {
    try {
      const document = await mongoDbConnection.models.DocumentModel.updateDocumentById(documentId, {
        deletedAt: new Date(),
      });
      return document;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateDocument',
          {documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addPresences(
    documentId: string,
    presences: (databaseTypes.IPresence | string)[]
  ): Promise<databaseTypes.IDocument> {
    try {
      const updatedDocument = await mongoDbConnection.models.DocumentModel.addPresences(documentId, presences);

      return updatedDocument;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding presences to the document. See the inner error for additional details',
          'document',
          'addPresences',
          {id: documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removePresences(
    documentId: string,
    presences: (databaseTypes.IPresence | string)[]
  ): Promise<databaseTypes.IDocument> {
    try {
      const updatedDocument = await mongoDbConnection.models.DocumentModel.removePresences(documentId, presences);

      return updatedDocument;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  presences from the document. See the inner error for additional details',
          'document',
          'removePresences',
          {id: documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addAnnotations(
    documentId: string,
    annotations: (databaseTypes.IAnnotation | string)[]
  ): Promise<databaseTypes.IDocument> {
    try {
      const updatedDocument = await mongoDbConnection.models.DocumentModel.addAnnotations(documentId, annotations);

      return updatedDocument;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding annotations to the document. See the inner error for additional details',
          'document',
          'addAnnotations',
          {id: documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeAnnotations(
    documentId: string,
    annotations: (databaseTypes.IAnnotation | string)[]
  ): Promise<databaseTypes.IDocument> {
    try {
      const updatedDocument = await mongoDbConnection.models.DocumentModel.removeAnnotations(documentId, annotations);

      return updatedDocument;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  annotations from the document. See the inner error for additional details',
          'document',
          'removeAnnotations',
          {id: documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addThresholds(
    documentId: string,
    thresholds: (databaseTypes.IThreshold | string)[]
  ): Promise<databaseTypes.IDocument> {
    try {
      const updatedDocument = await mongoDbConnection.models.DocumentModel.addThresholds(documentId, thresholds);

      return updatedDocument;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding thresholds to the document. See the inner error for additional details',
          'document',
          'addThresholds',
          {id: documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeThresholds(
    documentId: string,
    thresholds: (databaseTypes.IThreshold | string)[]
  ): Promise<databaseTypes.IDocument> {
    try {
      const updatedDocument = await mongoDbConnection.models.DocumentModel.removeThresholds(documentId, thresholds);

      return updatedDocument;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  thresholds from the document. See the inner error for additional details',
          'document',
          'removeThresholds',
          {id: documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addConfigs(
    documentId: string,
    modelConfigs: (databaseTypes.IModelConfig | string)[]
  ): Promise<databaseTypes.IDocument> {
    try {
      const updatedDocument = await mongoDbConnection.models.DocumentModel.addConfigs(documentId, modelConfigs);

      return updatedDocument;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding modelConfigs to the document. See the inner error for additional details',
          'document',
          'addConfigs',
          {id: documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeConfigs(
    documentId: string,
    modelConfigs: (databaseTypes.IModelConfig | string)[]
  ): Promise<databaseTypes.IDocument> {
    try {
      const updatedDocument = await mongoDbConnection.models.DocumentModel.removeConfigs(documentId, modelConfigs);

      return updatedDocument;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  modelConfigs from the document. See the inner error for additional details',
          'document',
          'removeConfigs',
          {id: documentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
