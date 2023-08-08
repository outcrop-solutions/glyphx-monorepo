import ts from 'typescript';
import fs from 'fs-extra';
import path from 'path';
import _, { capitalize } from 'lodash';
import pluralize from 'pluralize';
import { pascalCase } from 'pascal-case';
import Handlebars from 'handlebars';
import { database as databaseTypes } from '@glyphx/types';
import { error, constants } from '@glyphx/core';
import { DEFAULT_CONFIG } from './config';
import prettier from 'prettier';
import type { Options } from 'prettier';

/**
 * Constraints & Assumptions:
 * - All enums must be CAPITALIZED_AS_SUCH (this is enforced in our linting rules)
 * - All interfaces must begin with I<interfaceName> (this is also enforced in our linting rules)
 * - All interfaces referenced within an interface definition must exist within the source folder
 */
export class CodeGenerator {
  // configurable defaults
  private config: databaseTypes.meta.ICodeGenConfig;
  private handlebars = Handlebars;
  private protectedFields: string[] = ['createdAt', 'updatedAt', '_id'];
  private scalarValueFields: string[] = ['string', 'number'];
  private prettierConfigField: Options = {
    bracketSpacing: false,
    singleQuote: true,
    trailingComma: 'es5',
    arrowParens: 'avoid',
  };

  // internal IR between file processing => code generation
  private databaseSchemaField: databaseTypes.meta.IDatabaseSchema;
  private checker: ts.TypeChecker | null = null;

  constructor(config: databaseTypes.meta.ICodeGenConfig | undefined) {
    this.databaseSchemaField = { tables: [] };
    this.config = config || DEFAULT_CONFIG;
    // Registering template helper functions
    this.handlebars.registerHelper('stripLeadingI', this.stripLeadingI);
    this.handlebars.registerHelper('wrapSingleQuotes', this.wrapSingleQuotes);
    this.handlebars.registerHelper('uppercase', this.toUpperCase);
    this.handlebars.registerHelper('capitalize', this.toCapitalized);
    this.handlebars.registerHelper('pluralize', this.toPlural);
    this.handlebars.registerHelper('singularize', this.toSingular);
    this.handlebars.registerHelper('isNotProtected', this.isNotProtected);
    this.handlebars.registerHelper('lowercase', this.toLowercase);
    this.handlebars.registerHelper('pascalcase', this.toPascalCase);
    this.handlebars.registerHelper('camelcase', this.toCamelCase);
    // check relation type
    this.handlebars.registerHelper('isEnum', (value: string) => value === 'ENUM');
    this.handlebars.registerHelper('isDate', (value: any) => value.type === 'Date');
    this.handlebars.registerHelper('isSchema', (value: string) => value === 'SCHEMA');
    this.handlebars.registerHelper('isOneToOne', (value: string) => value === 'ONE_TO_ONE');
    this.handlebars.registerHelper('isOneToMany', (value: string) => value === 'ONE_TO_MANY');
    // check referenceTable exists (needed for scalar arrays i.e string[])
    this.handlebars.registerHelper('referenceTableExists', (value) => !!value.referenceTable);
    this.handlebars.registerHelper('isRelation', (value) => !!value.isRelation);
    // check referential action type
    this.handlebars.registerHelper('isCascade', (value: string) => value === 'CASCADE');
    this.handlebars.registerHelper('isNoAction', (value: string) => value === 'NO_ACTION');
    this.handlebars.registerHelper('isSetNull', (value: string) => value === 'SET_NULL');
  }

  /**
   * Collection of utilities to format table names
   */
  private stripLeadingI(value: string): string {
    return (value && value?.startsWith('I')) || value?.startsWith('i') ? value?.substring(1) : value;
  }

  private toCapitalized(value: string): string {
    return value ? _.capitalize(value) : value;
  }

  private toPlural(value: string): string {
    return value ? pluralize.plural(value) : value;
  }

  private toSingular(value: string): string {
    return value ? pluralize.singular(value) : value;
  }

  private wrapSingleQuotes(value: string): string {
    return value ? `'${value}'` : value;
  }

  private toCamelCase(value: string): string {
    return value ? _.camelCase(value) : value;
  }

  private toLowercase(value: string): string {
    return value ? value?.toLowerCase() : value;
  }

  private toUpperCase(value: string): string {
    return value ? value.toUpperCase() : value;
  }

  // needed to preserve table names without eslint complaining
  private toSnakeCase(value: string): string {
    return value
      ? value?.replace(/([A-Z])/g, (match, letter, index) =>
          index > 0 ? '_' + letter?.toLowerCase() : letter?.toLowerCase()
        )
      : value;
  }

