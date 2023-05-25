import 'reflect-metadata';
import {InvalidOperationError} from '../error';
import {SecretManager} from '../aws';
import {ISecretBoundObject, secretBinder} from './secretBinder';

const INITIALIZER_NAMES = ['init', 'initialize'];

interface IInitializerDescription {
  name: string;
  descriptor: PropertyDescriptor;
}

type ValueExtractor = (input: any) => any;

export function initializer(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const initializerValue = Reflect.getMetadata(
    'boundSecrets:initializerFunction',
    target
  );

  if (typeof descriptor.value !== 'function') {
    throw new InvalidOperationError(
      `You should only use the initializer decorator on a function.  ${propertyKey} does not appear to be a function`,
      {propertyName: propertyKey, typeof: typeof descriptor.value}
    );
  }

  if (initializerValue) {
    throw new InvalidOperationError(
      `The initilizer metadata has already been set on the class using the method ${initializerValue.methdodName}.  You can only use this decorator to decirate one method`,
      {methodName: initializerValue.methodName}
    );
  }
  // if (descriptor.value.__proto__.constructor.name !== 'AsyncFunction') {
  //   throw new InvalidOperationError(
  //     'Your initializer function must return a Promise so that it can be awaited',
  //     {functionName: propertyKey}
  //   );
  // }

  Reflect.defineMetadata(
    'boundSecrets:initializerFunction',
    {name: propertyKey, descriptor: descriptor},
    target
  );
}

function storeSecretName(
  target: any,
  propertyName: string,
  secretName: string
): void {
  const savedSecretMeta = (Reflect.getMetadata(
    'boundSecrets:saveSecrets',
    target
  ) ?? new Map<string, {secretName: string; propertyName: string}>()) as Map<
    string,
    {secretName: string; propertyName: string}
  >;
  const usedSecret = savedSecretMeta.get(secretName);
  if (usedSecret) {
    throw new InvalidOperationError(
      `The secret ${usedSecret.secretName} has already been attached to the property : ${propertyName}`,
      {secretName: usedSecret.secretName, propertyName: usedSecret.propertyName}
    );
  }

  savedSecretMeta.set(secretName, {
    secretName: secretName,
    propertyName: propertyName,
  });

  Reflect.defineMetadata('boundSecrets:saveSecrets', savedSecretMeta, target);
}

export function boundProperty(
  secretName: string,
  extractor?: ValueExtractor | string
): (target: any, propertyName: string) => void;
export function boundProperty(
  isBound?: boolean,
  secretName?: string,
  extractor?: ValueExtractor
): (target: any, propertyName: string) => void;
export function boundProperty(
  val1?: boolean | string,
  val2?: string | ValueExtractor,
  val3?: ValueExtractor
) {
  return function (target: any, propertyName: string) {
    let bound = false;
    let secretName = '';
    let extractor: ValueExtractor | undefined = undefined;

    if (val1 === undefined) {
      bound = true;
      secretName = propertyName;
      extractor = (input: any) => input[propertyName];
    } else if (typeof val1 === 'boolean') {
      bound = val1 as boolean;
      secretName = (val2 as string) ?? propertyName;
      extractor =
        val3 ??
        ((input: any) => {
          //istanbul ignore next
          return input[secretName];
        });
    } else {
      bound = true;
      secretName = val1;
      extractor =
        (val2 as (input: string) => any) ??
        ((input: any) => {
          return input[secretName];
        });
    }

    if (bound) storeSecretName(target, propertyName, secretName);

    Reflect.defineMetadata('boundSecrets:isBound', bound, target, propertyName);
    Reflect.defineMetadata(
      'boundSecrets:extractor',
      extractor,
      target,
      propertyName
    );
    Reflect.defineMetadata(
      'boundSecrets:secretName',
      secretName,
      target,
      propertyName
    );

    if (bound) {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(
        target,
        propertyName
      );

      if (!propertyDescriptor) {
        let value: any;
        const getter = function () {
          return value;
        };

        const setter = function (input: any) {
          value = input;
        };

        Object.defineProperty(target, propertyName, {
          get: getter,
          set: setter,
          enumerable: true,
          configurable: true,
        });
      } else {
        if (!propertyDescriptor.get || !propertyDescriptor.set) {
          throw new InvalidOperationError(
            'If you have attached the boundPropery decorator to a property with accessors is must have a get and a set.',
            {propertyName: propertyName}
          );
        }
      }
    }
  };
}

