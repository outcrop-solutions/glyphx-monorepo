import {GrowthBook} from '@growthbook/growthbook';

export enum ENV {
  DEV = 'dev',
  DEMO = 'demo',
  PROD = 'prod',
}

// match env to growthbook client id to segregate aggregated events
export const getGBKey = (): string => {
  const env = process.env['NEXT_PUBLIC_GB_ENV'];
  switch (env) {
    case ENV.DEV:
      return process.env.NEXT_PUBLIC_GB_CLIENT_DEV as string;
    case ENV.DEMO:
      return process.env.NEXT_PUBLIC_GB_CLIENT_DEMO as string;
    case ENV.PROD:
      return process.env.NEXT_PUBLIC_GB_CLIENT_PROD as string;
    default:
      return process.env.NEXT_PUBLIC_GB_CLIENT_DEV as string;
  }
};

export const serverGrowthbook = new GrowthBook({
  apiHost: 'https://cdn.growthbook.io',
  clientKey: getGBKey(),
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
