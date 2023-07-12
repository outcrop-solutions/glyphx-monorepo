import ts from 'typescript';
import fs from 'fs-extra';
import path from 'path';
import _, { capitalize } from 'lodash';
import pluralize from 'pluralize';
import Handlebars from 'handlebars';
import { database as databaseTypes } from '@glyphx/types';
import { error, constants } from '@glyphx/core';
import { DEFAULT_CONFIG } from './config';

/**
 * Constraints & Assumptions:
 * - All enums must be CAPITALIZED_AS_SUCH (this is enforced in our linting rules)
 * - All interfaces must begin with I<interfaceName> (this is also enforced in our linting rules)
 */
export class CodeGenerator {
  // configurable defaults
  private config: databaseTypes.meta.ICodeGenConfig;
  private handlebars = Handlebars;
  private protectedFields: string[] = ['createdAt', 'updatedAt', '_id'];

  // internal IR between file processing => code generation
  private databaseSchemaField: databaseTypes.meta.IDatabaseSchema;
  private checker: ts.TypeChecker | null = null;

  constructor(config: databaseTypes.meta.ICodeGenConfig) {
    this.databaseSchemaField = { tables: [] };
    this.config = config || DEFAULT_CONFIG;

    // Registering template helper functions
    this.handlebars.registerHelper('capitalize', (value: string) => _.capitalize(value));
    this.handlebars.registerHelper('pluralize', (value: string) => pluralize.plural(value));
    this.handlebars.registerHelper('lowercase', (value: string) => value.toLowerCase());
    this.handlebars.registerHelper('pascalcase', (value: string) => _.upperFirst(_.camelCase(value)));
  }

  /**
   * Run the codegenerator
   */
  public async generate(): Promise<void> {
    // STEP 1: extract IR
    await this.processFiles(this.config.paths.source);

    // STEP 2: generate source
    for (const table of this.databaseSchemaField.tables) {
      // generate source files from IR
      await this.generateModelFromTable(table);
    }
  }

  /**
   * STEP 1: EXTRACT IR
   * Extracts global database schema based on the interfaces found in the designated databaseTypes directory (recursively)
   * @param dbDir // relative directory containing database interface definitions
   * @returns databaseTypes.meta.IDatabaseSchema
   */
  private async processFiles(dbDir: string): Promise<void> {
    try {
      const files = await fs.readdir(dbDir);
      const filteredFiles = files.filter((f) => f !== 'index.ts');
      await Promise.all(
        filteredFiles.map(async (file: string) => {
          const filePath = path.join(dbDir, file);
          const stat = await fs.stat(filePath);
          if (stat.isDirectory()) {
            await this.processFiles(filePath);
          } else {
            const program = ts.createProgram([filePath], {
              allowJs: true,
              jsx: ts.JsxEmit.ReactJSX,
            });
            this.checker = program.getTypeChecker();
            this.parseFile(program, filePath);
          }
        })
      );
    } catch (err: any) {
      if (err instanceof error.TypeCheckError || err instanceof error.FileParseError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
      } else {
        throw new error.CodeGenError(
          'An error occurred while generating the db boilerplate, See inner error for details',
          err
        );
      }
    }
  }

  /**
   * Wraps node traversal to be called on a file-by-file basis
   */
  private parseFile(program: ts.Program, filePath: string): void | null {
    try {
      const sourceFile = program.getSourceFile(filePath);
      if (!sourceFile) {
        throw new error.FileParseError('Could not find source file', filePath);
      }
      ts.forEachChild(sourceFile, (node: ts.Node) => this.extractTypes(filePath, node));
    } catch (err: any) {
      if (err instanceof error.TypeCheckError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        throw new error.FileParseError(
          'An error occurred while parsing the interface file, See inner error for details',
          err
        );
      }
    }
  }

