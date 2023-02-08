import 'mocha';
import {assert} from 'chai';

describe( 'general tests', () => {
   context( 'Tests to test testing', () => {
	it( 'is true', () => {
		assert.isTrue(true);
	});
	it( 'is false', () => {
		assert.isFalse(false);
	});
   });
});
