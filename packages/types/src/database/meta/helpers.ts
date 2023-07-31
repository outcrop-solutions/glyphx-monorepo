// DATABASE
export type Unique<T> = T & {__unique__: void};
export type Default<T, D extends T> = T;
export type CascadeOnDelete<T> = T & {__cascadeOnDelete__: void};
export type CascadeOnUpdate<T> = T & {__cascadeOnDelete__: void};

// BUSINESS
export type Public<T> = T & {__public__: void}; // do not need Private as this is the default

// RBAC
export type OpsAllowed<T, D extends Array<T>> = T & {__opsAllowed__: D};
export type RateLimit<T, D extends T> = T & {__rateLimit__: D};
export type UsageLimit<T, D extends T> = T & {__usageLimit__: D};
