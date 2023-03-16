import {assert} from 'chai';
import {SecretManager} from '../../aws';
//eslint-disable-next-line
import {mockClient} from 'aws-sdk-client-mock';
import {
  SecretsManager,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import * as error from '../../error';

describe('#aws/SecretManager', () => {
  context('constructor', () => {
    it('will build a new SecretManager object', () => {
      const secretName = 'testSecretName';

      const secretManager = new SecretManager(secretName);

      assert.strictEqual(secretManager.secretName, secretName);
      assert.isOk(secretManager['secretsManager']);
    });
  });

  context('getSecrets', () => {
    let secretsManagerMock: any;

    beforeEach(() => {
      /* eslint-disable-next-line */
      //@ts-ignore
      secretsManagerMock = mockClient(SecretsManager);
    });

    afterEach(() => {
      secretsManagerMock.restore();
    });

    it('will get the secrets', async () => {
      const secretData = {foo: 1, bar: 2, baz: 'hi Mom'};
      secretsManagerMock
        .on(GetSecretValueCommand)
        .resolves({SecretString: JSON.stringify(secretData)});

      const secretManager = new SecretManager('testSecretName');
      const secret = await secretManager.getSecrets();

      assert.strictEqual(secret.foo, secretData.foo);
      assert.strictEqual(secret.bar, secretData.bar);
      assert.strictEqual(secret.baz, secretData.baz);
    });

    it('will fail when the SecretManagerClient throws an error', async () => {
      const codeString = 'something terrible happened';
      secretsManagerMock
        .on(GetSecretValueCommand)
        .rejects({$fault: 'client', message: codeString});
      const secretManager = new SecretManager('testSecretName');
      let errored = false;
      try {
        await secretManager.getSecrets();
      } catch (err) {
        assert.instanceOf(err, error.AwsSecretError);
        const secretError = err as error.AwsSecretError;
        assert.strictEqual((secretError.data as any)['errorType'], codeString);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will fail when the when the secret string cannot be parsed as JSON', async () => {
      secretsManagerMock
        .on(GetSecretValueCommand)
        .resolves({SecretString: '{bad}'});
      const secretManager = new SecretManager('testSecretName');
      let errored = false;
      try {
        await secretManager.getSecrets();
      } catch (err) {
        assert.instanceOf(err, error.AwsSecretError);
        const secretError = err as error.AwsSecretError;
        assert.strictEqual(
          (secretError.data as any)['errorType'],
          'Secrets are not valid JSON'
        );
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});
