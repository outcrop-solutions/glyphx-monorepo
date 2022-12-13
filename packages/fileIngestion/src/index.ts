import 'module-alias/register';
import {FIELD_TYPE} from '@util/constants';

const FTYPE = FIELD_TYPE.STRING;

console.log('Try npm run lint/fix!');

const LONG_STRING =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut aliquet diam.';

const TRAILING = 'Semicolon';

const WHY = 'am I tabbed?';

const ONE_MORE = 'error';
export function doSomeStuff(
  withThis: string,
  andThat: string,
  andThose: string[]
) {
  //function on one line
  if (!andThose.length) {
    return false;
  }
  console.log(withThis);
  console.log(andThat);
  console.dir(andThose);
  return;
}
// TODO: more examples
