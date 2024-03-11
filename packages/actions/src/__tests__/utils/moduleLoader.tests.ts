import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
//@ts-ignore
import proxyrequire from 'proxyquire';

describe('#utils/moduleLoader', () => {
  let sandbox = createSandbox();
  afterEach(() => {
    sandbox.restore();
  });
  context('constructor', () => {
    it('should load the module from our local .next/server/chunks/server/pkg directory ', () => {
      let dlOpenStub = sandbox.stub();
      dlOpenStub.callsFake((module: any, modulePath: string) => {
        module.foo = () => 'bar';
      });

      let cwdStub = sandbox.stub();
      cwdStub.returns('test');

      let existsSyncStub = sandbox.stub();
      existsSyncStub.returns(true);

      let pr = proxyrequire('../../utils/moduleLoader', {
        'node:process': {
          dlopen: dlOpenStub,
          cwd: cwdStub,
        },

        'node:fs': {
          existsSync: existsSyncStub,
        },
      });

      let def = pr.default;
      class test extends def<any> {
        constructor() {
          super('test.node', {});
        }
      }

      let t = new test() as any;
      assert.isDefined(t);
      assert.isTrue(dlOpenStub.calledOnce);
      assert.isTrue(cwdStub.calledOnce);
      assert.isTrue(existsSyncStub.calledTwice);

      let mod = t.module;
      assert.isDefined(module);
      assert.equal(mod.foo(), 'bar');
      //we are running locally so this should default to our happy
      //server path
      assert.strictEqual(t.modulePath, 'test/.next/server/chunks/server/pkg/test.node');
    });

    it('should load the module from our vercel .next/server/pkg directory ', () => {
      let dlOpenStub = sandbox.stub();
      dlOpenStub.callsFake((module: any, modulePath: string) => {
        module.foo = () => 'bar';
      });

      let cwdStub = sandbox.stub();
      cwdStub.returns('test');

      let existsSyncStub = sandbox.stub();
      existsSyncStub.returns(true);
      existsSyncStub.onFirstCall().returns(false);

      let pr = proxyrequire('../../utils/moduleLoader', {
        'node:process': {
          dlopen: dlOpenStub,
          cwd: cwdStub,
        },

        'node:fs': {
          existsSync: existsSyncStub,
        },
      });

      let def = pr.default;
      class test extends def<any> {
        constructor() {
          super('test.node', {});
        }
      }

      let t = new test() as any;
      assert.isDefined(t);
      assert.isTrue(dlOpenStub.calledOnce);
      assert.isTrue(cwdStub.calledOnce);
      assert.isTrue(existsSyncStub.callCount === 3);

      let mod = t.module;
      assert.isDefined(module);
      assert.equal(mod.foo(), 'bar');
      //we are running locally so this should default to our happy
      //server path
      assert.strictEqual(t.modulePath, 'test/.next/server/pkg/test.node');
    });

    it('should load the module from our local pkg directory for testing ', () => {
      let dlOpenStub = sandbox.stub();
      dlOpenStub.callsFake((module: any, modulePath: string) => {
        module.foo = () => 'bar';
      });

      let cwdStub = sandbox.stub();
      cwdStub.returns('test');

      let existsSyncStub = sandbox.stub();
      existsSyncStub.returns(true);
      existsSyncStub.onFirstCall().returns(false);
      existsSyncStub.onSecondCall().returns(false);

      let pr = proxyrequire('../../utils/moduleLoader', {
        'node:process': {
          dlopen: dlOpenStub,
          cwd: cwdStub,
        },

        'node:fs': {
          existsSync: existsSyncStub,
        },
      });

      let def = pr.default;
      class test extends def<any> {
        constructor() {
          super('test.node', {});
        }
      }

      let t = new test() as any;
      assert.isDefined(t);
      assert.isTrue(dlOpenStub.calledOnce);
      assert.isTrue(cwdStub.calledOnce);
      assert.isTrue(existsSyncStub.callCount === 3);

      let mod = t.module;
      assert.isDefined(module);
      assert.equal(mod.foo(), 'bar');
      //we are running locally so this should default to our happy
      //server path
      assert.strictEqual(t.modulePath, 'test/pkg/test.node');
    });

    it('should throw an exception when the module does not exist ', () => {
      let dlOpenStub = sandbox.stub();
      dlOpenStub.callsFake((module: any, modulePath: string) => {
        module.foo = () => 'bar';
      });

      let cwdStub = sandbox.stub();
      cwdStub.returns('test');

      let existsSyncStub = sandbox.stub();
      existsSyncStub.onFirstCall().returns(true);
      existsSyncStub.onSecondCall().returns(false);

      let pr = proxyrequire('../../utils/moduleLoader', {
        'node:process': {
          dlopen: dlOpenStub,
          cwd: cwdStub,
        },

        'node:fs': {
          existsSync: existsSyncStub,
        },
      });

      let def = pr.default;
      class test extends def<any> {
        constructor() {
          super('test.node', {});
        }
      }

      assert.throws(() => {
        let t = new test() as any;
      }, 'Module test.node does not exist');

      assert.isTrue(dlOpenStub.notCalled);
      assert.isTrue(cwdStub.calledOnce);
      assert.isTrue(existsSyncStub.callCount === 2);
    });
  });
});
