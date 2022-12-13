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
