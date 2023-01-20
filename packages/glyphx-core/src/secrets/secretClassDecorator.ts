import 'reflect-metadata';
import {InvalidOperationError} from '../error';
import {SecretManager} from '../aws';
import {ISecretBoundObject, secretBinder} from './secretBinder';

export function initializer() {
  return Reflect.metadata('boundSecrets:initializerFunction', true);
}

type ValueExtractor = (input: any) => any;
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
          return input[secretName];
        });
    } else if (typeof val1 === 'string') {
      bound = true;
      secretName = val1;
      extractor =
        (val2 as (input: string) => any) ??
        ((input: any) => {
          return input[secretName];
        });
    }
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
          //throw up a guard to prevent us from doing bad things
          if (!value) {
            throw new InvalidOperationError(
              `The value of ${propertyName} has not been set.  This value is bound to a secret.  You must call your initializer function before you can access this property`,
              {propertyName: propertyName}
            );
          }
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

const INITIALIZER_NAMES = ['init', 'initialize'];

interface IInitializerDescription {
  name: string;
  descriptor: PropertyDescriptor;
}

function findInitializerFunction(target: any) {
  const keys = Object.getOwnPropertyNames(target.prototype);
  let initializer: IInitializerDescription | undefined = undefined;
  let potentialInitializer: IInitializerDescription | undefined = undefined;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key === 'constructor') continue;
    const propertyDescriptor = Object.getOwnPropertyDescriptor(
      target.prototype,
      key
    );
    if (typeof propertyDescriptor?.value !== 'function') continue;

    const initializerValue = Reflect.getMetadata(
      'boundSecrets:initializerFunction',
      target.prototype,
      key
    );

    if (initializerValue) {
      initializer = {name: key, descriptor: propertyDescriptor};
      break;
    }

    if (INITIALIZER_NAMES.find(name => name === key.toLowerCase()))
      potentialInitializer = {name: key, descriptor: propertyDescriptor};
    continue;
  }

  return initializer || potentialInitializer;
}

export function bindSecrets(secretName: string) {
  return function <T extends {new (...args: any[]): {}}>(target: T) {
    const initializer = findInitializerFunction(target);

    if (!initializer)
      throw new InvalidOperationError(
        'An initializer function cannot be found.  Please decorate an async method with the @initializer decorator',
        {}
      );

    const initializerReturnType = Reflect.getMetadata(
      'design:returntype',
      target.prototype,
      initializer.name
    );
    if (initializerReturnType.name !== 'Promise') {
      throw new InvalidOperationError(
        'Your initializer function must return a Promise so that it can be awaited',
        {functionName: initializer.name}
      );
    }

    const initialInitislizerFunction = initializer.descriptor.value;
    if (!initialInitislizerFunction)
      throw new InvalidOperationError(
        "This shoudln't happen but somehow you have decorated something other than a function with the @initializer attribute",
        {initializerName: initializer.name}
      );
    //now modify our object so that we can inject the secret values/
    //1. we are going to swap out the intializer with our own initializer.
    Object.defineProperty(target.prototype, initializer.name, {
      value: async function () {
        //eslint-disable-next-line
        //@ts-ignore
        const boundFunction = secretInitializer.bind(this);
        const result = await boundFunction(initialInitislizerFunction);

        return result;
      },
    });

    //2. we will go ahead and add the secret name
    Object.defineProperty(target.prototype, 'secretName', {
      get: function (): string {
        return secretName;
      },
    });

    //3. We will add the secret manager
    const secretManager = new SecretManager(secretName);
    Object.defineProperty(target.prototype, 'secretManager', {
      get: function (): SecretManager {
        return secretManager;
      },
    });
  };
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
