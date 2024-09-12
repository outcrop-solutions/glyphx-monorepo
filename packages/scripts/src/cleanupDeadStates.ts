import {MongoDbConnection} from 'database';
import {databaseTypes} from 'types';

async function main() {
  const db = new MongoDbConnection();
  await db.init();

  // get the soft-deleted states
  const states = (await db.models.StateModel.find({
    deletedAt: {$ne: null},
  })
    .select('properties fileSystem imageHash payloadHash fileSystemHash project workspace') // Ensure these fields are included
    .populate('project') // Populate references if needed
    .populate('workspace') // Populate references if needed
    .lean()) as databaseTypes.IState[]; // Cast to IState[]

  const errors: string[] = [];
  await Promise.all(
    states.map(async (state) => {
      try {
        // ids
        const stateId = state?._id?.toString();
        const workspaceId = state?.workspace?._id?.toString();
        const projectId = state?.project?._id?.toString();

        const project = await db.models.ProjectModel.findById(projectId).select('imageHash');

        // remove state from the project
        if (projectId && stateId) {
          await db.models.ProjectModel.removeStates(projectId, [stateId]);
        }
        // remove state from workpace
        if (workspaceId && stateId) {
          await db.models.WorkspaceModel.removeStates(workspaceId, [stateId]);
        }
        // if project imageHash is the same as the state, remove it
        if (projectId && project?.imageHash === state.imageHash) {
          await db.models.ProjectModel.updateProjectById(projectId, {
            imageHash: undefined,
          });
        }
      } catch (error) {
        errors.push(state?._id?.toString() as string);
        return;
      }
    })
  );

  console.log(`Cleaned up project and workspace references for ${states.length} states`);
  console.log(`# errors ${errors.length}`);
}

main();
