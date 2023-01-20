import {SecretManager} from '../aws';
import {SecretsManager} from '@aws-sdk/client-secrets-manager';
import 'reflect-metadata';
import {InvalidOperationError} from '../error';
export interface ISecretBoundObject extends Record<string, any> {
  secretName: string;
  secretManager: SecretManager;
}
interface IPropertyDefinition {
  secretName: string;
  propertyName: string;
  setByDecorator: boolean;
  extractor: (input: any) => any;
  setter: (input: any) => void;
}
function mapProperties(
  secretBoundObject: Record<string, any>
): Map<string, IPropertyDefinition> {
  const retval = new Map<string, IPropertyDefinition>();
  for (const key in secretBoundObject.__proto__) {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(
      secretBoundObject.__proto__,
      key
    );

    //in this version only properties can be mapped
    if (!propertyDescriptor || !propertyDescriptor.set) continue;

    const isBindable = Reflect.getMetadata(
      'boundSecrets:isBound',
      secretBoundObject,
      key
    );
    //eslint-disable-next-line
    if (isBindable == false) continue;

    //This is a property that was not bound with a decorator
    if (isBindable == undefined) {
      if (retval.get(key)) continue;
      retval.set(key, {
        propertyName: key,
        extractor: (input: any) => {
          return input[key];
        },
        setter: propertyDescriptor.set,
        setByDecorator: false,
        secretName: key,
      });
    } else {
      const extractor = Reflect.getMetadata(
        'boundSecrets:extractor',
        secretBoundObject,
        key
      );

      const secretName = Reflect.getMetadata(
        'boundSecrets:secretName',
        secretBoundObject,
        key
      );

      const existingMap = retval.get(secretName);
      if (existingMap?.setByDecorator)
        throw new InvalidOperationError(
          `A property with secret name : ${secretName} has already been defined`,
          {secretName: secretName}
        );

      if (existingMap) retval.delete(secretName);

      retval.set(secretName, {
        propertyName: key,
        extractor: extractor,
        setter: propertyDescriptor.set,
        setByDecorator: true,
        secretName: secretName,
      });
    }
  }

  return retval;
}

export async function secretBinder(secretBoundObject: ISecretBoundObject) {
  const propertyMap = mapProperties(secretBoundObject);

  const secrets = await secretBoundObject.secretManager.getSecrets();
  const keys = Object.keys(secrets);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const mappedPropertyDef = propertyMap.get(key);
    if (!mappedPropertyDef) continue;
    const value = mappedPropertyDef.extractor(secrets);

    mappedPropertyDef.setter(value);

    //1.  Look for a decorated member with the name
    //2.  Look for a decorated member with a true and same name
    //3.  Look for a decorated member without a false and the name
  }
}
