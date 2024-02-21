'use server';
import {error, constants} from 'core';
import {databaseTypes} from 'types';
import {modelConfigService} from '../services';
import {revalidatePath} from 'next/cache';
import {getServerSession} from 'next-auth';
import {authOptions} from 'auth';

/**
 * Create Default Config
 * @param config
 * @returns
 */
export const createConfig = async (config: Omit<databaseTypes.IModelConfig, 'createdAt' | 'updatedAt'>) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      await modelConfigService.createModelConfig(config as databaseTypes.IModelConfig);
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred creating the model config', 'config', config, err);
    e.publish('config', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Get Configs
 * @returns
 */
export const getConfigs = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      return await modelConfigService.getModelConfigs({deletedAt: undefined});
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred getting the model configs', 'config', null, err);
    e.publish('config', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Get Config
 * @param configId
 */
export const getConfig = async (configId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      return await modelConfigService.getModelConfig(configId as string);
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred getting the model config', 'configId', configId, err);
    e.publish('config', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Update Config
 * @param configId
 * @param config
 */
export const updateConfig = async (configId: string, config: databaseTypes.IModelConfig) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      await modelConfigService.updateModelConfig(configId as string, config);
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred updating the model config',
      'configId',
      configId,
      err
    );
    e.publish('config', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

const ALLOW_DELETE = true;

/**
 * Delete Config
 * @param configId
 * @returns
 */
export const deleteConfig = async (configId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session && ALLOW_DELETE) {
      await modelConfigService.deleteModelConfig(configId as string);
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred deleting the model config',
      'configId',
      configId,
      err
    );
    e.publish('config', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};
