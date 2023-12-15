'use client';
import {GrowthBook} from '@growthbook/growthbook-react';
import {getGBKey} from './serverGrowthbook';

export const clientGrowthBook = new GrowthBook({
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
