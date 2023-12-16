export type Factory = (sl: ServiceLocatorInterface) => unknown;

export type FactoriesMap = Record<string, Factory>;

export interface ServiceLocatorInterface {
  has(key: string): boolean;
  get<K extends keyof FactoriesMap>(key: K, recreate: boolean): ReturnType<FactoriesMap[K]>;
}
