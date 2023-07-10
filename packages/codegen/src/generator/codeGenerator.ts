import ts from 'typescript';
import fs from 'fs-extra';
import path from 'path';
import { database as databaseTypes } from '@glyphx/types';
import { error, constants } from '@glyphx/core';

export class CodeGenerator {
  private databaseSchema: databaseTypes.meta.IDatabaseSchema;
  private databaseDirField: string;
  private checker: ts.TypeChecker | null = null;

  constructor(databaseDir: string) {
    this.databaseSchema = { tables: [] };
    this.databaseDirField = databaseDir;
  }

  /**
   * Contains the global db table mapping used to generate boilerplate
   */
  public get dbSchema(): databaseTypes.meta.IDatabaseSchema {
    return this.databaseSchema;
  }

  /**
   * Generates global database schema based on the interfaces found in the designated databaseTypes directory (recursively)
   * @param dbDir // relative directory containing database interface definitions
   */
  private async processFiles(dbDir: string): Promise<void> {
    try {
      const files = await fs.readdir(dbDir);
      await Promise.all(
        files.map(async (file: string) => {
          const filePath = path.join(dbDir, file);
          const stat = await fs.stat(filePath);
          if (stat.isDirectory()) {
            await this.processFiles(filePath);
          } else {
            const program = ts.createProgram([filePath], {
              allowJs: true,
              jsx: ts.JsxEmit.ReactJSX,
            });
            this.parseFile(program, filePath, this.databaseSchema);
          }
        })
      );
    } catch (err) {
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
   * Wraps node traversal to be called on a file by file basis
   */
  private parseFile(program: ts.Program, filePath: string, processedTables: databaseTypes.meta.IDatabaseSchema) {
    try {
      const sourceFile = program.getSourceFile(filePath);
      if (!sourceFile) {
        throw new error.FileParseError('Could not find source file', filePath);
      }

      ts.forEachChild(sourceFile, (node: ts.Node) => this.extractTypes(filePath, node, processedTables));
    } catch (err) {
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
   * Recursive AST node traversal which calls more granular utilities to extract interface definitions
   */
  private extractTypes(filePath: string, node: ts.Node, processedTables: databaseTypes.meta.IDatabaseSchema) {
    try {
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = this.getInterfaceName(node);

        const properties = this.getInterfaceProperties(node);
        const relationships = this.getInterfaceRelationships(node);

        const table: databaseTypes.meta.ITable = {
          name: interfaceName,
          path: filePath,
          interface: {
            properties: properties!,
            relationships: relationships!,
          },
        };

        processedTables.tables.push(table);
      }

      ts.forEachChild(node, (childNode: ts.Node) => {
        this.extractTypes(filePath, childNode, processedTables);
      });
    } catch (err) {
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
   * Extracts interface name from the interface declaration
   */
  private getInterfaceName(node: ts.InterfaceDeclaration): string {
    try {
      return node.name.text;
    } catch (err) {
      throw new error.TypeCheckError(
        'An error occurred while extracting the interface definition, See inner error for details',
        err
      );
    }
  }

  /**
   * Extracts interface properties and datatypes from the interface declaration
   */
  private getInterfaceProperties(node: ts.InterfaceDeclaration): databaseTypes.meta.IProperty[] {
    try {
      const properties = node.members.filter(ts.isPropertySignature).map((property: any) => {
        const propertyName = property.name.getText();
        const propertyType = this.checker!.getTypeAtLocation(property.type!);
        const typeString = this.checker!.typeToString(propertyType);

        return { name: propertyName, type: typeString };
      });

      return properties;
    } catch (err) {
      throw new error.TypeCheckError(
        'An error occurred while extracting the interface definition, See inner error for details',
        err
      );
    }
  }

  /**
   * Extracts interface relationships from the interface declaration
   */
  private getInterfaceRelationships(node: ts.Node) {
    try {
      const hello = node;
      return [];
    } catch (err) {
      throw new error.TypeCheckError(
        'An error occurred while extracting the interface relationship definitions, See inner error for details',
        err
      );
    }
  }
}
