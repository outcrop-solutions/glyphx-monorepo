import 'mocha';
import {assert} from 'chai';
import {GlyphxError} from '../../error';
import {createSandbox} from 'sinon';
import {ERROR_SEVERITY, ErrorCodes} from '../../constants';
import {Logger} from '../../logging';
class Foo {
  f: string;
  private b: string;
  //eslint-disable-next-line
  private c: any;

  get valueOfB(): string {
    return this.b;
  }

  set valueOfB(value: string) {
    this.b = value;
  }

  //eslint-disable-next-line
  get valueOfC(): any {
    return this.c;
  }

  constructor() {
    this.f = 'foo';
    this.b = 'bar';

    this.c = {
      hi: 'hello',
      mom: 'mother',
    };
  }

  getFooBar() {
    console.log(`${this.f} ${this.b}`);
  }
}

describe('#util/error', () => {
  context('serialize', () => {
    let glyphxError: GlyphxError;
    before(() => {
      glyphxError = new GlyphxError('this is my error', 999);
    });

    it('should serialize an error', () => {
      const message = 'I am an inner error';
      const err = new Error(message);
      const serialized = glyphxError['serialize'](err);
      assert.strictEqual(serialized.message, message);
      assert.isOk(serialized.stack);
      assert.isOk(serialized.name);
    });

    it('should serialize a class`', () => {
      const cls = new Foo();
      const serialized = glyphxError['serialize'](cls);
      assert.strictEqual(serialized.f, cls.f);
      assert.strictEqual(serialized.b, cls['b']);
      assert.strictEqual(serialized.valueOfB, cls['b']);
      assert.strictEqual(serialized.c.hi, 'hello');
      assert.strictEqual(serialized.valueOfC.hi, 'hello');
    });

    it('should serialize a JSON object', () => {
      const obj = {
        f: 'foo',
        b: 'bar',
      };
      const serialized = glyphxError['serialize'](obj);
      assert.strictEqual(serialized.f, 'foo');
      assert.strictEqual(serialized.b, 'bar');
    });

    it('should serialize an GlyphxError with an inner error', () => {
      const innerInnerError = 'I am an inner inner error';
      const innerError = new GlyphxError('I am the inner error', 999, innerInnerError);
      const serialized = glyphxError['serialize'](innerError);
      assert.strictEqual(serialized.innerError, innerInnerError);
    });
  });

  context('getInnerError', () => {
    it('should find an object as the inner error', () => {
      const obj = {
        f: 'foo',
        b: 'bar',
      };
      const err = new GlyphxError('I am an error', 999, obj);
      const serialized = err['getInnerError'](err.innerError);
      assert.strictEqual(serialized.serialized.f, 'foo');
      assert.strictEqual(serialized.serialized.b, 'bar');
    });
    it('should find a string as the inner error', () => {
      const str = 'i am the inner inner error';
      const err = new GlyphxError('I am an error', 999, str);
      const serialized = err['getInnerError'](err.innerError);
      assert.strictEqual(serialized.serialized, str);
    });
    it('should find a glyphxError as the inner error', () => {
      const innerError = new GlyphxError('i am the inner error', 998);
      const err = new GlyphxError('I am an error', 999, innerError);
      const serialized = err['getInnerError'](err.innerError);
      assert.strictEqual(serialized.message, innerError.message);
    });
    it('should find an glyphxError as the inner, inner error', () => {
      const innerInnerError = new GlyphxError('i am the inner inner error', 997);
      const innerError = new GlyphxError('i am the inner error', 998, innerInnerError);
      const err = new GlyphxError('I am an error', 999, innerError);
      const serialized = err['getInnerError'](err.innerError);
      assert.strictEqual(serialized.innerError.message, innerInnerError.message);
    });
  });

  context('getMessage', () => {
    it('should get a well formed message with an object inner exception', () => {
      const obj = {
        f: 'foo',
        b: 'bar',
      };
      const message = 'I am an error';
      const errNumber = 999;
      const err = new GlyphxError(message, errNumber, obj);

      const formattedMessage = err['getMessage']();
      assert.isOk(formattedMessage);
      assert.strictEqual(formattedMessage.message, message);
      assert.strictEqual(
        //eslint-disable-next-line
        (formattedMessage.innerError as any).serialized.f,
        obj.f
      );
    });
  });

  context('getString', () => {
    it('shoiuld get a string representation of a message ', () => {
      const obj = {
        f: 'foo',
        b: 'bar',
      };
      const message = 'I am an error';
      const errNumber = 999;
      const err = new GlyphxError(message, errNumber, obj);

      const strMessage = err.getString();
      const formattedMessage = JSON.parse(strMessage);
      assert.isOk(formattedMessage);
      assert.strictEqual(formattedMessage.message, message);
      assert.strictEqual(
        //eslint-disable-next-line
        (formattedMessage.innerError as any).serialized.f,
        obj.f
      );
    });
  });

  context('publish', () => {
    let sandBox: sinon.SinonSandbox;
    before(async () => {
      sandBox = createSandbox();
      await Logger.init();
    });
    afterEach(() => {
      sandBox.restore();
    });

    it('should publish an info message to the console', () => {
      const obj = {
        f: 'foo',
        b: 'bar',
      };
      //this version of winston calls stdOut and not log
      //eslint-disable-next-line
      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      const err = new GlyphxError('I am an error', 999, obj);

      err.publish('correlationId', ERROR_SEVERITY.INFORMATION);
      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'info');
      assert.isOk(args.message);
      assert.strictEqual(args.message.body.name, 'GlyphxError');
      assert.strictEqual(args.message.body?.innerError?.serialized?.f, obj.f);
      assert.strictEqual(args.message.body?.innerError?.serialized?.b, obj.b);
    });

    it('should publish a warn message to the console', () => {
      const obj = {
        f: 'foo',
        b: 'bar',
      };
      //this version of winston calls stdOut and not log
      //eslint-disable-next-line
      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      const err = new GlyphxError('I am an error', 999, obj);

      err.publish('correlationId', ERROR_SEVERITY.WARNING);
      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'warn');
      assert.isOk(args.message);
      assert.strictEqual(args.message.body.name, 'GlyphxError');
      assert.strictEqual(args.message.body?.innerError?.serialized?.f, obj.f);
      assert.strictEqual(args.message.body?.innerError?.serialized?.b, obj.b);
    });

    it('should publish an error message to the console', () => {
      const obj = {
        f: 'foo',
        b: 'bar',
      };
      //this version of winston calls stdOut and not log
      //eslint-disable-next-line
      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      const err = new GlyphxError('I am an error', 999, obj);

      err.publish('correlationId', ERROR_SEVERITY.ERROR);
      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'error');
      assert.isOk(args.message);
      assert.strictEqual(args.message.body.name, 'GlyphxError');
      assert.strictEqual(args.message.body?.innerError?.serialized?.f, obj.f);
      assert.strictEqual(args.message.body?.innerError?.serialized?.b, obj.b);
    });

    it('should publish an error message to the console if a severity not in warn, info or error is passed', () => {
      const obj = {
        f: 'foo',
        b: 'bar',
      };
      //this version of winston calls stdOut and not log
      //eslint-disable-next-line
      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      const err = new GlyphxError('I am an error', 999, obj);

      err.publish('correlationId', ERROR_SEVERITY.FATAL);
      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'error');
      assert.isOk(args.message);
      assert.strictEqual(args.message.body.name, 'GlyphxError');
      assert.strictEqual(args.message.body?.innerError?.serialized?.f, obj.f);
      assert.strictEqual(args.message.body?.innerError?.serialized?.b, obj.b);
    });
    it('should publish an error message to the console when no severity or correlation id is included', () => {
      const obj = {
        f: 'foo',
        b: 'bar',
      };
      //this version of winston calls stdOut and not log
      //eslint-disable-next-line
      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      const err = new GlyphxError('I am an error', 999, obj);

      err.publish();
      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'error');
      assert.isOk(args.message);
      assert.strictEqual(args.message.body.name, 'GlyphxError');
      assert.strictEqual(args.message.body?.innerError?.serialized?.f, obj.f);
      assert.strictEqual(args.message.body?.innerError?.serialized?.b, obj.b);
    });
  });

  context('constructor', () => {
    it('should assign the constructor parameters', () => {
      const message = 'I am an error';
      const errorCode = 999;
      const innerError = 'I am the inner error';
      const name = 'ErrorName';

      const errorDescription = ErrorCodes.getResponseString(errorCode);
      const localCode = ErrorCodes.getResponseCode(errorDescription);

      const testError = new GlyphxError(message, errorCode, innerError, name);
      assert.strictEqual(testError.message, message);
      assert.strictEqual(testError.innerError, innerError);
      assert.strictEqual(testError.errorCode, localCode);
      assert.strictEqual(testError.innerError, innerError);
      assert.strictEqual(testError.errorDescription, errorDescription);
    });
  });
});
