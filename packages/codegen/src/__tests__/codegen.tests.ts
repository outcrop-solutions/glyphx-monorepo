import 'mocha';
import path from 'node:path';
import ts from 'typescript';
import fs from 'fs-extra';
import { assert } from 'chai';
import { createSandbox } from 'sinon';
import { CodeGenerator } from '../generator/codeGenerator';
import { error } from '@glyphx/core';

describe('#codegen/generator', () => {
  context('generator', () => {
    const dbDir = path.resolve(__dirname, './mocks');
    let codeGen: any;
    let sandbox: sinon.SinonSandbox;
    let checker: ts.TypeChecker;

    before(async () => {
      sandbox = createSandbox();
      codeGen = new CodeGenerator(dbDir);
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('generator/processFiles', () => {
      it('should create a ts program from the db directory when the folder is flat', async () => {
        const fsReaddirStub = sandbox.stub(fs, 'readdir');
        fsReaddirStub.resolves(['file1', 'file2']);

        // force fs.stat to call process and parse
        const fsStatStub = sandbox.stub(fs, 'stat');
        fsStatStub.onFirstCall().resolves({
          isDirectory: () => false, // directory for the first call
          isFile: () => false,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isSymbolicLink: () => false,
          isFIFO: () => false,
          isSocket: () => false,
        });
        fsStatStub.onSecondCall().resolves({
          isDirectory: () => false, // file for the second call
          isFile: () => true,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isSymbolicLink: () => false,
          isFIFO: () => false,
          isSocket: () => false,
        });

        const parseFileStub = sandbox.stub();
        parseFileStub.resolves();
        sandbox.replace(codeGen, 'parseFile', parseFileStub);

        const createProgramStub = sandbox.stub();
        createProgramStub.returns({});
        sandbox.replace(ts, 'createProgram', createProgramStub);

        // Creating spy for processFiles
        const processFilesSpy = sandbox.spy(codeGen, 'processFiles');

        fsStatStub.onFirstCall().resolves({ isDirectory: () => false });
        fsStatStub.onSecondCall().resolves({ isDirectory: () => false });

        let errored = false;
        try {
          await codeGen.processFiles(dbDir);
        } catch (error) {
          errored = true;
        }
        assert.isFalse(errored);
        assert.isTrue(processFilesSpy.calledOnce);
        assert.isTrue(parseFileStub.calledTwice);
        assert.isFalse(errored);
      });
      it('should throw a CodeGenError when dbDir is not provided (readdir fails)', async () => {
        const errMessage = 'An error occurred while generating the db boilerplate, See inner error for details';
        const err = new error.CodeGenError(errMessage, {});

        const fsReaddirStub = sandbox.stub(fs, 'readdir');
        fsReaddirStub.rejects();

        let errored = false;
        try {
          await codeGen.processFiles();
        } catch (e) {
          assert.instanceOf(e, error.CodeGenError);
          errored = true;
        }
        assert.isTrue(errored);
        assert.isTrue(fsReaddirStub.calledOnce);
      });
      it('should throw a CodeGenError when ts compiler throws', async () => {
        const fsReaddirStub = sandbox.stub(fs, 'readdir');
        fsReaddirStub.resolves(['file1', 'file2']);

        // force fs.stat to call process and parse
        const fsStatStub = sandbox.stub(fs, 'stat');
        fsStatStub.onFirstCall().resolves({
          isDirectory: () => false,
          isFile: () => false,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isSymbolicLink: () => false,
          isFIFO: () => false,
          isSocket: () => false,
        });
        fsStatStub.onSecondCall().resolves({
          isDirectory: () => false,
          isFile: () => true,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isSymbolicLink: () => false,
          isFIFO: () => false,
          isSocket: () => false,
        });

        const parseFileStub = sandbox.stub();
        parseFileStub.resolves();
        sandbox.replace(codeGen, 'parseFile', parseFileStub);

        // ts compiler fails
        const createProgramStub = sandbox.stub();
        createProgramStub.throws();
        sandbox.replace(ts, 'createProgram', createProgramStub);

        // Creating spy for processFiles
        const processFilesSpy = sandbox.spy(codeGen, 'processFiles');

        fsStatStub.onFirstCall().resolves({ isDirectory: () => false });
        fsStatStub.onSecondCall().resolves({ isDirectory: () => false });

        let errored = false;
        try {
          await codeGen.processFiles(dbDir);
        } catch (e) {
          assert.instanceOf(e, error.CodeGenError);
          errored = true;
        }
        assert.isTrue(errored);
        assert.isTrue(fsReaddirStub.calledOnce);
        assert.isTrue(processFilesSpy.calledOnce);
        assert.isTrue(parseFileStub.notCalled);
      });
      it('should publish a FileParseError when underlying function call throws one', async () => {
        const errMessage = 'An error occurred while parsing the interface file, See inner error for details';
        const err = new error.FileParseError(errMessage, {});
        const fsReaddirStub = sandbox.stub(fs, 'readdir');
        fsReaddirStub.resolves(['file1', 'file2']);

        // force fs.stat to call process and parse
        const fsStatStub = sandbox.stub(fs, 'stat');
        fsStatStub.onFirstCall().resolves({
          isDirectory: () => false, // directory for the first call
          isFile: () => false,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isSymbolicLink: () => false,
          isFIFO: () => false,
          isSocket: () => false,
        });
        fsStatStub.onSecondCall().resolves({
          isDirectory: () => false, // file for the second call
          isFile: () => true,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isSymbolicLink: () => false,
          isFIFO: () => false,
          isSocket: () => false,
        });

        const createProgramStub = sandbox.stub();
        createProgramStub.returns({});
        sandbox.replace(ts, 'createProgram', createProgramStub);

        const parseFileStub = sandbox.stub();
        parseFileStub.throws(err);
        sandbox.replace(codeGen, 'parseFile', parseFileStub);

        // Creating spy for processFiles
        const processFilesSpy = sandbox.spy(codeGen, 'processFiles');

        fsStatStub.onFirstCall().resolves({ isDirectory: () => false });
        fsStatStub.onSecondCall().resolves({ isDirectory: () => false });

        function fakePublish() {
          /*eslint-disable  @typescript-eslint/ban-ts-comment */
          //@ts-ignore
          assert.instanceOf(this, error.FileParseError);
          //@ts-ignore
          assert.strictEqual(this.message, errMessage);
        }

        const boundPublish = fakePublish.bind(err);
        const publishOverride = sandbox.stub();
        publishOverride.callsFake(boundPublish);
        sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

        let errored = false;
        try {
          await codeGen.processFiles(dbDir);
        } catch (e) {
          errored = true;
        }
        assert.isFalse(errored);
        assert.isTrue(processFilesSpy.calledOnce);
        assert.isTrue(parseFileStub.calledTwice);
      });
      it('should publish a FileParseError when underlying function call throws one', async () => {
        const errMessage = 'An error occurred while extracting the interface definition, See inner error for details';
        const err = new error.TypeCheckError(errMessage, {});
        const fsReaddirStub = sandbox.stub(fs, 'readdir');
        fsReaddirStub.resolves(['file1', 'file2']);

        // force fs.stat to call process and parse
        const fsStatStub = sandbox.stub(fs, 'stat');
        fsStatStub.onFirstCall().resolves({
          isDirectory: () => false, // directory for the first call
          isFile: () => false,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isSymbolicLink: () => false,
          isFIFO: () => false,
          isSocket: () => false,
        });
        fsStatStub.onSecondCall().resolves({
          isDirectory: () => false, // file for the second call
          isFile: () => true,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isSymbolicLink: () => false,
          isFIFO: () => false,
          isSocket: () => false,
        });

        const createProgramStub = sandbox.stub();
        createProgramStub.returns({});
        sandbox.replace(ts, 'createProgram', createProgramStub);

        const parseFileStub = sandbox.stub();
        parseFileStub.throws(err);
        sandbox.replace(codeGen, 'parseFile', parseFileStub);

        // Creating spy for processFiles
        const processFilesSpy = sandbox.spy(codeGen, 'processFiles');

        fsStatStub.onFirstCall().resolves({ isDirectory: () => false });
        fsStatStub.onSecondCall().resolves({ isDirectory: () => false });

        function fakePublish() {
          /*eslint-disable  @typescript-eslint/ban-ts-comment */
          //@ts-ignore
          assert.instanceOf(this, error.TypeCheckError);
          //@ts-ignore
          assert.strictEqual(this.message, errMessage);
        }

        const boundPublish = fakePublish.bind(err);
        const publishOverride = sandbox.stub();
        publishOverride.callsFake(boundPublish);
        sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

        let errored = false;
        try {
          await codeGen.processFiles(dbDir);
        } catch (e) {
          errored = true;
        }
        assert.isFalse(errored);
        assert.isTrue(processFilesSpy.calledOnce);
        assert.isTrue(parseFileStub.calledTwice);
      });
    });

    context('generator/parseFile', () => {
      it('should use a ts program to get a source file and run extractTypes over the AST', () => {});
      it('should throw a TypeCheckError when ts compiler throws', () => {});
      it('should throw a TypeCheckError when underlying function call throws one', () => {});
      it('should throw a FileParseError error when ts compiler throws', () => {});
    });

    context('generator/extractTypes', () => {
      it('should extract interface member types from a interface definition file', () => {});
      it('should throw a TypeCheckError when ts compiler throws', () => {});
      it('should throw a TypeCheckError when underlying function call throws one', () => {});
    });

    context('generator/getInterfaceName', () => {
      it('should extract interface name from a interface definition file', () => {});
      it('should throw a TypeCheckError when the name cannot be extracted', () => {});
    });

    context('generator/getInterfaceProperties', () => {
      it('should extract interface properties from a interface definition file', () => {});
      it('should throw a TypeCheckError when the ts compiler throws', () => {});
    });

    context('generator/getInterfaceRelationships', () => {
      it('should extract interface relationships from a interface definition file', () => {});
      it('should throw a TypeCheckError when the ts compiler throws', () => {});
    });
  });
});
