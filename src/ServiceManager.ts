import { FactoriesMap, ServiceLocatorInterface } from './types';

export class ServiceManager<T extends FactoriesMap> implements ServiceLocatorInterface {

  protected static cache: Map<string, unknown> = new Map();

  protected factories: T;
  protected isCacheEnabled = true;
  protected cache: Map<string, unknown>;

  constructor(factories: T, useGlobalCache = true) {
    this.cache = useGlobalCache ? ServiceManager.cache : new Map();
    this.factories = factories;
  }

  has(key: string): boolean {
    return this.factories[key] !== undefined;
  }

  add<K extends string, F extends (sm: ServiceManager<T>) => unknown>(key: K, factory: F): ServiceManager<T & Record<K, F>> {
    if (this.has(key)) {
      throw new Error(`Service "${key}" already exists`);
    }
    this.factories = { ...this.factories, ...{ [key]: factory } };
    const updated = this as unknown as ServiceManager<T & Record<K, F>>;
    return updated;
  }

  replace<K extends Exclude<keyof T, number | symbol>, NewF extends T[K]>(key: K, factory: NewF): ServiceManager<Omit<T, K> & Record<K, NewF>> {
    this.getCache().delete(key);
    this.factories[key] = factory;
    const updated = this as unknown as ServiceManager<Omit<T, K> & Record<K, NewF>>;
    return updated;
  }

  get<K extends keyof T & string>(key: K, recreate = false): ReturnType<T[K]> {
    const factory = this.factories[key];
    if (!factory) {
      throw new Error(`Factory was not set for service: "${key}"`);
    }
    if (this.isCacheEnabled && !recreate) {
      const cache = this.getCache();
      if (!cache.has(key)) {
        cache.set(key, factory(this));
      }
      return cache.get(key) as ReturnType<T[K]>;
    }
    return factory(this) as ReturnType<T[K]>;
  }

  getKeys(): string[] {
    return Array.from(Object.keys(this.factories));
  }

  destroy(): void {
    this.cleanCache();
    this.factories = {} as T;
  }

  cleanCache(): void {
    this.getCache().clear();
  }

  disableCache(): void {
    this.isCacheEnabled = false;
  }

  enableCache(): void {
    this.isCacheEnabled = true;
  }

  protected getCache(): Map<string, unknown> {
    return this.cache;
  }
}
