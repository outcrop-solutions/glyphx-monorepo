import {assert} from 'chai';
import {BasicFieldTypeCalculator} from '@fieldProcessing';
import Stream from 'stream';
import {error} from '@glyphx/core';
import {fileIngestion} from '@glyphx/types';

describe('#fieldProcessing/BasicFieldTypeCalculator', () => {
  context('ProcessItemsSync', () => {
    it('will process individual strings', () => {
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      for (let i = 0; i < 10000; i++) {
        fieldCalculator.processItemsSync(`value${i}`);
      }

      fieldCalculator.finish();

      assert.strictEqual(
        fieldCalculator.fieldType,
        fileIngestion.constants.FIELD_TYPE.STRING
      );
      assert.isTrue(fieldCalculator.allItemsProcessed);
      assert.strictEqual(fieldCalculator.numberPassed, 10000);
      assert.strictEqual(fieldCalculator.samplesAnalyzed, 10000);
      assert.strictEqual(fieldCalculator.fieldName, 'field1');
      assert.strictEqual(fieldCalculator.fieldIndex, 1);
      assert.strictEqual(fieldCalculator['numberOfStrings'], 10000);
      assert.strictEqual(fieldCalculator['numberOfNumbers'], 0);
    });
    it('will process an array of strings', () => {
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      const strs: string[] = [];
      for (let i = 0; i < 10000; i++) {
        strs.push(`value${i}`);
      }

      fieldCalculator.processItemsSync(strs);
      fieldCalculator.finish();
      assert.strictEqual(
        fieldCalculator.fieldType,
        fileIngestion.constants.FIELD_TYPE.STRING
      );
      assert.isTrue(fieldCalculator.allItemsProcessed);
      assert.strictEqual(fieldCalculator.numberPassed, 10000);
      assert.strictEqual(fieldCalculator.samplesAnalyzed, 10000);
      assert.strictEqual(fieldCalculator.fieldName, 'field1');
      assert.strictEqual(fieldCalculator.fieldIndex, 1);
      assert.strictEqual(fieldCalculator['numberOfStrings'], 10000);
      assert.strictEqual(fieldCalculator['numberOfNumbers'], 0);
    });
  });
  context('processItems', () => {
    it('will process a stream of strings', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);

      for (let i = 0; i < 10000; i++) {
        rStream.push(`value${i}`);
      }

      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.STRING
        );
        assert.isTrue(fieldCalculator.allItemsProcessed);
        assert.strictEqual(fieldCalculator.numberPassed, 10000);
        assert.strictEqual(fieldCalculator.samplesAnalyzed, 10000);
        assert.strictEqual(fieldCalculator.fieldName, 'field1');
        assert.strictEqual(fieldCalculator.fieldIndex, 1);
        assert.strictEqual(fieldCalculator['numberOfStrings'], 10000);
        assert.strictEqual(fieldCalculator['numberOfNumbers'], 0);
        done();
      });
    });

    it('will process a stream of numbers', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);

      for (let i = 0; i < 10000; i++) {
        rStream.push(`${i}`);
      }

      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.NUMBER
        );
        assert.isTrue(fieldCalculator.allItemsProcessed);
        assert.strictEqual(fieldCalculator.numberPassed, 10000);
        assert.strictEqual(fieldCalculator.samplesAnalyzed, 10000);
        assert.strictEqual(fieldCalculator.fieldName, 'field1');
        assert.strictEqual(fieldCalculator.fieldIndex, 1);
        assert.strictEqual(fieldCalculator['numberOfStrings'], 0);
        assert.strictEqual(fieldCalculator['numberOfNumbers'], 10000);
        done();
      });
    });

    it('will process a stream of dates', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);

      for (let i = 0; i < 10000; i++) {
        rStream.push(new Date().toISOString());
      }

      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.DATE
        );
        assert.isTrue(fieldCalculator.allItemsProcessed);
        assert.strictEqual(fieldCalculator.numberPassed, 10000);
        assert.strictEqual(fieldCalculator.samplesAnalyzed, 10000);
        assert.strictEqual(fieldCalculator.fieldName, 'field1');
        assert.strictEqual(fieldCalculator.fieldIndex, 1);
        assert.strictEqual(fieldCalculator['numberOfStrings'], 0);
        assert.strictEqual(fieldCalculator['numberOfDates'], 10000);
        done();
      });
    });

    it('will process a stream of dates and strings more strings', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);

      for (let i = 0; i < 10000; i++) {
        if (i % 2) rStream.push(new Date().toISOString());
        else rStream.push(`value${1}`);
      }

      rStream.push('value10001');
      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.STRING
        );
        done();
      });
    });
    it('will process a stream of numbers and strings more strings', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);

      for (let i = 0; i < 10000; i++) {
        if (i % 2) rStream.push(`${i}`);
        else rStream.push(`value${1}`);
      }

      rStream.push('value10001');
      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.STRING
        );
        done();
      });
    });
    it('will process a stream of numbers and strings more numbers', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);
      //The cutoff is .65% so we will need to add
      for (let i = 0; i < 14286; i++) {
        if (i % 2 || i >= 10000) rStream.push(`${i}`);
        else rStream.push(`value${1}`);
      }

      rStream.push('10001');
      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.NUMBER
        );
        done();
      });
    });
    it('will process a stream of dates and strings more dates', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);
      //The cutoff is .65% so we will need to add
      for (let i = 0; i < 14286; i++) {
        if (i % 2 || i >= 10000) rStream.push(new Date().toISOString());
        else rStream.push(`value${1}`);
      }

      rStream.push(new Date().toISOString());
      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.DATE
        );
        done();
      });
    });

    it('will process a stream of dates and  numbers more dates', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);
      //The cutoff is .65% so we will need to add
      for (let i = 0; i < 14286; i++) {
        if (i % 2 || i >= 10000) rStream.push(new Date().toISOString());
        else rStream.push(`${i}`);
      }

      rStream.push(new Date().toISOString());
      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.DATE
        );
        done();
      });
    });

    it('will process a stream of dates and  numbers more numbers', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);
      //The cutoff is .65% so we will need to add
      for (let i = 0; i < 14286; i++) {
        if (i % 2 || i >= 10000) rStream.push(`${i}`);
        else rStream.push(new Date().toISOString());
      }

      rStream.push('10001');
      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.NUMBER
        );
        done();
      });
    });
    it('will process a stream of numbers and strings strings win ties', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);

      for (let i = 0; i < 10000; i++) {
        if (i % 2) rStream.push(`${i}`);
        else rStream.push(`value${1}`);
      }

      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.STRING
        );
        done();
      });
    });

    it('will process a stream of strings strings with sample rate at .5', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 0.5);

      fieldCalculator.processItems(rStream);

      for (let i = 0; i < 10000; i++) {
        rStream.push(`value${1}`);
      }

      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.STRING
        );
        assert.strictEqual(fieldCalculator.sampleRate, 0.5);
        assert.strictEqual(fieldCalculator.numberPassed, 10000);
        assert.strictEqual(fieldCalculator.samplesAnalyzed, 5000);
        done();
      });
    });

    it('will publish interim results before reading all data', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);
      let counter = 0;
      rStream.on('data', () => {
        if (counter === 99) {
          let fieldType = fileIngestion.constants.FIELD_TYPE.UNKNOWN;
          assert.isTrue(fieldCalculator.hasProcessedItems);
          assert.doesNotThrow(() => {
            fieldType = fieldCalculator.fieldType;
          }, error.InvalidOperationError);
          assert.strictEqual(
            fieldType,
            fileIngestion.constants.FIELD_TYPE.STRING
          );
        }

        counter++;
      });

      for (let i = 0; i < 10000; i++) {
        rStream.push(`value${1}`);
      }

      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.STRING
        );
        done();
      });
    });
    it('will throw InvalidOperationError before an interim result is published', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 1);

      fieldCalculator.processItems(rStream);
      let counter = 0;
      rStream.on('data', () => {
        if (counter < 9) {
          assert.isFalse(fieldCalculator.hasProcessedItems);
          assert.throws(() => {
            fieldCalculator.fieldType;
          }, error.InvalidOperationError);
          assert.throws(() => {
            fieldCalculator.numberPassed;
          }, error.InvalidOperationError);
          assert.throws(() => {
            fieldCalculator.numberPassed;
          }, error.InvalidOperationError);
          assert.throws(() => {
            fieldCalculator.samplesAnalyzed;
          }, error.InvalidOperationError);
        }

        counter++;
      });

      for (let i = 0; i < 10000; i++) {
        rStream.push(`value${1}`);
      }

      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.STRING
        );
        done();
      });
    });

    it('will process a small stream of strings', done => {
      const rStream = new Stream.Readable();
      const fieldCalculator = new BasicFieldTypeCalculator('field1', 1, 0.5);

      fieldCalculator.processItems(rStream);

      for (let i = 0; i < 10; i++) {
        rStream.push(`value${i}`);
      }

      rStream.push(null);

      //this is a new pattern for us.  Notice above that the second argument
      //of it is taking the parameter done. This allows us to control when done
      //is called.  So now we can wait for our stream to complete and we can
      //evaluate the results of our BasicFieldTypeCalculator.
      rStream.once('end', () => {
        assert.strictEqual(
          fieldCalculator.fieldType,
          fileIngestion.constants.FIELD_TYPE.STRING
        );
        assert.isTrue(fieldCalculator.allItemsProcessed);
        assert.strictEqual(fieldCalculator.numberPassed, 10);
        assert.strictEqual(fieldCalculator.samplesAnalyzed, 10);
        assert.strictEqual(fieldCalculator.fieldName, 'field1');
        assert.strictEqual(fieldCalculator.fieldIndex, 1);
        assert.strictEqual(fieldCalculator['numberOfStrings'], 10);
        assert.strictEqual(fieldCalculator['numberOfNumbers'], 0);
        assert.strictEqual(fieldCalculator.sampleRate, 0.5);
        done();
      });
    });
  });
});
