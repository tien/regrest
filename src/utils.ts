export type PickKey<T, K extends keyof T> = Extract<keyof T, K>;
