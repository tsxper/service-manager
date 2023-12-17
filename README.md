# Service-Manager

[![NPM Version](https://img.shields.io/npm/v/@tsxper/service-manager.svg?style=flat-square)](https://www.npmjs.com/package/@tsxper/service-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dt/@tsxper/service-manager.svg?style=flat-square)](https://www.npmjs.com/package/@tsxper/service-manager)


`@tsxper/service-manager` is a TypeScript extension to the Service Locator design pattern, that helps with managing application dependencies. 

Service manager can be helpful for apps and services that do not require big frameworks with complex dependency injection setup.

It's designed to be used in browser and NodeJS apps.

Advantages of using ServiceManager:
- Easy setup.
- Comfortable integration testing.
- Small size (ServiceManager is implemented as one class).
- CommonJS and ESM modules support.
- Aimed to be used in all JavaScript projects (NodeJS and browsers).
- Doesn't use code generators.
- Doesn't rely on experimental technology, like decorators.



## Examples

See examples in [GitHub](https://github.com/tsxper/service-manager/blob/main/examples).

With using registered factories you can easily inject required dependencies in your services.

Imaging you have a service "DownstreamService" which depends on "LoggerService" and  "VaultService".

```JavaScript
// define your applications services
export class DownstreamService {
  constructor(logger: LoggerService, vault: VaultService) {
    // ...
  }
}


// sm.ts - add Service Manager configuration with factories
export const sm = new ServiceManager({
  'logger': () => new LoggerService(),
  'vault': () => {
    const url = process.env.VAULT_URL;
    if (!url) throw new Error('VAULT_URL is not set');
    return new VaultService(url);
  },
}).add('downstream', async (sm) => {
  // place for some async calls
  return new DownstreamService(sm.get('logger'), sm.get('vault'));
});


// app.ts - use Service Manager in your app
const downstream = await sm.get('downstream'); // we use "await" because associated factory is async function
await downstream.sendData(records);
sm.get('logger').log('Success');


// __tests__/app.test.ts - easily change behavior in tests
sm.replace(
  'vault',
  () => new VaultFake('http://test/')
);
```

### Caching Instances

By default, all created instances are cached (shared instances).
To retrieve a private instance of a service, pass "true" as second argument to "get()" method.
See example below.

```JavaScript
const privateInstance = sm.get('logger', true);
```

### Clear Services Cache

Call "destroy()" method to clear service cache and registered factories.

```JavaScript
sm.destroy(); // clean cache and registered factories
// or 
sm.cleanCache(); // clean cache
```

## Types Inference

Types inference for registered services is supported.

```JavaScript
// Checks for retrieving only registered services
const vault = sm.get('unregistered');
// TypeScript Error: Argument of type '"unregistered"' is not assignable to parameter of type '"logger" | "vault"'.

const vault = sm.get('vault'); 
// vault: VaultService
```

## Known Issues

TypeScript does not derive literal from a class name.

```JavaScript
// this code will work
const serviceName = 'LoggerService';
const sm = new ServiceManager({[serviceName]: () => new LoggerService()});
const loggerService = sm.get(serviceName); // serviceName is string literal

// this code will NOT work in TypeScript
const sm = new ServiceManager({ [Fruit.name]: () => new Fruit(1), 'Article': () => new Article('title') });
sm.get(Fruit.name).weight; // Fruit.name is a "string" and can't be associated with a concrete service
// Property 'weight' does not exist on type 'Fruit | Article'.
```

## License

MIT license.

