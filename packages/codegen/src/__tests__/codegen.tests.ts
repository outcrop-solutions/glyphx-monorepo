import 'mocha';
import path from 'node:path';
import ts from 'typescript';
import fs from 'fs-extra';
import {assert} from 'chai';
import Handlebars from 'handlebars';
import {createSandbox} from 'sinon';
import {CodeGenerator} from '../generator/codeGenerator';
import {error} from 'core';
import {databaseTypes} from 'types';
import {DEFAULT_CONFIG} from '../generator/config';

describe('#codegen/generator', () => {
  context('generator', () => {
    let codeGen: any;
    let sandbox: sinon.SinonSandbox;
    const config = DEFAULT_CONFIG;

    before(async () => {
      sandbox = createSandbox();
      codeGen = new CodeGenerator(config);
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('generator/processFiles', () => {
      it('should create a ts program from the db directory when the folder is flat', async () => {
        const dbDir = path.resolve(__dirname, './mocks');
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
        createProgramStub.returns({
          getTypeChecker() {
            return true;
          },
        });
        sandbox.replace(ts, 'createProgram', createProgramStub);

        // Creating spy for processFiles
        const processFilesSpy = sandbox.spy(codeGen, 'processFiles');

        fsStatStub.onFirstCall().resolves({isDirectory: () => false});
        fsStatStub.onSecondCall().resolves({isDirectory: () => false});

        let errored = false;
        try {
          await codeGen.processFiles(dbDir);
        } catch (error) {
          errored = true;
        }
        assert.isFalse(errored);
        assert.isTrue(processFilesSpy.calledOnce);
        assert.isTrue(parseFileStub.calledTwice);
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
        const dbDir = path.resolve(__dirname, './mocks');
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

        fsStatStub.onFirstCall().resolves({isDirectory: () => false});
        fsStatStub.onSecondCall().resolves({isDirectory: () => false});

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
        const dbDir = path.resolve(__dirname, './mocks');
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
        createProgramStub.returns({
          getTypeChecker() {
            return true;
          },
        });
        sandbox.replace(ts, 'createProgram', createProgramStub);

        const parseFileStub = sandbox.stub();
        parseFileStub.throws(err);
        sandbox.replace(codeGen, 'parseFile', parseFileStub);

        // Creating spy for processFiles
        const processFilesSpy = sandbox.spy(codeGen, 'processFiles');

        fsStatStub.onFirstCall().resolves({isDirectory: () => false});
        fsStatStub.onSecondCall().resolves({isDirectory: () => false});

        function fakePublish() {
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
    });

    context('generator/parseFile', () => {
      it('should use a ts program to get a source file and run extractTypes over the AST', async () => {
        const filePath = 'file1';
        const childNodes = [{} as ts.Statement, {} as ts.Statement];
        const mockSourceFile = {
          kind: 308,
          fileName: 'file1',
          text: '',
          moduleName: '',
          statements: childNodes as unknown as ts.NodeArray<ts.Statement>,
          languageVariant: 0,
          isDeclarationFile: false,
          hasNoDefaultLib: true,
          languageVersion: 99, // ESNEXT
        } as unknown as ts.SourceFile;
        const getSourceStub = sandbox.stub();
        getSourceStub.returns(mockSourceFile);

        const mockProgram = {
          getSourceFile: getSourceStub,
        } as unknown as ts.Program;

        const forEachChildStub = sandbox.stub(ts, 'forEachChild');

        let errored = false;
        try {
          await codeGen.parseFile(mockProgram, filePath);
        } catch (error) {
          errored = true;
        }

        assert.isFalse(errored);
        assert.isTrue(forEachChildStub.calledOnce);
      });
      it('should throw a FileParseError when program source is not found', async () => {
        const filePath = 'file1';
        const mockSourceFile = {
          kind: 308,
          fileName: 'file1',
          text: '',
          moduleName: '',
          statements: [] as unknown as ts.NodeArray<ts.Statement>,
          languageVariant: 0,
          isDeclarationFile: false,
          hasNoDefaultLib: true,
          languageVersion: 99, // ESNEXT
        } as unknown as ts.SourceFile;
        const getSourceStub = sandbox.stub();
        getSourceStub.returns(mockSourceFile);

        const mockProgram = {
          getSourceFile: getSourceStub,
        } as unknown as ts.Program;

        let errored = false;
        let retval;
        try {
          const retval = await codeGen.parseFile(mockProgram, filePath);
        } catch (e) {
          assert.instanceOf(e, error.FileParseError);
          errored = true;
        }

        assert.isUndefined(retval);
        assert.isFalse(errored);
        assert.isTrue(getSourceStub.calledOnce);
      });
      it('should throw a TypeCheckError when underlying extractTypes call throws one', async () => {
        const errMessage = 'An error occurred while extracting the interface definition, See inner error for details';
        const err = new error.TypeCheckError(errMessage, {});
        const filePath = 'file1';
        const mockSourceFile = {
          kind: 308,
          fileName: 'file1',
          text: '',
          moduleName: '',
          statements: [] as unknown as ts.NodeArray<ts.Statement>,
          languageVariant: 0,
          isDeclarationFile: false,
          hasNoDefaultLib: true,
          languageVersion: 99, // ESNEXT
        } as unknown as ts.SourceFile;
        const getSourceStub = sandbox.stub();
        getSourceStub.returns(mockSourceFile);

        const mockProgram = {
          getSourceFile: getSourceStub,
        } as unknown as ts.Program;

        function fakePublish() {
          //@ts-ignore
          assert.instanceOf(this, error.TypeCheckError);
          //@ts-ignore
          assert.strictEqual(this.message, errMessage);
        }

        const boundPublish = fakePublish.bind(err);
        const publishOverride = sandbox.stub();
        publishOverride.callsFake(boundPublish);
        sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

        const forEachChildStub = sandbox.stub(ts, 'forEachChild');
        forEachChildStub.throws(err);

        let errored = false;
        let retval;
        try {
          retval = await codeGen.parseFile(mockProgram, filePath);
        } catch (error) {
          errored = true;
        }

        assert.isNull(retval);
        assert.isFalse(errored);
        assert.isTrue(forEachChildStub.calledOnce);
      });
    });

    context('generator/extractTypes', () => {
      it('should extract types when node is an InterfaceDeclaration', async () => {
        const filePath = 'file1';
        const mockInterfaceName = 'MockInterface';
        const mockProperties = [] as any;
        const mockRelationships = [] as any;

        const mockNode = {
          kind: ts.SyntaxKind.InterfaceDeclaration,
        } as unknown as ts.Node;

        const isInterfaceDeclarationStub = sandbox.stub(ts, 'isInterfaceDeclaration');
        isInterfaceDeclarationStub.returns(true);

        const getInterfaceNameStub = sandbox.stub(codeGen, 'getInterfaceName');
        getInterfaceNameStub.returns(mockInterfaceName);

        const getInterfacePropertiesStub = sandbox.stub(codeGen, 'getInterfaceProperties');
        getInterfacePropertiesStub.returns(mockProperties);

        const getInterfaceRelationshipsStub = sandbox.stub(codeGen, 'getInterfaceRelationships');
        getInterfaceRelationshipsStub.returns(mockRelationships);

        const forEachChildStub = sandbox.stub(ts, 'forEachChild');

        let errored = false;
        try {
          await codeGen.extractTypes(filePath, mockNode);
        } catch (error) {
          errored = true;
        }

        assert.isFalse(errored);
        assert.isTrue(isInterfaceDeclarationStub.calledOnce);
        assert.isTrue(getInterfaceNameStub.calledOnce);
        assert.isTrue(getInterfacePropertiesStub.calledOnce);
        assert.isTrue(getInterfaceRelationshipsStub.calledOnce);
        assert.isTrue(forEachChildStub.calledOnce);
      });
      it('should run once when node is not an InterfaceDeclaration', async () => {
        //   TODO: get more granular with this
        const filePath = 'file1' as string;
        const nodeChild = {} as ts.Node; // child node

        const mockNode = {
          // This will simulate a node with one child
          forEachChild: (cb: (childNode: ts.Node) => void) => cb(nodeChild),
        } as unknown as ts.Node;

        const isInterfaceDeclarationStub = sandbox.stub(ts, 'isInterfaceDeclaration');
        isInterfaceDeclarationStub.onFirstCall().returns(false); // the node is not an InterfaceDeclaration

        let errored = false;
        try {
          await codeGen.extractTypes(filePath, mockNode);
        } catch (error) {
          errored = true;
        }

        assert.isFalse(errored);
        assert.isTrue(isInterfaceDeclarationStub.calledOnce);
      });
      it('should throw a TypeCheckError when getInterfaceName call throws one', async () => {
        const filePath = 'file1';
        const errMessage = 'An error occurred while extracting the interface definition, See inner error for details';
        const err = new error.TypeCheckError(errMessage, {});

        const mockNode = {
          kind: ts.SyntaxKind.InterfaceDeclaration,
        } as unknown as ts.Node;

        const isInterfaceDeclarationStub = sandbox.stub(ts, 'isInterfaceDeclaration');
        isInterfaceDeclarationStub.returns(true);

        const getInterfaceNameStub = sandbox.stub(codeGen, 'getInterfaceName');
        getInterfaceNameStub.throws(err);

        let errored = false;
        try {
          await codeGen.extractTypes(filePath, mockNode);
        } catch (e) {
          assert.instanceOf(e, error.TypeCheckError);
          errored = true;
        }

        assert.isFalse(errored);
        assert.isTrue(isInterfaceDeclarationStub.calledOnce);
        assert.isTrue(getInterfaceNameStub.calledOnce);
      });
      it('should throw a TypeCheckError when getInterfaceProperties call throws one', async () => {
        const filePath = 'file1';
        const errMessage = 'An error occurred while extracting the interface definition, See inner error for details';
        const err = new error.TypeCheckError(errMessage, {});
        const mockInterfaceName = 'MockInterface';
        const mockNode = {
          kind: ts.SyntaxKind.InterfaceDeclaration,
        } as unknown as ts.Node;

        const isInterfaceDeclarationStub = sandbox.stub(ts, 'isInterfaceDeclaration');
        isInterfaceDeclarationStub.returns(true);

        const getInterfaceNameStub = sandbox.stub(codeGen, 'getInterfaceName');
        getInterfaceNameStub.returns(mockInterfaceName);

        const getInterfacePropertiesStub = sandbox.stub(codeGen, 'getInterfaceProperties');
        getInterfacePropertiesStub.throws(err);

        let errored = false;
        try {
          await codeGen.extractTypes(filePath, mockNode);
        } catch (e) {
          assert.instanceOf(e, error.TypeCheckError);
          errored = true;
        }

        assert.isFalse(errored);
        assert.isTrue(isInterfaceDeclarationStub.calledOnce);
        assert.isTrue(getInterfaceNameStub.calledOnce);
        assert.isTrue(getInterfacePropertiesStub.calledOnce);
      });
      it('should throw a TypeCheckError when getInterfaceRelationships call throws one', async () => {
        const filePath = 'file1';
        const errMessage = 'An error occurred while extracting the interface definition, See inner error for details';
        const err = new error.TypeCheckError(errMessage, {});
        const mockInterfaceName = 'MockInterface';
        const mockProperties = [] as any;

        const mockNode = {
          kind: ts.SyntaxKind.InterfaceDeclaration,
        } as unknown as ts.Node;

        const isInterfaceDeclarationStub = sandbox.stub(ts, 'isInterfaceDeclaration');
        isInterfaceDeclarationStub.returns(true);

        const getInterfaceNameStub = sandbox.stub(codeGen, 'getInterfaceName');
        getInterfaceNameStub.returns(mockInterfaceName);

        const getInterfacePropertiesStub = sandbox.stub(codeGen, 'getInterfaceProperties');
        getInterfacePropertiesStub.returns(mockProperties);

        const getInterfaceRelationshipsStub = sandbox.stub(codeGen, 'getInterfaceRelationships');
        getInterfaceRelationshipsStub.throws(err);

        let errored = false;
        try {
          await codeGen.extractTypes(filePath, mockNode);
        } catch (e) {
          assert.instanceOf(e, error.TypeCheckError);
          errored = true;
        }

        assert.isFalse(errored);
        assert.isTrue(isInterfaceDeclarationStub.calledOnce);
        assert.isTrue(getInterfaceNameStub.calledOnce);
        assert.isTrue(getInterfacePropertiesStub.calledOnce);
        assert.isTrue(getInterfaceRelationshipsStub.calledOnce);
      });
    });

    context('generator/getInterfaceName', () => {
      it('should extract interface name from an interface definition file', async () => {
        const interfaceName = 'TestInterface';

        const mockNode = {
          name: {
            text: interfaceName,
          },
        } as unknown as ts.InterfaceDeclaration;

        const interfaceNameExtracted = codeGen.getInterfaceName(mockNode);

        assert.strictEqual(interfaceNameExtracted, interfaceName);
      });

      it('should throw an error when interface name extraction fails', async () => {
        const mockNode = {
          name: null,
        } as unknown as ts.InterfaceDeclaration;

        assert.throws(() => {
          codeGen.getInterfaceName(mockNode);
        }, error.TypeCheckError);
      });
    });

    context('generator/getInterfaceProperties', () => {
      it('should extract interface properties from an interface definition file', () => {
        const property = {
          name: {
            getText: () => 'propertyName',
          },
          type: 'propertyType',
          protected: false,
        };

        const checker = {
          getTypeAtLocation: () => 'type',
          typeToString: () => 'typeString',
        };

        const mockNode = {
          members: [property],
        } as unknown as ts.InterfaceDeclaration;

        const isPropertySignatureStub = sandbox.stub(ts, 'isPropertySignature');
        isPropertySignatureStub.returns(true);

        sandbox.stub(codeGen, 'checker').get(() => checker);

        const properties = codeGen.getInterfaceProperties(mockNode);

        assert.lengthOf(properties, 1);
        assert.deepEqual(properties[0], {
          name: 'propertyName',
          type: 'typeString',
          protected: false,
        });
      });

      it('should throw a TypeCheckError when the ts compiler throws', () => {
        const property = {
          name: {
            getText: () => {
              throw new Error('Compiler error');
            },
          },
          type: 'propertyType',
        };

        const mockNode = {
          members: [property],
        } as unknown as ts.InterfaceDeclaration;

        const isPropertySignatureStub = sandbox.stub(ts, 'isPropertySignature');
        isPropertySignatureStub.returns(true);

        assert.throws(() => {
          codeGen.getInterfaceProperties(mockNode);
        }, error.TypeCheckError);
      });
    });

    context('generator/getInterfaceRelationships', () => {
      it('should extract interface relationships from a interface definition file', () => {
        // Create a stub for the checker
        const checkerStub = {
          getSymbolAtLocation: sandbox.stub(),
        };
        // Return a symbol with a non-EnumDeclaration
        checkerStub.getSymbolAtLocation.onCall(0).returns({
          declarations: [
            {
              kind: ts.SyntaxKind.InterfaceDeclaration,
            },
          ],
        });
        checkerStub.getSymbolAtLocation.onCall(1).returns({
          declarations: [],
        });
        codeGen.checker = checkerStub as unknown as ts.TypeChecker;

        const getTextStub = sandbox.stub();

        getTextStub.onCall(0).returns('IUser');
        getTextStub.onCall(1).returns('IState');
        // Create a mock TypeReferenceNode for IUser
        const userTypeNode = {
          kind: ts.SyntaxKind.TypeReference,
          typeName: {
            text: 'IUser',
            kind: ts.SyntaxKind.Identifier,
            getText: () => 'IUser',
          },
        } as unknown as ts.TypeReferenceNode;

        // Create a mock TypeReferenceNode for IState[]
        const stateArrayTypeNode = {
          kind: ts.SyntaxKind.ArrayType,
          elementType: {
            kind: ts.SyntaxKind.TypeReference,
            typeName: {
              text: 'IState',
              kind: ts.SyntaxKind.Identifier,
              getText: () => 'IState',
            },
          },
        } as unknown as ts.TypeReferenceNode;

        // Create mock property signatures
        const mockProperties = [
          {
            type: userTypeNode,
            name: {text: 'user', kind: ts.SyntaxKind.PropertySignature},
          } as unknown as ts.PropertySignature,
          {
            type: stateArrayTypeNode,
            name: {text: 'states', kind: ts.SyntaxKind.PropertySignature},
          } as unknown as ts.PropertySignature,
        ];

        // Create a mock InterfaceDeclaration
        const mockNode = {
          members: mockProperties,
          name: {text: 'IComment', kind: ts.SyntaxKind.Identifier},
        } as unknown as ts.InterfaceDeclaration;

        // Create a stub for ts.isPropertySignature
        const isPropertySignatureStub = sandbox.stub(ts, 'isPropertySignature');

        // Make the stub return true for your mock properties, and default to the real implementation otherwise
        isPropertySignatureStub.callsFake((node) => {
          if (mockProperties.includes(node as unknown as ts.PropertySignature)) {
            return true;
          }
          return ts.isPropertySignature(node);
        });

        let errored = false;
        let retval;
        try {
          retval = codeGen.getInterfaceRelationships(mockNode);
        } catch (error) {
          errored = true;
        }

        assert.isFalse(errored);
        assert.isArray(retval);
        assert.lengthOf(retval, 1);

        // FIXME: fix this
        // Verify the first relation
        assert.deepEqual(retval[0], {
          type: databaseTypes.meta.RELATION_TYPE.ONE_TO_ONE,
          sourceTable: 'IComment',
          referenceTable: 'IUser',
        });

        // Verify the second relation
        // assert.deepEqual(retval[1], {
        //   type: databaseTypes.meta.RELATION_TYPE.ONE_TO_MANY,
        //   sourceTable: 'IComment',
        //   referenceTable: 'IState',
        // });
      });

      it('should throw a TypeCheckError when the ts compiler throws', () => {});
    });

    context('generator/generateModelFromTable', () => {
      it('should generate model source code and write to disk', async () => {
        const mockTable: databaseTypes.meta.ITable = {
          name: '',
          path: '',
          properties: [] as unknown as databaseTypes.meta.IProperty[],
          relationships: [] as unknown as databaseTypes.meta.IRelation[],
          isPublic: false,
        };
        const sourceFromTemplateStub = sandbox.stub();
        sourceFromTemplateStub.resolves();
        sandbox.replace(codeGen, 'sourceFromTemplate', sourceFromTemplateStub);

        let errored = false;
        try {
          await codeGen.generateModelFromTable(mockTable);
        } catch (error) {
          errored = true;
        }

        assert.isFalse(errored);
      });

      it('should throw a CodeGenError when sourceFromTemplate throws one', async () => {
        const mockTable: databaseTypes.meta.ITable = {
          name: '',
          path: '',
          properties: [] as unknown as databaseTypes.meta.IProperty[],
          relationships: [] as unknown as databaseTypes.meta.IRelation[],
          isPublic: false,
        };
        const sourceFromTemplateStub = sandbox.stub();
        sourceFromTemplateStub.rejects();
        sandbox.replace(codeGen, 'sourceFromTemplate', sourceFromTemplateStub);

        let errored = false;
        try {
          await codeGen.generateModelFromTable(mockTable);
        } catch (error) {
          errored = true;
        }

        assert.isTrue(errored);
      });
    });

    context('generator/sourceFromTemplate', () => {
      it('should generate model source code and write to disk', async () => {
        const mockTable: databaseTypes.meta.ITable = {
          name: '',
          path: '',
          properties: [] as unknown as databaseTypes.meta.IProperty[],
          relationships: [] as unknown as databaseTypes.meta.IRelation[],
          isPublic: false,
        };
        const templatePath = '';
        const outputPath = '';

        const fsReadFileStub = sandbox.stub(fs, 'readFile');
        fsReadFileStub.resolves('this is a file string');

        const templateStub = sandbox.stub();
        templateStub.returns(true);

        const handleBarsCompileStub = sandbox.stub(Handlebars, 'compile');
        handleBarsCompileStub.returns(templateStub);

        const fsWriteFileStub = sandbox.stub(fs, 'writeFile');
        fsWriteFileStub.resolves();

        let errored = false;
        try {
          await codeGen.sourceFromTemplate(mockTable, templatePath, outputPath);
        } catch (error) {
          errored = true;
        }

        assert.isFalse(errored);
      });

      it('should throw a CodeGenError when underlying call throws one', async () => {
        const mockTable: databaseTypes.meta.ITable = {
          name: '',
          path: '',
          properties: [] as unknown as databaseTypes.meta.IProperty[],
          relationships: [] as unknown as databaseTypes.meta.IRelation[],
          isPublic: false,
        };
        const templatePath = '';
        const outputPath = '';

        const fsReadFileStub = sandbox.stub(fs, 'readFile');
        fsReadFileStub.throws();

        let errored = false;
        try {
          await codeGen.sourceFromTemplate(mockTable, templatePath, outputPath);
        } catch (error) {
          errored = true;
        }
        assert.isTrue(errored);
      });
    });
  });
});
