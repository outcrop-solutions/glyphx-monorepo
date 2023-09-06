import 'mocha';
import {assert} from 'chai';
import {SecretsManager} from '@aws-sdk/client-secrets-manager';
import {SecretManager} from '../../aws';

import {v4} from 'uuid';

const SECRET = {
  foo: 1,
  bar: 2,
  baz: 'hi mom',
};
const SECRET_NAME = 'testSecret_' + v4().replace(/-/g, '');

describe('#integrationTests/secrets/basicSecret', () => {
  context('Retreive secrets from an existing aws secret', () => {
    const mgr = new SecretsManager({});
    before(async () => {
      //1. create our test secret with a random name for this test.
      await mgr.createSecret({
        SecretString: JSON.stringify(SECRET),
        Name: SECRET_NAME,
      });
    });

    after(async () => {
      //There is a delay between creating the secret and having it available in the listSecrets
      //command so we are going to wait 5 seconds to make sure that it shows up.
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const definedSecrets = await (mgr.listSecrets({
        Filters: [{Key: 'name', Values: [SECRET_NAME]}],
      }) as Promise<any>);

      assert.strictEqual(definedSecrets.SecretList.length, 1);

      const secretEntry = definedSecrets.SecretList[0];

      const arn = secretEntry.ARN;

      assert.isOk(arn);
      await mgr.deleteSecret({SecretId: arn});
    });

    it('should retrive our secret value', async () => {
      const secretManager = new SecretManager(SECRET_NAME);

      const secretValue = await secretManager.getSecrets();

      assert.strictEqual(secretValue.foo, SECRET.foo);
      assert.strictEqual(secretValue.bar, SECRET.bar);
      assert.strictEqual(secretValue.baz, SECRET.baz);
    });
  });
});
