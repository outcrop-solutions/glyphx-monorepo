export function projectTemplateShapeValidator(
  input: Record<string, Record<string, any>>
): boolean {
  let retval = true;

  for (const key in input) {
    let hasType = false;
    let hasRequired = false;
    const value = input[key];
    for (const subKey in value) {
      const subValue = value[subKey];
      if (subKey === 'type') {
        if (typeof subValue === 'string') hasType = true;
        else {
          retval = false;
          break;
        }
      } else if (subKey === 'required') {
        if (typeof subValue === 'boolean') hasRequired = true;
        else {
          retval = false;
          break;
        }
      } else {
        retval = false;
        break;
      }
    }
    if (!hasRequired || !hasType) retval = false;
    if (!retval) break;
  }
  return retval;
}
