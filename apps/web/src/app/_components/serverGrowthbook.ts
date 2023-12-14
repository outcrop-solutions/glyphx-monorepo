'use server';
import {GrowthBook} from '@growthbook/growthbook-react';

enum ENV {
  DEV = 'dev',
  DEMO = 'demo',
  PROD = 'prod',
}

// match env to growthbook client id to segregate aggregated events
const getGBKey = (env: ENV): string => {
  switch (env) {
    case ENV.DEV:
      return process.env.GB_CLIENT_DEV as string;
    case ENV.DEMO:
      return process.env.GB_CLIENT_DEMO as string;
    case ENV.PROD:
      return process.env.GB_CLIENT_PROD as string;
    default:
      return process.env.GB_CLIENT_DEV as string;
  }
};

export const serverGrowthbook = new GrowthBook({
  apiHost: 'https://cdn.growthbook.io',
  clientKey: getGBKey(process.env.GLYPHX_ENV as ENV),
  enableDevMode: true,
  subscribeToChanges: true,
  trackingCallback: (experiment, result) => {
    // TODO: Use posthog analytics tracking system
    console.log('Viewed Experiment', {
      experimentId: experiment.key,
      variationId: result.key,
    });
  },
});
