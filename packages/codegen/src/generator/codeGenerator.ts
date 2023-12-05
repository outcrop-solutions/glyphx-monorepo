import ts from 'typescript';
import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';
import pluralize from 'pluralize';
import {pascalCase} from 'pascal-case';
import Handlebars from 'handlebars';
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import {DEFAULT_CONFIG} from './config';
import prettier from 'prettier';
import type {Options} from 'prettier';

/**
 * Constraints & Assumptions:
 * - All enums must be CAPITALIZED_AS_SUCH (this is enforced in our linting rules)
 * - All interfaces (a.k.a TABLES) must begin with I<interfaceName> (this is also enforced in our linting rules)
 * - All interfaces (a.k.a TABLES) referenced within an interface definition must exist within the database.ts file
 * - The only scalar fields allowed live in the typeMap
 * - The only supported utility types live in the utilityTypes array
 * - No more than 2 ONE_TO_ONE relationships to the same table
 *
 * WIP
 * - dslTypes
 * -
 */
export class CodeGenerator {
  // configurable defaults
  private config: databaseTypes.meta.ICodeGenConfig;
  private handlebars = Handlebars;
  private protectedFields: string[] = ['createdAt', 'updatedAt', '_id'];
  private typeMap: Record<string, string> = {
    'string[]': '[String]',
    'number[]': '[Number]',
    string: 'String',
    number: 'Number',
    boolean: 'Boolean',
  };

  private utilityTypes: string[] = ['record', 'omit', 'pick'];
  private dslTypes: string[] = ['__cascadeOnUpdate__', '__cascadeOnDelete__', '__unique__', 'Default'];
  private prettierConfigField: Options = {
    bracketSpacing: false,
    singleQuote: true,
    trailingComma: 'es5',
    arrowParens: 'avoid',
  };

  // internal IR between file processing => code generation
  private databaseSchemaField: databaseTypes.meta.IDatabaseSchema;
  private checker: ts.TypeChecker | null = null;
  private _schemas: databaseTypes.meta.IProperty[] = [];
  private _addedSchemas = new Set<string>();

  constructor(config: databaseTypes.meta.ICodeGenConfig | undefined) {
    this.databaseSchemaField = {tables: []};
    this.config = config || DEFAULT_CONFIG;
    // Registering handlebar template helper functions
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
    this.handlebars.registerHelper('getEnumValue', this.getEnumValue);
    this.handlebars.registerHelper('isDate', (value: any) => value.type === 'Date');
    this.handlebars.registerHelper('isString', (value: any) => value.type === 'String');
    this.handlebars.registerHelper('isNumber', (value: any) => value.type === 'Number');
    this.handlebars.registerHelper('isStringArray', (value: any) => value.type === 'String[]');
    this.handlebars.registerHelper('isNumberArray', (value: any) => value.type === 'Number[]');
    this.handlebars.registerHelper('isSchema', (value: string) => value === 'SCHEMA');
    // this will be removed when utility types become supported
    this.handlebars.registerHelper('isRecord', this.isRecord);
    this.handlebars.registerHelper('isOneToOne', (value: string) => value === 'ONE_TO_ONE');
    this.handlebars.registerHelper('isOneToMany', (value: string) => value === 'ONE_TO_MANY');
    // check referenceTable exists (needed for scalar arrays i.e string[])
    this.handlebars.registerHelper('referenceTableExists', (value) => !!value.referenceTable);
    this.handlebars.registerHelper('isRelation', (value) => !!value.isRelation);
    // check referential action type
    this.handlebars.registerHelper('isCascade', (value: string) => value === 'CASCADE');
    this.handlebars.registerHelper('isNoAction', (value: string) => value === 'NO_ACTION');
    this.handlebars.registerHelper('isSetNull', (value: string) => value === 'SET_NULL');
    this.handlebars.registerHelper('hasOneToOne', this.hasOneToOne);
    this.handlebars.registerHelper('hasOneToMany', this.hasOneToMany);
    this.handlebars.registerHelper('or', this.logicalOr);
    this.handlebars.registerHelper('and', this.logicalAnd);
    this.handlebars.registerHelper('eq', this.logicalEq);
  }

