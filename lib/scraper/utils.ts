/** biome-ignore-all lint/correctness/noUnusedVariables: <> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
export function findKeyRecursively(obj: any, targetKey: string): any {
  if (obj && typeof obj === "object") {
    // Check if current object has the key
    if (targetKey in obj) {
      return obj[targetKey];
    }

    // Search in nested objects/arrays
    for (const key in obj) {
      const result = findKeyRecursively(obj[key], targetKey);
      if (result !== undefined) {
        return result;
      }
    }
  }
  return undefined;
}
