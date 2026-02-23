/** Strip the leading `// comment` line written by the generate script. */
export function stripComment(jsonc: string): string {
  return jsonc.startsWith("//") ? jsonc.slice(jsonc.indexOf("\n") + 1) : jsonc;
}
