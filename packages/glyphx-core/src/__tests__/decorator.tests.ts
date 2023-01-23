import mocha from 'mocha';
import {assert} from 'chai';
import {SecretsManager} from '@aws-sdk/client-secrets-manager';
import 'reflect-metadata';
import {InvalidOperationError} from '../error';
import * as secrets from '../secrets/secretClassDecorator';
import {SecretManager} from '../aws';

describe('Decorator Tests', () => {
  context('decorator tests', () => {
    it('stubbing out our secret code', async () => {
      @secrets.bindSecrets('dev/mongodb')
      class mongoDbConnection {
        someData = 'I am some data';
        @secrets.boundProperty()
        password: string = '';
        @secrets.boundProperty('user')
        userName: string = '';
        @secrets.boundProperty('endpoint', (input: any) => {
          return input.endpoint;
        })
        url: string = '';
        @secrets.boundProperty(true, 'database')
        databsaeName: string = '';

        @secrets.boundProperty(false)
        user: string = 'bad user name';

        @secrets.initializer
        async init() {
          return this.someData;
        }

        get foo(): string {
          return 'foo';
        }
      }
      const con = new mongoDbConnection();
      const result = await con.init();
      assert.strictEqual(result, con.someData);

      console.log('well that did not go too badly');
    });

    // it.skip('build out our secrets infrastructure', async () => {
    //   function secretClass(target: any) {
    //     const propertyNames = Object.getOwnPropertyNames(target.prototype);
    //     propertyNames.forEach(p => {
    //       if (p !== 'constructor') {
    //         const propertyDescriptor = Object.getOwnPropertyDescriptor(
    //           target.prototype,
    //           p
    //         );
    //         if (propertyDescriptor?.get) {
    //           const origGet = propertyDescriptor.get;
    //           Object.defineProperty(target.prototype, p, {
    //             get: function () {
    //               const origFunc = origGet.bind(this);
    //               const value = origFunc();
    //               if (!value) {
    //                 throw new InvalidOperationError(
    //                   'It does not appear that this object has been initialized',
    //                   {propertyName: p}
    //                 );
    //               }
    //               return value;
    //             },
    //           });
    //         }
    //       }
    //     });
    //     return target;
    //   }
    //   function property(target: any, propertyName: string) {
    //     let value: any;
    //     const getter = function () {
    //       return value;
    //     };

    //     const setter = function (input: any) {
    //       value = input;
    //     };
    //     Object.defineProperty(target, propertyName, {
    //       get: getter,
    //       set: setter,
    //       enumerable: true,
    //       configurable: true,
    //     });

    //     console.log('here I am');
    //   }
    //   @secretClass
    //   class databaseConnection {
    //     private projectField: string;
    //     private databaseField: string;
    //     private userNameField: string;
    //     private passwordField: string;
    //     @property
    //     public iNeedFood: boolean;

    //     public get project(): string {
    //       return this.projectField;
    //     }

    //     public get database(): string {
    //       return this.databaseField;
    //     }

    //     public get userName(): string {
    //       return this.userNameField;
    //     }

    //     public get password(): string {
    //       return this.passwordField;
    //     }

    //     constructor() {
    //       this.passwordField = '';
    //       this.userNameField = '';
    //       this.databaseField = '';
    //       this.projectField = '';
    //       this.iNeedFood = false;
    //     }
    //   }
    //   const testObj = new databaseConnection();
    //   testObj.iNeedFood = true;
    //   testObj.password;
    //   console.log('I am here');
    // });
    // it.skip('is a basic decorator test', () => {
    //   function classDecorator(target: any) {
    //     console.log(target);
    //   }

    //   function methodInjector<T extends {new (...args: any[]): {}}>(
    //     constructor: T
    //   ) {
    //     return class extends constructor {
    //       hello(input: string): void {
    //         console.log(`hello ${input}`);
    //       }
    //     };
    //   }

    //   function method(foo: string) {
    //     return function (target: any, propertyKey: string, descriptor: any) {
    //       descriptor.foo = foo;
    //       console.log(foo);
    //     };
    //   }
    //   function property() {
    //     return Reflect.metadata('foo', 'bar');
    //   }
    //   @classDecorator
    //   @methodInjector
    //   class testClass {
    //     @property()
    //     testProp: string;

    //     @method('hello world')
    //     testMethod(): number {
    //       console.log('I am the test method');
    //       return 1;
    //     }
    //     constructor() {
    //       this.testProp = 'hi mom';
    //     }
    //   }

    //   const testCls = new testClass();
    //   testCls.testMethod();
    //   (testCls as any).hello('mother');
    //   console.log('here I am');
    // });
  });
});
