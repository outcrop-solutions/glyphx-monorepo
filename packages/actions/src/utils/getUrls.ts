/**
 * This will be updated to include a state url parameter that automatically applies the given state on load.
 * For now, we omit this step to test the fix to the state creation logic in isolation
 */
export const getEnvSpecificStateUrl = (projectId: string) => {
  let projectUrl = `https://dev-app.glyphx.co/project/${projectId}`;
  if (process.env.VERCEL_ENV === 'preview') {
    projectUrl = `https://demo-app.glyphx.co/project/${projectId}`;
  } else if (process.env.VERCEL_ENV === 'production') {
    projectUrl = `https://app.glyphx.co/project/${projectId}`;
  }
  return projectUrl;
};
