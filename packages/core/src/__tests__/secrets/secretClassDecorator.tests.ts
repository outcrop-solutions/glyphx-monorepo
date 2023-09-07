import 'mocha';
import {assert} from 'chai';
import * as secrets from '../../secrets/secretClassDecorator';
import 'reflect-metadata';
import {InvalidOperationError} from '../../error';
//eslint-disable-next-line
import {mockClient} from 'aws-sdk-client-mock';
import {SecretsManager, GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';

describe('#/secrets/secretClassDecorator', () => {
  context('initializer', () => {
    it('will attach metadata to our initializer', () => {
      class TestClass {
        @secrets.initializer
        async init(): Promise<void> {
          console.log('I am init');
        }
      }

      const metaData = Reflect.getMetadata('boundSecrets:initializerFunction', TestClass.prototype);

      assert.isOk(metaData);
      assert.strictEqual(metaData.name, 'init');
      assert.strictEqual(metaData.descriptor.value, TestClass.prototype.init);
    });

    it('will throw an InvalidOperationException if the initilizer is set more than once', () => {
      assert.throws(() => {
        class TestClass {
          @secrets.initializer
          async init(): Promise<void> {
            console.log('I am init');
          }

          @secrets.initializer
          async init2(): Promise<void> {
            console.log('I am init');
          }
        }
      }, InvalidOperationError);
    });

    it('will throw an InvalidOperationException if the initilizer is set on a property', () => {
      assert.throws(() => {
        class TestClass {
          @secrets.initializer
          get init(): string {
            return 'init';
          }
        }
      }, InvalidOperationError);
    });

    it('will throw an InvalidOperationException if the initilizer is set on a function that is not async', () => {
      assert.throws(() => {
        @secrets.bindSecrets('test')
        class TestClass {
          @secrets.initializer
          init(): void {
            console.log('I am init');
          }
        }
      }, InvalidOperationError);
    });
  });

  context('boundPropery', () => {
    it('bind a field using the secret name', () => {
      class TestClass {
        @secrets.boundProperty('bar')
        foo = '';
      }

      const test = new TestClass();
      const fooTest = 'I am bound';
      test.foo = fooTest;

      assert.strictEqual(test.foo, fooTest);

      const isBound = Reflect.getMetadata('boundSecrets:isBound', test, 'foo');
      assert.isTrue(isBound);

      const secretName = Reflect.getMetadata('boundSecrets:secretName', test, 'foo');
      assert.strictEqual(secretName, 'bar');

      const extractor = Reflect.getMetadata('boundSecrets:extractor', test, 'foo');
      assert.isOk(extractor);

      const propertyDescriptor = Object.getOwnPropertyDescriptor((test as any).__proto__, 'foo');
      assert.isOk(propertyDescriptor?.get);
      assert.isOk(propertyDescriptor?.set);
    });

    it('bind a field using a secret name and extractor', () => {
      const extractorText = 'I am Groot';
      const extractor = () => {
        return extractorText;
      };

      class TestClass {
        @secrets.boundProperty('bar', extractor)
        foo = '';
      }

      const test = new TestClass();
      const fooTest = 'I am bound';
      test.foo = fooTest;

      assert.strictEqual(test.foo, fooTest);

      const isBound = Reflect.getMetadata('boundSecrets:isBound', test, 'foo');
      assert.isTrue(isBound);

      const secretName = Reflect.getMetadata('boundSecrets:secretName', test, 'foo');
      assert.strictEqual(secretName, 'bar');

      const savedExtractor = Reflect.getMetadata('boundSecrets:extractor', test, 'foo');
      assert.isOk(savedExtractor);
      assert.strictEqual(savedExtractor, extractor);

      assert.strictEqual(savedExtractor('hi mom'), extractorText);

      const propertyDescriptor = Object.getOwnPropertyDescriptor((test as any).__proto__, 'foo');
      assert.isOk(propertyDescriptor?.get);
      assert.isOk(propertyDescriptor?.set);
    });

    it('bind a property using secret name', () => {
      class TestClass {
        fooField = '';

        @secrets.boundProperty('bar')
        get foo() {
          return this.fooField;
        }

        set foo(input: string) {
          this.fooField = input;
        }
      }

      const test = new TestClass();
      const fooTest = 'I am bound';
      test.fooField = fooTest;

      assert.strictEqual(test.foo, fooTest);

      test.fooField = '';
      assert.isEmpty(test.foo);

      test.foo = fooTest;
      assert.strictEqual(test.foo, fooTest);

      const isBound = Reflect.getMetadata('boundSecrets:isBound', test, 'foo');
      assert.isTrue(isBound);

      const secretName = Reflect.getMetadata('boundSecrets:secretName', test, 'foo');
      assert.strictEqual(secretName, 'bar');

      const extractor = Reflect.getMetadata('boundSecrets:extractor', test, 'foo');
      assert.isOk(extractor);

      const propertyDescriptor = Object.getOwnPropertyDescriptor((test as any).__proto__, 'foo');
      assert.isOk(propertyDescriptor?.get);
      assert.isOk(propertyDescriptor?.set);
    });

    it('will throw an error if you try to bind to a property without a getter', () => {
      assert.throws(() => {
        class TestClass {
          fooField = '';

          @secrets.boundProperty('bar')
          set foo(input: string) {
            this.fooField = input;
          }
        }
      }, InvalidOperationError);
    });

    it('will throw an error if you try to bind to a property without a setter', () => {
      assert.throws(() => {
        class TestClass {
          fooField = '';

          @secrets.boundProperty('bar')
          get foo() {
            return this.fooField;
          }
        }
      }, InvalidOperationError);
    });

    it('bind a property with no arguments', () => {
      class TestClass {
        @secrets.boundProperty()
        foo = '';
      }

      const test = new TestClass();
      const fooTest = 'I am bound';
      test.foo = fooTest;

      assert.strictEqual(test.foo, fooTest);

      const isBound = Reflect.getMetadata('boundSecrets:isBound', test, 'foo');
      assert.isTrue(isBound);

      const secretName = Reflect.getMetadata('boundSecrets:secretName', test, 'foo');
      assert.strictEqual(secretName, 'foo');

      const extractor = Reflect.getMetadata('boundSecrets:extractor', test, 'foo');
      assert.isOk(extractor);

      const propertyDescriptor = Object.getOwnPropertyDescriptor((test as any).__proto__, 'foo');
      assert.isOk(propertyDescriptor?.get);
      assert.isOk(propertyDescriptor?.set);
    });

    it('bind a property with the boolean == true', () => {
      class TestClass {
        @secrets.boundProperty(true)
        foo = '';
      }

      const test = new TestClass();
      const fooTest = 'I am bound';
      test.foo = fooTest;

      assert.strictEqual(test.foo, fooTest);

      const isBound = Reflect.getMetadata('boundSecrets:isBound', test, 'foo');
      assert.isTrue(isBound);

      const secretName = Reflect.getMetadata('boundSecrets:secretName', test, 'foo');
      assert.strictEqual(secretName, 'foo');

      const extractor = Reflect.getMetadata('boundSecrets:extractor', test, 'foo');
      assert.isOk(extractor);

      const propertyDescriptor = Object.getOwnPropertyDescriptor((test as any).__proto__, 'foo');
      assert.isOk(propertyDescriptor?.get);
      assert.isOk(propertyDescriptor?.set);
    });

    it('bind a property with the boolean == false', () => {
      class TestClass {
        @secrets.boundProperty(false)
        foo = '';
      }

      const test = new TestClass();
      const fooTest = 'I am bound';
      test.foo = fooTest;

      assert.strictEqual(test.foo, fooTest);

      const isBound = Reflect.getMetadata('boundSecrets:isBound', test, 'foo');
      assert.isFalse(isBound);

      const secretName = Reflect.getMetadata('boundSecrets:secretName', test, 'foo');
      assert.strictEqual(secretName, 'foo');

      const extractor = Reflect.getMetadata('boundSecrets:extractor', test, 'foo');
      assert.isOk(extractor);

      const propertyDescriptor = Object.getOwnPropertyDescriptor((test as any).__proto__, 'foo');
      assert.notOk(propertyDescriptor?.get);
      assert.notOk(propertyDescriptor?.set);
    });

    it('bind a property with the boolean and secret name', () => {
      class TestClass {
        @secrets.boundProperty(true, 'bar')
        foo = '';
      }

      const test = new TestClass();
      const fooTest = 'I am bound';
      test.foo = fooTest;

      assert.strictEqual(test.foo, fooTest);

      const isBound = Reflect.getMetadata('boundSecrets:isBound', test, 'foo');
      assert.isTrue(isBound);

      const secretName = Reflect.getMetadata('boundSecrets:secretName', test, 'foo');
      assert.strictEqual(secretName, 'bar');

      const extractor = Reflect.getMetadata('boundSecrets:extractor', test, 'foo');
      assert.isOk(extractor);

      const propertyDescriptor = Object.getOwnPropertyDescriptor((test as any).__proto__, 'foo');
      assert.isOk(propertyDescriptor?.get);
      assert.isOk(propertyDescriptor?.set);
    });

    it('bind a property with the boolean, secret name and extractor', () => {
      const extractorText = 'I am Groot';
      const extractor = () => {
        return extractorText;
      };

      class TestClass {
        @secrets.boundProperty(true, 'bar', extractor)
        foo = '';
      }

      const test = new TestClass();
      const fooTest = 'I am bound';
      test.foo = fooTest;

      assert.strictEqual(test.foo, fooTest);

      const isBound = Reflect.getMetadata('boundSecrets:isBound', test, 'foo');
      assert.isTrue(isBound);

      const secretName = Reflect.getMetadata('boundSecrets:secretName', test, 'foo');
      assert.strictEqual(secretName, 'bar');

      const savedExtractor = Reflect.getMetadata('boundSecrets:extractor', test, 'foo');
      assert.isOk(savedExtractor);
      assert.strictEqual(savedExtractor, extractor);

      assert.strictEqual(savedExtractor('hi mom'), extractorText);

      const propertyDescriptor = Object.getOwnPropertyDescriptor((test as any).__proto__, 'foo');
      assert.isOk(propertyDescriptor?.get);
      assert.isOk(propertyDescriptor?.set);
    });
  });

  context('bindSecrets', () => {
    const mockedSecret = {
      userName: 'foo',
      userId: 'testId',
      youWillNeverSeeMe: true,
    };
    let secretsManagerMock: any;

    beforeEach(() => {
      /* eslint-disable-next-line */
      //@ts-ignore
      secretsManagerMock = mockClient(SecretsManager);
    });

    afterEach(() => {
      secretsManagerMock.restore();
    });

    it('will bind our class to a secrets object', async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      @secrets.bindSecrets(secretName)
      class BoundClass {
        @secrets.boundProperty('userName')
        user = '';
        @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
        id = '';

        async init(): Promise<string> {
          return initedResult;
        }
      }

      const testClass = new BoundClass();
      assert.strictEqual((testClass as any).secretName, secretName);
      assert.isOk((testClass as any).secretManager);
      assert.isFalse((testClass as any).inited);
      assert.throws(() => testClass.user, InvalidOperationError);

      const initResult = await testClass.init();
      assert.strictEqual(initResult, initedResult);

      assert.strictEqual(testClass.user, mockedSecret.userName);
      assert.strictEqual(testClass.id, mockedSecret.userId.toUpperCase());
    });

    it('will bind our class to a secrets object setting an init function', async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      @secrets.bindSecrets(secretName)
      class BoundClass {
        @secrets.boundProperty('userName')
        user = '';
        @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
        id = '';

        @secrets.initializer
        async init(): Promise<string> {
          return initedResult;
        }
      }

      const testClass = new BoundClass();
      assert.strictEqual((testClass as any).secretName, secretName);
      assert.isOk((testClass as any).secretManager);
      assert.isFalse((testClass as any).inited);
      assert.throws(() => testClass.user, InvalidOperationError);

      const initResult = await testClass.init();
      assert.strictEqual(initResult, initedResult);

      assert.strictEqual(testClass.user, mockedSecret.userName);
      assert.strictEqual(testClass.id, mockedSecret.userId.toUpperCase());
    });

    it('will allow us to instantiate two objects each with its own inited value', async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      @secrets.bindSecrets(secretName)
      class BoundClass {
        @secrets.boundProperty('userName')
        user = '';
        @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
        id = '';

        @secrets.initializer
        async init(): Promise<string> {
          return initedResult;
        }
      }

      const testClass = new BoundClass();
      assert.strictEqual((testClass as any).secretName, secretName);
      assert.isOk((testClass as any).secretManager);
      assert.isFalse((testClass as any).inited);
      assert.throws(() => testClass.user, InvalidOperationError);

      const initResult = await testClass.init();
      assert.strictEqual(initResult, initedResult);

      assert.strictEqual(testClass.user, mockedSecret.userName);
      assert.strictEqual(testClass.id, mockedSecret.userId.toUpperCase());

      const testClass2 = new BoundClass();
      assert.isFalse((testClass2 as any)['__secretInitalized__']);
      assert.isTrue((testClass as any)['__secretInitalized__']);
    });
    it('will throw an InvalidOperationError becuase our init function is not async', async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      assert.throws(() => {
        @secrets.bindSecrets(secretName)
        class BoundClass {
          @secrets.boundProperty('userName')
          user = '';
          @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
          id = '';

          init(): string {
            return initedResult;
          }
        }
      }, InvalidOperationError);
    });
    it("will throw an InvalidOperationError becuase it can't find our init function", async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      assert.throws(() => {
        @secrets.bindSecrets(secretName)
        class BoundClass {
          @secrets.boundProperty('userName')
          user = '';
          @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
          id = '';

          notinit(): string {
            return initedResult;
          }
        }
      }, InvalidOperationError);
    });

    it('will throw an InvalidOperationError when we try to bind the same secret more than once', async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      assert.throws(() => {
        @secrets.bindSecrets(secretName)
        class BoundClass {
          @secrets.boundProperty('userName')
          user = '';
          @secrets.boundProperty('userName')
          name = '';
          @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
          id = '';

          init(): string {
            return initedResult;
          }
        }
      }, InvalidOperationError);
    });

    it('will throw an InvalidOperationError becuase there is no initalizer function', async () => {
      const secretName = 'testSecret';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      assert.throws(() => {
        @secrets.bindSecrets(secretName)
        class BoundClass {
          @secrets.boundProperty('userName')
          user = '';
          @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
          id = '';
        }
      }, InvalidOperationError);
    });

    it('will throw an InvalidOperationError becuase there is no initalizer function', async () => {
      const secretName = 'testSecret';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      assert.throws(() => {
        @secrets.bindSecrets(secretName)
        class BoundClass {
          @secrets.boundProperty('userName')
          user = '';
          @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
          id = '';
        }
      }, InvalidOperationError);
    });

    it('Guards will prevent access to the bound properties until init is called', async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      @secrets.bindSecrets(secretName)
      class BoundClass {
        @secrets.boundProperty('userName')
        user = '';
        @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
        id = '';

        unboundField = 'I am unbound';

        async init(): Promise<string> {
          return initedResult;
        }
      }

      const testClass = new BoundClass();
      assert.throws(() => testClass.id);
      assert.throws(() => testClass.user);

      assert.isNotEmpty(testClass.unboundField);
      assert.strictEqual((testClass as any).secretName, secretName);
      assert.isOk((testClass as any).secretManager);
      assert.isFalse((testClass as any).inited);
      assert.throws(() => testClass.user, InvalidOperationError);

      const initResult = await testClass.init();
      assert.strictEqual(initResult, initedResult);

      assert.strictEqual(testClass.user, mockedSecret.userName);
      assert.strictEqual(testClass.id, mockedSecret.userId.toUpperCase());
    });

    it('will bind our class to a secrets object with some properties not being decorated', async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      @secrets.bindSecrets(secretName)
      class BoundClass {
        user = '';
        get userName() {
          return this.user;
        }

        set userName(input: string) {
          this.user = input;
        }
        @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
        id = '';

        async init(): Promise<string> {
          return initedResult;
        }
      }

      const testClass = new BoundClass();
      const initResult = await testClass.init();
      assert.strictEqual(initResult, initedResult);

      assert.strictEqual(testClass.userName, mockedSecret.userName);
      assert.strictEqual(testClass.id, mockedSecret.userId.toUpperCase());
    });

    it('an un-decorated property is masked by a decorated field', async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      @secrets.bindSecrets(secretName)
      class BoundClass {
        @secrets.boundProperty('userName')
        user = '';

        get userName() {
          return this.user;
        }

        set userName(input: string) {
          this.user = input;
        }
        @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
        id = '';

        async init(): Promise<string> {
          return initedResult;
        }
      }

      const testClass = new BoundClass();
      const initResult = await testClass.init();
      assert.strictEqual(initResult, initedResult);

      assert.strictEqual(testClass.userName, mockedSecret.userName);
      assert.strictEqual(testClass.id, mockedSecret.userId.toUpperCase());
    });

    it('an un-decorated property is masked by a decorated Property', async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      @secrets.bindSecrets(secretName)
      class BoundClass {
        userNameField = '';

        userField = '';

        @secrets.boundProperty('userName')
        get zuser() {
          return this.userField;
        }

        set zuser(input: string) {
          this.userField = input;
        }
        @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
        id = '';

        get userName() {
          return this.userNameField;
        }

        set userName(input: string) {
          this.userNameField = input;
        }
        async init(): Promise<string> {
          return initedResult;
        }
      }

      const testClass = new BoundClass();
      const initResult = await testClass.init();
      assert.strictEqual(initResult, initedResult);

      assert.strictEqual(testClass.zuser, mockedSecret.userName);
      assert.strictEqual(testClass.id, mockedSecret.userId.toUpperCase());
    });

    it('an property marked not bindable does not mask a decorated property', async () => {
      const secretName = 'testSecret';
      const initedResult = 'I am inited';
      secretsManagerMock.on(GetSecretValueCommand).resolves({SecretString: JSON.stringify(mockedSecret)});

      @secrets.bindSecrets(secretName)
      class BoundClass {
        userNameField = '';

        userField = '';

        @secrets.boundProperty('userName')
        get zuser() {
          return this.userField;
        }

        set zuser(input: string) {
          this.userField = input;
        }
        @secrets.boundProperty('userId', (input: any) => input.userId.toUpperCase())
        id = '';
        @secrets.boundProperty(false)
        get userName() {
          return this.userNameField;
        }

        set userName(input: string) {
          this.userNameField = input;
        }
        async init(): Promise<string> {
          return initedResult;
        }
      }

      const testClass = new BoundClass();
      const initResult = await testClass.init();
      assert.strictEqual(initResult, initedResult);

      assert.strictEqual(testClass.zuser, mockedSecret.userName);
      assert.strictEqual(testClass.id, mockedSecret.userId.toUpperCase());
    });
  });
});
