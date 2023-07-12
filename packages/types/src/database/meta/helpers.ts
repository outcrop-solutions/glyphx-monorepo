export type Unique<T> = T & {__unique__: void};
export type Default<T, D extends T> = T;
export type CascadeOnDelete<T> = T & {__cascadeOnDelete__: void};
export type CascadeOnUpdate<T> = T & {__cascadeOnDelete__: void};