  // needed for mongoose references
  private convertScalarFieldTypes(value: string): string {
    if (value && this.scalarValueFields.includes(value)) {
      return this.toCapitalized(value);
    } else {
      return value;
    }
  }

  // used with toSnakeCase to preserve table names compliant with eslint config
  private toPascalCase(value: string): string {
    return value ? pascalCase(value) : value;
  }

  private isNotProtected(value: string): boolean {
    if (value && ['createdAt', 'updatedAt', 'deletedAt', '_id'].includes(value)) {
      return false;
    } else {
      return true;
    }
  }

  private normalizeTableName(tableName: string): string {
    const stripped = this.stripLeadingI(tableName);
    const snaked = this.toSnakeCase(stripped);
    return this.toLowercase(snaked);
  }

  public async init(): Promise<void> {
    // Retrieve Prettier configuration
    const options = await prettier.resolveConfig(this.config.paths.prettier);
    this.prettierConfigField = options || {
      bracketSpacing: false,
      singleQuote: true,
      trailingComma: 'es5',
      parser: 'typescript',
      arrowParens: 'avoid',
    };
  }

  /**
   * Run the codegenerator
   */
  public async generate(): Promise<void> {
    try {
      // STEP 1: extract IR
      await this.processFiles(this.config.paths.source);

      // STEP 2: generate source
      for (const table of this.databaseSchemaField.tables) {
        // generate source files from IR
        await this.generateModelFromTable(table);
      }

      // STEP 3: FORMAT OUTPUT
      // await this.formatDirectory(`${this.config.paths.destination}`);
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
   * Recursive AST node traversal utility which orchestrates helper methods to extract interface definitions
   */
  private extractTypes(filePath: string, node: ts.Node): void | null {
    try {
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = this.getInterfaceName(node);
        const tableName = this.normalizeTableName(interfaceName);
        const properties = this.getInterfaceProperties(node);

        // TODO: type annotations for roles
        // const roles = this.getRoles(node)

        const table: databaseTypes.meta.ITable = {
          name: tableName,
          path: filePath,
          properties: properties!,
          isPublic: false,
          // roles: roles!
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
   * Extracts db model properties and datatypes from the interface declaration
   */
  private getInterfaceProperties(node: ts.InterfaceDeclaration): databaseTypes.meta.IProperty[] {
    try {
      const properties = node.members
        .filter(ts.isPropertySignature)
        .filter((p) => p.name && p.name?.getText() !== '_id') // filtered out as implementation is standard
        .map((property: any) => {
          const propertyName = property?.name && property.name?.getText();
          if (propertyName === 'string' || propertyName === 'number') {
            capitalize(propertyName); // for mongoose model formatting
          }
          const propertyType = this.checker!.getTypeAtLocation(property.type!);
          const typeString = this.checker!.typeToString(propertyType);

          const isProtected = this.protectedFields.includes(propertyName);
          const isRequired = !property.questionToken;

          const typeNode = (property as ts.PropertySignature).type;

          let refName;
          if (typeNode && typeNode.kind === 185) {
            // Checking for ArrayType
            const arrayTypeNode = typeNode as ts.ArrayTypeNode;
            refName = (arrayTypeNode.elementType as ts.TypeReferenceNode).typeName?.getText();
          } else {
            refName = (typeNode as ts.TypeReferenceNode).typeName?.getText();
          }

          // determine relationships and utilities via naming convention and utility types
          const { isRelation, relationType } = this.determineRelationType(refName, typeNode);
          const { hasUtility, isUnique, hasDefault, cascadeOnDelete, cascadeOnUpdate, defaultValue } =
            this.checkUtilityTypes(typeNode);

          const def = hasDefault ? { default: defaultValue } : {};

          const relation = isRelation
            ? {
                relationType: relationType,
                referenceTable: this.normalizeTableName(refName),
                cascadeOnUpdate: cascadeOnUpdate,
                cascadeOnDelete: cascadeOnDelete,
                unique: isUnique,
                ...def,
              }
            : {};

          return {
            name: propertyName,
            type: this.convertScalarFieldTypes(typeString),
            isRequired: isRequired,
            isProtected: isProtected,
            isRelation: isRelation,
            ...relation,
          };
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
   * Checks utility type annotations to determine database model structure
   * @param typeNode
   * @returns
   */
  private checkUtilityTypes(typeNode: ts.TypeNode | undefined): {
    isUnique: boolean;
    hasDefault: boolean;
    hasUtility: boolean;
    cascadeOnDelete: boolean;
    cascadeOnUpdate: boolean;
    defaultValue?: any;
  } {
    let hasUtility = false;
    let isUnique = false;
    let hasDefault = false;
    let cascadeOnDelete = false;
    let cascadeOnUpdate = false;
    let defaultValue;

    if (typeNode && ts.isIntersectionTypeNode(typeNode)) {
      hasUtility = true;
      for (const type of typeNode.types) {
        if (ts.isTypeReferenceNode(type) && type.typeName) {
          const typeName = type?.typeName?.getText();
          switch (typeName) {
            case '__unique__':
              isUnique = true;
              break;
            case 'Default':
              hasDefault = true;
              // assuming the second type argument is a literal type
              if (type.typeArguments && type.typeArguments.length > 1) {
                defaultValue = this.checker!.typeToString(this.checker!.getTypeAtLocation(type.typeArguments[1]));
              }
              break;
            case '__cascadeOnDelete__':
              cascadeOnDelete = true;
              break;
            case '__cascadeOnUpdate__':
              cascadeOnUpdate = true;
              break;
          }
        }
      }
    }
    return {
      hasUtility,
      isUnique,
      hasDefault,
      cascadeOnDelete,
      cascadeOnUpdate,
      defaultValue,
    };
  }
  /**
   * Determines what type of relationship the interface member denotes
   * @param refName
   */
  private determineRelationType(
    refName: string,
    typeNode: ts.TypeNode | undefined
  ): { isRelation: boolean; relationType: databaseTypes.meta.RELATION_TYPE | undefined } {
    let isRelation = false;
    let relationType;

    // If the type node exists and is of kind TypeReference
    if (
      typeNode &&
      (typeNode.kind === ts.SyntaxKind.ArrayType ||
        (typeNode.kind === ts.SyntaxKind.TypeReference && refName !== 'Date' && refName !== 'mongooseTypes.ObjectId'))
    ) {
      isRelation = true;
      // Assuming enums are UPPER_CASE and interfaces include "I" whereas subdocuments do not i.e Camera/AspectRatio
      if (refName && refName === refName?.toUpperCase()) {
        relationType = databaseTypes.meta.RELATION_TYPE.ENUM;
      } else if (refName && !refName?.startsWith('I')) {
        relationType = databaseTypes.meta.RELATION_TYPE.SCHEMA;
      } else if (typeNode.kind === ts.SyntaxKind.ArrayType) {
        relationType = databaseTypes.meta.RELATION_TYPE.ONE_TO_MANY;
      } else {
        relationType = databaseTypes.meta.RELATION_TYPE.ONE_TO_ONE;
      }
    }
    return { isRelation, relationType };
  }

  /**
   * STEP 2: GENERATE AND EMIT
   * Generate Code from database schema ITable IR
   * @param templatePath
   * @param outputPath
   */
  private async generateModelFromTable(table: databaseTypes.meta.ITable): Promise<void> {
    const { paths, output, templates } = this.config;

    try {
      await Promise.all([
        // generate model
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.models}`,
          `${paths.destination}/${output.models}/${this.toCamelCase(table.name)}.ts`
        ),
        // generate interfaces
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.interfaces.createInput}`,
          `${paths.destination}/${output.interfaces}/i${this.toPascalCase(table.name)}CreateInput.ts`
        ),
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.interfaces.document}`,
          `${paths.destination}/${output.interfaces}/i${this.toPascalCase(table.name)}Document.ts`
        ),
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.interfaces.methods}`,
          `${paths.destination}/${output.interfaces}/i${this.toPascalCase(table.name)}Methods.ts`
        ),
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.interfaces.staticMethods}`,
          `${paths.destination}/${output.interfaces}/i${this.toPascalCase(table.name)}StaticMethods.ts`
        ),
        // generate schemas
        // this.sourceFromTemplate(formattedTable, templates.schemas, `${output.schemas}/${name}.ts`),
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

  // STEP 3: FORMATTING

  /**
   * Formats a given file with the given prettier config
   * @param filePath
   */
  private async formatFile(filePath: string) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const formatted = await prettier.format(content, { ...this.prettierConfigField, parser: 'typescript' });
      fs.writeFile(filePath, formatted);
      console.log(`Formatted ${filePath}`);
    } catch (err) {
      throw new error.CodeGenError(
        'An error occurred while formatting the file at formatFile, See inner error for details',
        err
      );
    }
  }

  /**
   * Formats a directory recursively using the prettier config
   * @param fileDir
   */
  private async formatDirectory(fileDir: string) {
    try {
      const dir = await fs.readdir(fileDir);

      const promises = dir.map(async (file: string) => {
        const filePath = path.join(fileDir, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile()) {
          return this.formatFile(filePath);
        } else if (stat.isDirectory()) {
          return this.formatDirectory(filePath); // Recurse if directory
        }
      });
      // Wait for all promises to resolve
      await Promise.all(promises);
    } catch (err) {
      throw new error.CodeGenError(
        'An error occurred while formatting the file at formatDirectory, See inner error for details',
        err
      );
    }
  }
}
