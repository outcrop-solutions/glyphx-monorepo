import {SecretManager} from '../aws';
import 'reflect-metadata';
export interface ISecretBoundObject extends Record<string, any> {
  secretName: string;
  secretManager: SecretManager;
}

//snagged this form here: https://stackoverflow.com/questions/51267554/accessing-a-objects-non-enumerable-properties
function getPropertyNames(obj: any, prev: string[] = []): string[] {
  if (obj) {
    return getPropertyNames(
      obj.prototype || obj.__proto__,
      prev.concat(Object.getOwnPropertyNames(obj))
    );
  }
  return prev.sort();
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
  const propNames = getPropertyNames(secretBoundObject);
  const retval = new Map<string, IPropertyDefinition>();
  for (let i = 0; i < propNames.length; i++) {
    const key = propNames[i];
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
    /*eslint-disable-next-line eqeqeq*/
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

    mappedPropertyDef.setter.bind(secretBoundObject)(value);
  }
}