  /**
   * Recursive AST node traversal utility which orchestrates helper methods to extract interface definitions
   */
  private extractTypes(filePath: string, node: ts.Node): void | null {
    try {
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = this.getInterfaceName(node);

        const properties = this.getInterfaceProperties(node);
        const relationships = this.getInterfaceRelationships(node);

        const table: databaseTypes.meta.ITable = {
          name: interfaceName,
          path: filePath,
          properties: properties!,
          relationships: relationships!,
        };

        this.databaseSchemaField.tables.push(table);
      }
      ts.forEachChild(node, (childNode: ts.Node) => this.extractTypes(filePath, childNode));
    } catch (err: any) {
      if (err instanceof error.TypeCheckError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        throw new error.TypeCheckError(
          'An error occurred while extracting the interface definition, See inner error for details',
          err
        );
      }
    }
  }

  /**
   * Extracts db model name from the interface declaration
   */
  private getInterfaceName(node: ts.InterfaceDeclaration): string {
    try {
      return node.name.text;
    } catch (err: any) {
      throw new error.TypeCheckError(
        'An error occurred while extracting the interface definition, See inner error for details',
        err
      );
    }
  }

  /**
   * Extracts db model properties and datatypes from the interface declaration
   */
  private getInterfaceProperties(node: ts.InterfaceDeclaration): databaseTypes.meta.IProperty[] {
    try {
      const properties = node.members
        .filter(ts.isPropertySignature)
        .filter((p) => p.name.getText() !== '_id')
        .map((property: any) => {
          const propertyName = property.name.getText();
          if (propertyName === 'string') {
            capitalize(propertyName);
          }
          const propertyType = this.checker!.getTypeAtLocation(property.type!);
          const typeString = this.checker!.typeToString(propertyType);

          // TODO: use type checker for this eventually
          const isProtected = this.protectedFields.includes(propertyName) || propertyName.startsWith('I');

          return { name: propertyName, type: typeString, protected: isProtected, required: false };
        });

      return properties;
    } catch (err: any) {
      throw new error.TypeCheckError(
        'An error occurred while extracting the interface definition, See inner error for details',
        err
      );
    }
  }
  /**
   * Extracts db model relationships from the interface declaration
   */
  private getInterfaceRelationships(node: ts.InterfaceDeclaration): databaseTypes.meta.IRelation[] {
    try {
      const relations: databaseTypes.meta.IRelation[] = [];

      // We're only interested in interface declarations.
      const properties = node.members.filter(ts.isPropertySignature);

      for (const property of properties) {
        const typeNode = (property as ts.PropertySignature).type;

        // If the type node exists and is of kind TypeReference
        if (typeNode && typeNode.kind === ts.SyntaxKind.TypeReference) {
          const refName = (typeNode as ts.TypeReferenceNode).typeName.getText();

          // Exclude ids, dates
          if (refName === 'Date' || refName === 'mongooseTypes.ObjectId') {
            continue;
          }

          // Assuming enums are UPPER_CASE and interfaces include "I" whereas subdocuments do not i.e Camera/AspectRatio
          let relationType: databaseTypes.meta.RELATION_TYPE;
          if (refName === refName.toUpperCase()) {
            relationType = databaseTypes.meta.RELATION_TYPE.ENUM;
          } else if (!refName.startsWith('I')) {
            relationType = databaseTypes.meta.RELATION_TYPE.SCHEMA;
          } else if ('elementType' in typeNode) {
            relationType = databaseTypes.meta.RELATION_TYPE.ONE_TO_MANY;
          } else {
            relationType = databaseTypes.meta.RELATION_TYPE.ONE_TO_ONE;
          }

          relations.push({
            type: relationType,
            sourceTable: node.name.text,
            referenceTable: refName,
          });
        }
      }

      return relations;
    } catch (err: any) {
      throw new error.TypeCheckError(
        'An error occurred while extracting the interface relationship definitions, See inner error for details',
        err
      );
    }
  }

  /**
   * STEP 2: GENERATE AND EMIT
   * Generate Code from database schema ITable IR
   * @param templatePath
   * @param outputPath
   */
  private async generateModelFromTable(table: databaseTypes.meta.ITable): Promise<void> {
    const formattedTable = { ...table, name: table.name.substring(1) };
    const { paths, output, templates } = this.config;

    try {
      await Promise.all([
        // generate model
        this.sourceFromTemplate(
          formattedTable,
          `${paths.templates}/${templates.models}`,
          `${paths.destination}/${output.models}/${formattedTable.name.toLowerCase()}.ts`
        ),
        // generate interfaces
        // this.sourceFromTemplate(table, templates.interfaces.createInput, `${output.interfaces}/i${name}CreateInput.ts`),
        // this.sourceFromTemplate(table, templates.interfaces.document, `${output.interfaces}/${name}Document.ts`),
        // this.sourceFromTemplate(table, templates.interfaces.methods, `${output.interfaces}/${name}Methods.ts`),
        // this.sourceFromTemplate(
        //   table,
        //   templates.interfaces.staticMethods,
        //   `${output.interfaces}/${name}StaticMethods.ts`
        // ),
        // // generate schemas
        // this.sourceFromTemplate(table, templates.schemas, `${output.schemas}/${name}.ts`),
      ]);
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating source code from templates in generateSourceFromTable, See inner error for details',
        err
      );
    }
  }

  /**
   * Takes in arbitrary data and template to generate a new file asynchronously on disk
   * @param data
   */
  private async sourceFromTemplate(data: any, templatePath: string, outputPath: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });
      // Read the template file
      const source = await fs.readFile(templatePath, 'utf8');
      // Create a compiled version of the template
      const template = Handlebars.compile(source);
      // Generate the file content by rendering the template with the table data
      const result = template(data);
      // Write the content to a new file in the output directory
      await fs.writeFile(`${outputPath}`, result);
    } catch (err) {
      throw new error.CodeGenError(
        'An error occurred while compiling the handlebar template and writing to disk at sourceFromTemplate, See inner error for details',
        err
      );
    }
  }
}
