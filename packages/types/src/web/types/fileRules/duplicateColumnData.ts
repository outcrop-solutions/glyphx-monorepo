export type DuplicateColumnData =
  | {
      intraFileDuplicates?: {file: string; column: string}[];
      interFileDuplicates?: {
        columnName: string;
        duplicates: {fieldType: string; fileName: string}[];
      }[];
    }
  | false;
