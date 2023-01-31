import mocha from 'mocha';
import {assert} from 'chai';
import {SecretsManager} from '@aws-sdk/client-secrets-manager';
import {v4} from 'uuid';
import * as secrets from '../../secrets/secretClassDecorator';

const secret = {
  foo: 1,
  bar: 2,
  baz: 'hi mom',
};
let secretName = 'testSecret_' + v4().replace(/-/g, '');

describe('#integrationTests/secrets/basicSecret', () => {
  context('Bind secrets from an existing aws secret to an object', () => {
    const mgr = new SecretsManager({});
    before(async () => {
      //1. create our test secret with a random name for this test.
      await mgr.createSecret({
        SecretString: JSON.stringify(secret),
        Name: secretName,
      });
    });

    after(async () => {
      //There is a delay between creating the secret and having it available in the listSecrets
      //command so we are going to wait 5 seconds to make sure that it shows up.
      await new Promise(resolve => setTimeout(resolve, 5000));
      const definedSecrets = await (mgr.listSecrets({
        Filters: [{Key: 'name', Values: [secretName]}],
      }) as Promise<any>);

      assert.strictEqual(definedSecrets.SecretList.length, 1);

      const secretEntry = definedSecrets.SecretList[0];

      const arn = secretEntry.ARN;

      assert.isOk(arn);
      await mgr.deleteSecret({SecretId: arn});
    });

    it('should bind our secret values', async () => {
      @secrets.bindSecrets(secretName)
      class boundObject {
        @secrets.boundProperty()
        foo: number;
        @secrets.boundProperty()
        bar: number;
        @secrets.boundProperty()
        baz: string;

        async init() {
          return 'I am bound';
        }

        constructor() {
          this.foo = -1;
          this.bar = -1;
          this.baz = '';
        }
      }

      const bo = new boundObject();
      await bo.init();

      assert.strictEqual(bo.foo, secret.foo);
      assert.strictEqual(bo.bar, secret.bar);
      assert.strictEqual(bo.baz, secret.baz);
    });
  });
});
