import {SecretsManager} from '@aws-sdk/client-secrets-manager';
import {AwsSecretError} from '../error';

export class SecretManager {
  private readonly secretNameField: string;
  private readonly secretsManager: SecretsManager;
  public get secretName(): string {
    return this.secretNameField;
  }

  constructor(secretName: string) {
    let environment = 'dev';
    if (process.env.GLYPHX_ENV === 'prod') {
      environment = 'prod';
    } else if (process.env.GLYPHX_ENV === 'demo') {
      environment = 'demo';
    } else {
      environment = 'dev';
    }
    
    this.secretNameField = `${environment}/${secretName}`;

    //TODO: we need to figure out how we want to handle secret configurations
    this.secretsManager = new SecretsManager({});
  }

  public async getSecrets(): Promise<Record<string, any>> {
    try {
      //We need to pass in the secret so we can call this from our worker threads.
      const results = await this.secretsManager.getSecretValue({
        SecretId: this.secretName,
      });

      const secretString = results.SecretString as string;
      const retval = JSON.parse(secretString);
      return retval;
    } catch (err: any) {
      if (err.$fault)
        throw new AwsSecretError(
          `An error occurred while reading the secrets for ${this.secretName}.  See the inner exception for more information`,
          this.secretName,
          err.message,
          err
        ).publish();
      else
        throw new AwsSecretError(
          `An error occurred while reading the secrets for ${this.secretName}.  See the inner exception for more information`,
          this.secretName,
          'Secrets are not valid JSON',
          err
        );
    }
  }
}
