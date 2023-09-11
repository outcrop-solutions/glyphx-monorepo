import {assert} from 'chai';
import {GlyphxError} from '../../error';

// https://stackoverflow.com/questions/68331836/get-arguments-of-constructor-in-js-class
function getClassContructorParams(obj: any): string[] {
  let retval = [];
  const match = obj.toString().match(/constructor\((.+?)\)/);

  if (match && match[1]) {
    retval = match[1].split(',').map((m: string) => m.trim());
  }

  // If no match
  return retval;
}

const KNOWN_REQUIRED_PARAMETERS = ['message', 'innerError', 'errorCode'];

export interface IErrorTestingParameters extends Record<string, unknown> {
  message: string;
  innerError: unknown;
  errorCode: number;
}

export function testError(errorToTest: any, params: IErrorTestingParameters, allow999 = false) {
  assert.isNotEmpty(params.message);
  assert.exists(params.innerError);
  assert.exists(params.errorCode);
  assert.isAbove(params.errorCode, 0);
  if (!allow999) assert.isBelow(params.errorCode, 999);
  const constructorParameters = getClassContructorParams(errorToTest);
  constructorParameters.forEach((p) => {
    if (!KNOWN_REQUIRED_PARAMETERS.find((n) => n === p)) {
      assert.exists(params[p], p);
    }
  });
  let innerErrorIndex = 0;
  const values: unknown[] = [];
  constructorParameters.forEach((p: string) => {
    if (p !== 'innerError') innerErrorIndex++;
    values.push(params[p]);
  });

  //Test all parameters
  const err = new errorToTest(...values);

  assert.instanceOf(err, GlyphxError);
  assert.strictEqual(err['message'], params.message);
  assert.strictEqual(err['errorCode'], params.errorCode);
  assert.strictEqual(err['innerError'], params.innerError);
  for (const key in params) {
    if (KNOWN_REQUIRED_PARAMETERS.find((p) => p === key)) {
      continue;
    }
    assert.strictEqual(err['data'][key], params[key], key);
  }

  //everyting from inner exception up should be optional so we are going to loop
  //through constructing objects to keep code coverage off of our backs
  for (let i = innerErrorIndex; i < constructorParameters.length; i++) {
    const subValues: unknown[] = [];
    const subsetOfParamNames = constructorParameters.slice(0, i);
    subsetOfParamNames.forEach((p: string) => {
      subValues.push(params[p]);
    });
    assert.doesNotThrow(() => {
      const err2 = new errorToTest(...subValues);
      assert.instanceOf(err2, GlyphxError);
    });
  }
}
