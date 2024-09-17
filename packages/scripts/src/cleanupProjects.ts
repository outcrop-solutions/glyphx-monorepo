import {MongoDbConnection} from 'database';
import assert from 'node:assert';
import {databaseTypes} from 'types';

async function main() {
  const db = new MongoDbConnection();
  await db.init();

  // get the soft-deleted states
  const projects = (await db.models.ProjectModel.find({
    deletedAt: {$eq: null},
  })
    .select('stateHistory') // Ensure these fields are included
    .populate('workspace') // Populate references if needed
    .lean()) as databaseTypes.IProject[]; // Cast to IState[]

  // projects with states
  const ps = projects.filter((p) => p?.stateHistory?.length > 0);

  // total number of states attached to projects
  let checksum = 0;
  for (const p of ps) {
    checksum = checksum + p.stateHistory.length;
  }

  // the state ids attached to projects
  const states = ps.flatMap((p) => p.stateHistory.map((s) => s._id?.toString()));
  const errors: {msg: string}[] = [];

  await Promise.all([
    states.map(async (s) => {
      try {
        // if the state is soft-deleted, remove it from stateHistory
        const exists = await db.models.StateModel.findById(s).select('id deletedAt project');
        const projectId = exists?.project?._id?.toString();
        const id = exists?.id;
        if (id && exists?.deletedAt && projectId) {
          // remove the state from the stateHistory
          await db.models.ProjectModel.removeStates(projectId, [id]);
        }
      } catch (err) {
        errors.push({msg: JSON.stringify(err)});
      }
    }),
  ]);

  console.log(`Total projects ${projects.length}`);
  console.log(`Clean up project references ${ps.length}`);
  console.log(`Total states ${states.length}`);
  console.log(`Checksum ${checksum}`);
  console.log(`Errors ${errors.length}`);

  assert.strictEqual(states.length, checksum);

  //   console.log(`# errors ${errors.length}`);
}

main();
