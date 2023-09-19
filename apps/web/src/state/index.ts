/**
 * We approach state management from a functional perspective
 * State is initialized from serverside api calls
 * Downstream selectors are nodes in the state dependency
 * graph which inherit their value from the base atoms.
 * State flows through the DAG down to state values renderable by react components.
 * atoms -> selectors -> components is the general flow
 * selectors are modeled as pure functions with no side effects
 * In the future, this can be bi-directional (where selector nodes can update parents)
 * We are optimizing for readability and maintianability for now so that we can add functionality in a performant way later.
 * In principle, we are trying to minimize app state and simplify the data flow
 */

export * from './files'; // mirrors remote s3 file system
export * from './project'; // used for modeling glyphs
export * from './snapshot';
export * from './ui'; // control visual state of the app
export * from './workspace'; // holds workspace and membership
export * from './state';
export * from './resize';
export * from './template';
export * from './sandbox';
export * from './auth';