function findInitializerFunction(target: any) {
  const initDescriptor = Reflect.getMetadata(
    'boundSecrets:initializerFunction',
    target.prototype
  );

  if (initDescriptor) return initDescriptor;

  const keys = Object.getOwnPropertyNames(target.prototype);
  let potentialInitializer: IInitializerDescription | undefined = undefined;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key === 'constructor') continue;
    const propertyDescriptor = Object.getOwnPropertyDescriptor(
      target.prototype,
      key
    );
    if (typeof propertyDescriptor?.value !== 'function') continue;

    if (INITIALIZER_NAMES.find(name => name === key.toLowerCase()))
      potentialInitializer = {name: key, descriptor: propertyDescriptor};
    continue;
  }

  return potentialInitializer;
}

export function bindSecrets(secretName: string) {
  return function <T extends {new (...args: any[]): {}}>(target: T) {
    const {initializer, initialInitislizerFunction} =
      findAndValidateInitializer<T>(target);
    //now modify our object so that we can inject the secret values/

    //1. we are going to swap out the intializer with our own initializer.
    updateInitializer<T>(target, initializer, initialInitislizerFunction);

    //2. we will go ahead and add the secret name
    addSecretNameProperty<T>(target, secretName);

    //3. We will add the secret manager
    addSecretManagerProperty<T>(secretName, target);

    //4. Wrap our secret bound propertied in a guard to ensure that inited has been set to true by the init function
    setupPropertyGuards<T>(target);
  };
}

function addSecretManagerProperty<T extends {new (...args: any[]): {}}>(
  secretName: string,
  target: T
) {
  const secretManager = new SecretManager(secretName);
  Object.defineProperty(target.prototype, 'secretManager', {
    get: function (): SecretManager {
      return secretManager;
    },
  });
}

function addSecretNameProperty<T extends {new (...args: any[]): {}}>(
  target: T,
  secretName: string
) {
  Object.defineProperty(target.prototype, 'secretName', {
    get: function (): string {
      return secretName;
    },
  });
}

function updateInitializer<T extends {new (...args: any[]): {}}>(
  target: T,
  initializer: any,
  initialInitislizerFunction: any
) {
  let initedField = false;
  Object.defineProperty(target.prototype, initializer.name, {
    value: async function () {
      //eslint-disable-next-line
      //@ts-ignore
      const boundFunction = secretInitializer.bind(this);
      initedField = true;
      const result = await boundFunction(initialInitislizerFunction);

      return result;
    },
  });

  //Define an inited property so we can access the value of initied field later
  Object.defineProperty(target.prototype, 'inited', {
    get: function (): boolean {
      return initedField;
    },
  });
}

function findAndValidateInitializer<T extends {new (...args: any[]): {}}>(
  target: T
) {
  const initializer = findInitializerFunction(target);

  if (!initializer)
    throw new InvalidOperationError(
      'An initializer function cannot be found.  Please decorate an async method with the @initializer decorator',
      {}
    );

  // if (
  //   initializer.descriptor.value.__proto__.constructor.name !== 'AsyncFunction'
  // ) {
  //   throw new InvalidOperationError(
  //     'Your initializer function must return a Promise so that it can be awaited',
  //     {functionName: initializer.name}
  //   );
  // }

  const initialInitislizerFunction = initializer.descriptor.value;
  return {initializer, initialInitislizerFunction};
}

function setupPropertyGuards<T extends {new (...args: any[]): {}}>(target: T) {
  const keys = Object.getOwnPropertyNames(target.prototype);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isBound = Reflect.getMetadata(
      'boundSecrets:isBound',
      target.prototype,
      key
    );

    if (isBound) {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(
        target.prototype,
        key
      );
      const origGetter = propertyDescriptor?.get;
      //istanbul ignore next else
      if (origGetter) {
        Object.defineProperty(target.prototype, key, {
          get: function () {
            if (!this.inited) {
              throw new InvalidOperationError(
                'You must call init before accessing a secrets bound property',
                {propertyName: key}
              );
            }
            const func = origGetter.bind(this);
            return func();
          },
        });
      }
    }
  }
}

async function secretInitializer(innerInit: any) {
  //eslint-disable-next-line
  //@ts-ignore
  await secretBinder(this as unknown as ISecretBoundObject);
  //eslint-disable-next-line
  //@ts-ignore
  const boundInit = innerInit.bind(this);
  return await boundInit();
}
