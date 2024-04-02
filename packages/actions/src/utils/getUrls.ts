/**
 * This will be updated to include a state url parameter that automatically applies the given state on load.
 * For now, we omit this step to test the fix to the state creation logic in isolation
 */
export const getEnvSpecificStateUrl = (projectId: string) => {
  let projectUrl;

  if (process.env.GLYPHX_ENV === 'dev') {
    projectUrl = `https://dev-app.glyphx.co/project/${projectId}`;
  }
  if (process.env.GLYPHX_ENV === 'demo') {
    projectUrl = `https://demo-app.glyphx.co/project/${projectId}`;
  } else if (process.env.GLYPHX_ENV === 'prod') {
    projectUrl = `https://app.glyphx.co/project/${projectId}`;
  }
  return projectUrl;
};
