export function checkAndAddTrailingSlash(input: string): string {
  if (input.endsWith('/')) return input;
  else return input + '/';
}

export function getFileNameMinusExtension(input: string): string {
  const idx = input.indexOf('.');
  if (idx >= 0) {
    const retval = input.substring(0, idx);
    return retval;
  } else return input;
}

export function getFileNameExtension(input: string): string {
  const idx = input.indexOf('.');
  if (idx >= 0) {
    const retval = input.substring(idx + 1);
    return retval;
  } else return '';
}

export function deconstructFilePath(fullFilePath: string): {
  fileName: string;
  baseName: string;
  extension: string;
  pathParts: string[];
} {
  const splits = fullFilePath.split('/');

  const fileName = splits[splits.length - 1];
  const baseFileName = getFileNameMinusExtension(fileName);
  const extension = getFileNameExtension(fileName);

  const pathParts = splits.splice(0, splits.length - 1);

  return {
    fileName: fileName,
    baseName: baseFileName,
    extension: extension,
    pathParts: pathParts,
  };
}
