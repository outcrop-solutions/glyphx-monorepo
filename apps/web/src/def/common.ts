import type { PropsWithChildren } from "react";
// for react components with children
export type WithChildren<T = {}> = T & PropsWithChildren<{}>;