  // STRING UTILITIES
  /**
   * Collection of utilities to format table names
   */

  // used to normalize table name inputs
  private stripLeadingI(value: string): string {
    return (value && value?.startsWith('I')) || value?.startsWith('i') ? value?.substring(1) : value;
  }

  // largely replaced by toSnakeCase + toPascalCase
  private toCapitalized(value: string): string {
    return value ? _.capitalize(value) : value;
  }

  // primarily used for add/remove static methods
  private toPlural(value: string): string {
    return value ? pluralize.plural(value) : value;
  }

  // used for imports and schema references
  private toSingular(value: string): string {
    return value ? pluralize.singular(value) : value;
  }

  // unused at the moment
  private wrapSingleQuotes(value: string): string {
    return value ? `'${value}'` : value;
  }

  // primarily used on interface members i.e property names
  private toCamelCase(value: string): string {
    return value ? _.camelCase(value) : value;
  }

  private toLowercase(value: string): string {
    return value ? value?.toLowerCase() : value;
  }

  // primarily required for MODEL and ENUM formatting
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
    return this.typeMap[value] || value;
  }

  // used with toSnakeCase to preserve table names compliant with eslint config
  private toPascalCase(value: string): string {
    return value ? pascalCase(value) : value;
  }

  // HBS HELPERS
  // used to filter properties to set default behaviour around protected fields
  private isNotProtected(value: string): boolean {
    if (value && ['createdAt', 'updatedAt', 'deletedAt', '_id'].includes(value)) {
      return false;
    } else {
      return true;
    }
  }

  // crucial for predictable handlebar compilation
  private normalizeTableName(tableName: string): string {
    const stripped = this.stripLeadingI(tableName);
    const snaked = this.toSnakeCase(stripped);
    return this.toLowercase(snaked);
  }

  // get enum value for mock data generation
  private getEnumValue(property: databaseTypes.meta.IProperty) {
    return property?.enumValues && property?.enumValues?.length && property?.enumValues?.length > 0
      ? property.enumValues[0]
      : '';
  }

  private isRecord(value: databaseTypes.meta.IProperty) {
    return value?.relationType === 'SCHEMA' && value?.schemaProperties?.length === 0;
  }

  private hasOneToOne(properties: databaseTypes.meta.IProperty[]) {
    return properties?.some((prop) => prop.relationType === 'ONE_TO_ONE' && !!prop.referenceTable);
  }

  private hasOneToMany(properties: databaseTypes.meta.IProperty[]) {
    return properties?.some((prop) => prop.relationType === 'ONE_TO_MANY' && !!prop.referenceTable);
  }

  private logicalOr(...args: any[]) {
    // Remove the options argument at the end
    args.pop();

    // Return true if any of the arguments are truthy
    return args.some(Boolean);
  }

  private logicalAnd(...args: any[]): boolean {
    // Remove the options argument at the end
    args.pop();

    // Return true if all of the arguments are truthy
    return args.every(Boolean);
  }

  private logicalEq(a: any, b: any) {
    return a === b;
  }

  // FIXME: eventually remove duplicate config from other packages within the monorepo
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
      // STEP 1: EXTRACT IR
      const filePath = await this.findDatabaseFile(process.cwd());
      this.parseFile(filePath);

      // STEP 2: GENERATE SOURCE
      await this.generateModels();
      await this.generateMocks();
      await this.generateSchemas();
      await this.generateServices();
      await this.generateEntryPoints();
      await this.generateHooks();
      await this.generateMutations();
      await this.generateActions();
      await this.generateRoutes();
      await this.generateAtoms();

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
   * @returns {Promise<void>}
   */

  // Finds the database definition file
  private async findDatabaseFile(directory: string): Promise<string> {
    const filePath = path.join(directory, 'database.ts');

    if (await fs.pathExists(filePath)) {
      return filePath;
    }

    // Get the parent directory
    const parentDirectory = path.dirname(directory);

    // If we've reached the root directory, stop searching
    if (parentDirectory === directory) {
      if (!filePath) {
        throw new error.CodeGenError(
          'No database definition file found, please make sure you have a database.ts file in your current working directory, See inner error for details',
          {}
        );
      }
    }

    return this.findDatabaseFile(parentDirectory);
  }

  /**
   * Wraps node traversal to be called on a file-by-file basis
   * @param filePath
   * @returns
   */
  private parseFile(filePath: string): void | null {
    try {
      const program = ts.createProgram([filePath], {
        allowJs: true,
        jsx: ts.JsxEmit.ReactJSX,
      });
      this.checker = program.getTypeChecker();

      const sourceFile = program.getSourceFile(filePath);
      if (!sourceFile) {
        throw new error.FileParseError('Could not find source file', filePath);
      }
      ts.forEachChild(sourceFile, (node: ts.Node) => this.extractTypes(filePath, node));

      // deduplicate table names for entry points
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
   *  Recursive AST node traversal utility which orchestrates helper methods to extract interface definitions
   * @param filePath
   * @param node
   * @returns
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
          dedupedProperties: this.deduplicateProperties(properties),
          isPublic: false,
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
   * @param node
   * @returns
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
   * @param node
   * @returns
   */
  private getInterfaceProperties(node: ts.InterfaceDeclaration): databaseTypes.meta.IProperty[] {
    try {
      const properties = node.members
        .filter(ts.isPropertySignature)
        .filter((p) => p.name && p.name?.getText() !== '_id') // filtered out because implementation is standardized
        .map(this.getProperty.bind(this));

      return properties;
    } catch (err: any) {
      throw new error.TypeCheckError(
        'An error occurred while extracting the interface definition, See inner error for details',
        err
      );
    }
  }

  /**
   * Extracts nested properties of SCHEMA references
   * @param node
   * @returns
   */
  private getTypeProperties(node: ts.Node): databaseTypes.meta.IProperty[] {
    try {
      // Ensure dealing with a SCHEMA type alias
      if (!ts.isTypeAliasDeclaration(node)) {
        return [];
      }
      // Ensure the type alias describes an object shape
      if (!ts.isTypeLiteralNode(node.type)) {
        return [];
      }

      const typeLiteral = node.type as ts.TypeLiteralNode;
      return typeLiteral.members.filter(ts.isPropertySignature).map(this.getProperty.bind(this));
    } catch (err: any) {
      throw new error.TypeCheckError(
        'An error occurred while extracting properties from type members, See inner error for details',
        err
      );
    }
  }

  /**
   * Extracts databaseTypes.meta.IProperty from the property type signature
   * @param property
   * @returns
   */
  private getProperty(property: ts.PropertySignature): databaseTypes.meta.IProperty {
    const propertyName = property?.name && property.name?.getText();

    // format scalar values for mongoose
    const propName = this.convertScalarFieldTypes(propertyName);

    // determine name, type, required
    const typeNode = property.type;
    const refName = this.getRefName(typeNode as ts.TypeNode);
    const propertyType = this.checker!.getTypeAtLocation(property.type!);
    const typeString = this.checker!.typeToString(propertyType);
    const isProtected = this.protectedFields.includes(propName);
    const isRequired = !property.questionToken;

    // determine relationships
    const {isRelation, relationType} = this.determineRelationType(refName, typeNode);

    // determine referential actions and default values
    const {isUnique, hasDefault, cascadeOnDelete, cascadeOnUpdate, defaultValue} = this.checkDSLTypes(typeNode);

    const def = hasDefault ? {default: defaultValue} : {};
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

    // extract ENUMs and SCHEMAs
    const {enumValues, nestedProperties} = this.extractNestedProperties(relationType, typeNode as ts.TypeNode, refName);

    return {
      name: propName,
      type: this.convertScalarFieldTypes(typeString),
      isRequired: isRequired,
      isProtected: isProtected,
      isRelation: isRelation,
      schemaProperties: nestedProperties,
      enumValues: enumValues,
      ...relation,
    };
  }

  private getRefName(typeNode: ts.TypeNode): string {
    let refName: string;
    // check if typeNode is an array
    if (typeNode && typeNode.kind === 185) {
      const arrayTypeNode = typeNode as ts.ArrayTypeNode;
      refName = (arrayTypeNode.elementType as ts.TypeReferenceNode).typeName?.getText();
    } else if (typeNode && typeNode.kind === 188) {
      refName = (typeNode as any).elementType.typeName.escapedText;
    } else {
      refName = (typeNode as ts.TypeReferenceNode).typeName?.getText();
    }
    return refName;
  }

  // handle cases when a property is ENUM or SCHEMA
  private extractNestedProperties(
    relationType: databaseTypes.meta.RELATION_TYPE | undefined,
    typeNode: ts.TypeNode,
    refName: string
  ) {
    let nestedProperties: databaseTypes.meta.IProperty[] = [];
    let enumValues: string[] = [];

    if (relationType === databaseTypes.meta.RELATION_TYPE.ENUM) {
      // Assuming you have a method or logic to identify ENUM relations
      const referenceSymbol = this.checker!.getSymbolAtLocation((typeNode as ts.TypeReferenceNode).typeName);

      if (referenceSymbol && referenceSymbol.declarations && referenceSymbol.declarations.length > 0) {
        const enumDeclaration = referenceSymbol.declarations[0];
        if (ts.isEnumDeclaration(enumDeclaration)) {
          enumValues = enumDeclaration.members.map((member) => member.name.getText());
        }
      }
    } else if (relationType === databaseTypes.meta.RELATION_TYPE.SCHEMA) {
      // If 'Pick', 'Omit', or 'Record', handle with care
      if (this.utilityTypes.includes(this.normalizeTableName(refName))) {
        const nested = this.extractUtilityTypes(refName, typeNode as ts.TypeReferenceNode);
        nestedProperties = [...nested];
      } else {
        // Find the referenced interface declaration
        const referenceSymbol = this.checker!.getSymbolAtLocation((typeNode as ts.TypeReferenceNode).typeName);
        // Extract nested properties
        if (referenceSymbol && referenceSymbol.declarations && referenceSymbol.declarations.length > 0) {
          nestedProperties = this.getTypeProperties(referenceSymbol.declarations[0]);
        }
      }
    }
    return {nestedProperties, enumValues};
  }

  // Handle cases where nested schemas use Record, Omit, or Pick types
  private extractUtilityTypes(refName: string, typeNode: ts.TypeReferenceNode) {
    let nestedProperties: databaseTypes.meta.IProperty[] = [];

    if (this.normalizeTableName(refName) === 'record') {
      const typeArgs = typeNode.typeArguments;
      if (typeArgs && typeArgs.length === 2) {
        const valueType = typeArgs[1];
        const valueTypeSymbol = this.checker!.getTypeAtLocation(valueType).getSymbol();

        if (valueTypeSymbol && valueTypeSymbol.declarations && valueTypeSymbol.declarations.length > 0) {
          nestedProperties = this.getTypeProperties(valueTypeSymbol.declarations[0]);
        }
      }
    } else if (this.normalizeTableName(refName) === 'omit') {
      const typeArgs = typeNode.typeArguments;
      if (typeArgs && typeArgs.length === 2) {
        const baseType = typeArgs[0];
        const omitKeysType = typeArgs[1]; // This might be a union of literal types
        const baseProperties = this.getTypeProperties(baseType);

        const omitKeys = this.getLiteralKeysFromType(omitKeysType);
        nestedProperties = baseProperties.filter((p) => !omitKeys.includes(p.name));
      }
    } else if (refName === 'pick') {
      const typeArgs = typeNode.typeArguments;
      if (typeArgs && typeArgs.length === 2) {
        const baseType = typeArgs[0];
        const pickKeysType = typeArgs[1];
        const baseProperties = this.getTypeProperties(baseType);

        const pickKeys = this.getLiteralKeysFromType(pickKeysType);
        nestedProperties = baseProperties.filter((p) => pickKeys.includes(p.name));
      }
    }
    return nestedProperties;
  }

  /**
   * Extract property types from Record, Omit, and Pick
   * @param typeNode
   * @returns
   */
  private getLiteralKeysFromType(typeNode: ts.TypeNode): string[] {
    const type = this.checker!.getTypeAtLocation(typeNode);
    if (!type.isUnion()) {
      return [];
    }
    const keys: string[] = [];

    for (const possibleType of type.types) {
      if (possibleType.isStringLiteral()) {
        keys.push(possibleType.value);
      }
    }
    return keys;
  }

  /**
   * Checks custom DSL type annotations to determine default values, indexes, and referential actions
   * @param typeNode
   * @returns
   */
  private checkDSLTypes(typeNode: ts.TypeNode | undefined): {
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
   * Determines the relationship type, if any, of the interface property
   * @param refName
   * @param typeNode
   * @returns
   */
  private determineRelationType(
    refName: string,
    typeNode: ts.TypeNode | undefined
  ): {
    isRelation: boolean;
    relationType: databaseTypes.meta.RELATION_TYPE | undefined;
  } {
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
    return {isRelation, relationType};
  }

  /**
   * STEP 2: GENERATE Database Model AND EMIT
   * Generate Code from database schema ITable IR
   * @param data
   * @param templatePath
   * @param outputPath
   */

  /**
   * Takes in arbitrary data and template to generate a new file asynchronously on disk
   * @param data
   * @param templatePath
   * @param outputPath
   */
  private async sourceFromTemplate(data: any, templatePath: string, outputPath: string): Promise<void> {
    try {
      // '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/packages/codegen/packages/codegen/src/templates/database/models.__integrationTests__.hbs'
      const absoluteTemplatePath = path.resolve(templatePath);
      const absoluteOutputPath = path.resolve(outputPath);
      // Ensure directory exists
      const dir = path.dirname(absoluteOutputPath);
      await fs.mkdir(dir, {recursive: true});
      // Read the template file
      const source = await fs.readFile(absoluteTemplatePath, 'utf8');
      // Create a compiled version of the template
      const template = Handlebars.compile(source);
      // Generate the file content by rendering the template with the table data
      const result = template(data);
      // Write the content to a new file in the output directory
      await fs.writeFile(`${absoluteOutputPath}`, result);
    } catch (err) {
      throw new error.CodeGenError(
        'An error occurred while compiling the handlebar template and writing to disk at sourceFromTemplate, See inner error for details',
        err
      );
    }
  }

  // Generate react swr hooks from databaseSchema
  private async generateHooks(): Promise<void> {
    try {
      for (const table of this.databaseSchemaField.tables) {
        await this.generateHook(table);
      }
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating the db boilerplate at generateHooks, See inner error for details',
        err
      );
    }
  }

  /**
   * Generates a business service and unit/integration tests
   * @param table
   */
  private async generateHook(table: databaseTypes.meta.ITable): Promise<void> {
    const {paths, output, templates} = this.config;

    try {
      await Promise.all([
        // GENERATE HOOK
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.web.hooks.hook}`,
          `${paths.destination}/${output.web.hooks}/use${this.toPlural(this.toPascalCase(table.name))}.ts`
        ),
      ]);
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating source code from templates in generateHook, See inner error for details',
        err
      );
    }
  }

  // Generate api mutation object config files from databaseSchema
  private async generateMutations(): Promise<void> {
    try {
      for (const table of this.databaseSchemaField.tables) {
        await this.generateMutation(table);
      }
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating the db boilerplate at generateMutations, See inner error for details',
        err
      );
    }
  }

  /**
   * Generates a api request config files from database table
   * @param table
   */
  private async generateMutation(table: databaseTypes.meta.ITable): Promise<void> {
    const {paths, output, templates} = this.config;

    try {
      await Promise.all([
        // GENERATE MUTATION
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.web.mutations.mutation}`,
          `${paths.destination}/${output.web.mutations}/${this.toCamelCase(table.name)}.ts`
        ),
      ]);
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating source code from templates in generateMutation, See inner error for details',
        err
      );
    }
  }

  // Generate api mutation objects from databaseSchema
  private async generateActions(): Promise<void> {
    try {
      for (const table of this.databaseSchemaField.tables) {
        await this.generateAction(table);
      }
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating the db boilerplate at generateActions, See inner error for details',
        err
      );
    }
  }

  /**
   * Generates a api request config from database table
   * @param table
   */
  private async generateAction(table: databaseTypes.meta.ITable): Promise<void> {
    const {paths, output, templates} = this.config;

    try {
      await Promise.all([
        // GENERATE MUTATION
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.web.actions.action}`,
          `${paths.destination}/${output.web.actions}/${this.toCamelCase(table.name)}.ts`
        ),
      ]);
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating source code from templates in generateAction, See inner error for details',
        err
      );
    }
  }

  // Generates a generic public api routes
  private async generateRoutes(): Promise<void> {
    try {
      for (const table of this.databaseSchemaField.tables) {
        await this.generateRoute(table);
      }
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating the db boilerplate at generateRoutes, See inner error for details',
        err
      );
    }
  }

  /**
   * Generates a generic authenticated public api route
   * @param table
   */
  private async generateRoute(table: databaseTypes.meta.ITable): Promise<void> {
    const {paths, output, templates} = this.config;

    try {
      await Promise.all([
        // GENERATE ROUTE
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.web.routes}`,
          `${paths.destination}/${output.web.routes}/[${this.toCamelCase(table.name)}Id].ts`
        ),
      ]);
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating source code from templates in generateRoute, See inner error for details',
        err
      );
    }
  }

  // Generates typed recoil atom state files
  // TODO: eventually create types selectors on the relations
  private async generateAtoms(): Promise<void> {
    try {
      for (const table of this.databaseSchemaField.tables) {
        await this.generateAtom(table);
      }
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating the db boilerplate at generateAtoms, See inner error for details',
        err
      );
    }
  }

  /**
   * Generates typed recoil atom
   * @param table
   */
  private async generateAtom(table: databaseTypes.meta.ITable): Promise<void> {
    const {paths, output, templates} = this.config;

    try {
      await Promise.all([
        // GENERATE ATOM
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.web.states.state}`,
          `${paths.destination}/${output.web.states}/${this.toCamelCase(table.name)}.ts`
        ),
      ]);
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating source code from templates in generateAtom, See inner error for details',
        err
      );
    }
  }

  // Generate business services from databaseSchema
  private async generateServices(): Promise<void> {
    try {
      for (const table of this.databaseSchemaField.tables) {
        await this.generateService(table);
      }
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating the db boilerplate at generateServices, See inner error for details',
        err
      );
    }
  }

  /**
   * Generates a business service and unit/integration tests
   * @param table
   */
  private async generateService(table: databaseTypes.meta.ITable): Promise<void> {
    const {paths, output, templates} = this.config;

    try {
      await Promise.all([
        // GENERATE SERVICE
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.business.services.service}`,
          `${paths.destination}/${output.business.services}/${this.toCamelCase(table.name)}.ts`
        ),
        // GENERATE SERVICE TESTS
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.business.services.unitTest}`,
          `${paths.destination}/${output.business.unitTests}/${this.toCamelCase(table.name)}Service.tests.ts`
        ),
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.business.services.integrationTest}`,
          `${paths.destination}/${output.business.integrationTests}/${this.toCamelCase(table.name)}Service.tests.ts`
        ),
      ]);
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating source code from templates in generateService, See inner error for details',
        err
      );
    }
  }

  // Generate database models and interfaces
  private async generateModels(): Promise<void> {
    try {
      for (const table of this.databaseSchemaField.tables) {
        await this.generateModel(table);
      }
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating the db boilerplate at generateModels, See inner error for details',
        err
      );
    }
  }

  /**
   * Generates database models and unit/integration tests
   * @param table
   */
  private async generateModel(table: databaseTypes.meta.ITable): Promise<void> {
    const {paths, output, templates} = this.config;

    try {
      await Promise.all([
        // GENERATE MODEL
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.database.models.model}`,
          `${paths.destination}/${output.database.models}/${this.toCamelCase(table.name)}.ts`
        ),

        // GENERATE MODEL TESTS
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.database.models.unitTest}`,
          `${paths.destination}/${output.database.unitTests}/mongoose/models/${this.toCamelCase(
            table.name
          )}Model.tests.ts`
        ),
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.database.models.integrationTest}`,
          `${paths.destination}/${output.database.integrationTests}/${this.toCamelCase(table.name)}Model.tests.ts`
        ),

        // GENERATE INTERFACES
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.database.interfaces.createInput}`,
          `${paths.destination}/${output.database.interfaces}/i${this.toPascalCase(table.name)}CreateInput.ts`
        ),
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.database.interfaces.document}`,
          `${paths.destination}/${output.database.interfaces}/i${this.toPascalCase(table.name)}Document.ts`
        ),
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.database.interfaces.methods}`,
          `${paths.destination}/${output.database.interfaces}/i${this.toPascalCase(table.name)}Methods.ts`
        ),
        this.sourceFromTemplate(
          table,
          `${paths.templates}/${templates.database.interfaces.staticMethods}`,
          `${paths.destination}/${output.database.interfaces}/i${this.toPascalCase(table.name)}StaticMethods.ts`
        ),
      ]);
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating source code from templates in generateModel, See inner error for details',
        err
      );
    }
  }

  // Generates mock data for unit and integration testing purposes
  private async generateMocks(): Promise<void> {
    const {paths, output, templates} = this.config;

    try {
      await Promise.all([
        this.databaseSchemaField.tables.map((table: databaseTypes.meta.ITable) => {
          // GENERATE MOCK
          this.sourceFromTemplate(
            table,
            `${paths.templates}/${templates.database.mocks.mock}`,
            `${paths.destination}/${output.database.mocks}/${this.toCamelCase(table.name)}.ts`
          );
        }),
      ]);
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating source code from templates in generateMock, See inner error for details',
        err
      );
    }
  }

  // Pull out schemas from tables to generate schemas and validators
  private get schemas(): databaseTypes.meta.IProperty[] {
    this.databaseSchemaField.tables.forEach((table: databaseTypes.meta.ITable) => {
      table.properties.forEach((property: databaseTypes.meta.IProperty) => {
        if (property.relationType === 'SCHEMA' && !this.isRecord(property) && !this._addedSchemas.has(property.name)) {
          this._schemas.push(property);
          this._addedSchemas.add(property.name);
        }
      });
    });

    return this._schemas;
  }

  private deduplicateProperties(properties: databaseTypes.meta.IProperty[]): databaseTypes.meta.IProperty[] {
    const counts = new Map<string, number>();
    const deduplicatedProperties: databaseTypes.meta.IProperty[] = [];

    // First loop to count duplicates
    for (const property of properties) {
      const key = property.referenceTable;
      counts.set(key as string, (counts.get(key as string) || 0) + 1);
    }

    // Set to keep track of added properties
    const added = new Set<string>();

    // Second loop to filter and assign duplicate counts
    for (const property of properties) {
      const key = property.referenceTable;
      const count = counts.get(key as string) || 0;

      property.duplicates = count;

      if (!added.has(key as string)) {
        // if the property isn't added yet, add it
        deduplicatedProperties.push(property);
        added.add(key as string); // mark this referenceTable as added
      }
    }

    return deduplicatedProperties;
  }

  // Generate schemas and validators
  private async generateSchemas(): Promise<void> {
    const {paths, output, templates} = this.config;

    try {
      await Promise.all(
        this.schemas.map((schema: databaseTypes.meta.IProperty) => {
          // generate schema
          this.sourceFromTemplate(
            schema,
            `${paths.templates}/${templates.database.schemas.schema}`,
            `${paths.destination}/${output.database.schemas}/${this.toCamelCase(schema.name)}Schema.ts`
          );
          // FIXME: create this template
          // generate validator
          this.sourceFromTemplate(
            schema,
            `${paths.templates}/${templates.database.validators.validator}`,
            `${paths.destination}/${output.database.validators}/${this.toCamelCase(schema.name)}ShapeValidator.ts`
          );
        })
      );
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating schema source code from templates in generateSchemas, See inner error for details',
        err
      );
    }
  }

  // Generate subfolder entrypoints (index.ts)
  private async generateEntryPoints(): Promise<void> {
    const {paths, output, templates} = this.config;

    try {
      await Promise.all([
        // WED
        // hooks entrypoint
        this.sourceFromTemplate(
          this.databaseSchemaField,
          `${paths.templates}/${templates.web.hooks.index}`,
          `${paths.destination}/${output.web.hooks}/index.ts`
        ),
        // actions entrypoint
        this.sourceFromTemplate(
          this.databaseSchemaField,
          `${paths.templates}/${templates.web.actions.index}`,
          `${paths.destination}/${output.web.actions}/index.ts`
        ),
        // mutations entrypoint
        this.sourceFromTemplate(
          this.databaseSchemaField,
          `${paths.templates}/${templates.web.mutations.index}`,
          `${paths.destination}/${output.web.mutations}/index.ts`
        ),
        // states entrypoint
        this.sourceFromTemplate(
          this.databaseSchemaField,
          `${paths.templates}/${templates.web.states.index}`,
          `${paths.destination}/${output.web.states}/index.ts`
        ),
        // BUSINESS
        // services entrypoint
        this.sourceFromTemplate(
          this.databaseSchemaField,
          `${paths.templates}/${templates.business.services.index}`,
          `${paths.destination}/${output.business.services}/index.ts`
        ),
        // DATABASE
        // generate model entrypoint
        this.sourceFromTemplate(
          this.databaseSchemaField,
          `${paths.templates}/${templates.database.models.index}`,
          `${paths.destination}/${output.database.models}/index.ts`
        ),
        // generate interfaces entrypoint
        this.sourceFromTemplate(
          this.databaseSchemaField,
          `${paths.templates}/${templates.database.interfaces.index}`,
          `${paths.destination}/${output.database.interfaces}/index.ts`
        ),
        // generate schemas entrypoint
        this.sourceFromTemplate(
          {schemas: this.schemas},
          `${paths.templates}/${templates.database.schemas.index}`,
          `${paths.destination}/${output.database.schemas}/index.ts`
        ),
        // generate validators entrypoint
        this.sourceFromTemplate(
          {schemas: this.schemas},
          `${paths.templates}/${templates.database.validators.index}`,
          `${paths.destination}/${output.database.validators}/index.ts`
        ),
        // generate mocks entrypoint
        this.sourceFromTemplate(
          this.databaseSchemaField,
          `${paths.templates}/${templates.database.mocks.index}`,
          `${paths.destination}/${output.database.mocks}/index.ts`
        ),
      ]);
    } catch (err: any) {
      throw new error.CodeGenError(
        'An error occurred while generating entry point source code from templates in generateEntryPoints, See inner error for details',
        err
      );
    }
  }

  /**
   * STEP 3: FORMATTING
   * Formats a given file with the given prettier config
   * @param filePath
   */
  private async formatFile(filePath: string) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const formatted = await prettier.format(content, {
        ...this.prettierConfigField,
        parser: 'typescript',
      });

      if (formatted.trim() !== '// THIS CODE WAS AUTOMATICALLY GENERATED') {
        // Checking if the formatted content is not empty
        await fs.writeFile(filePath, formatted);
        console.log(`Formatted ${filePath}`);
      } else {
        console.log(`Skipped empty formatted content for ${filePath}`);
      }
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
