import type { FocusVersion } from "./types";

const tableNames: Record<FocusVersion, string> = {
  "1.0": "focus_rows_v10",
  "1.1": "focus_rows_v11",
  "1.2": "focus_rows_v12",
  "1.3": "focus_rows_v13",
};

/** Replace all occurrences of focus_data_table with the version-specific table name */
export function replaceTableName(sql: string, version: FocusVersion): string {
  return sql.replaceAll("focus_data_table", tableNames[version]);
}

/** Return true if the SQL string is a SELECT statement (ignores leading whitespace, case-insensitive) */
export function isSelectStatement(sql: string): boolean {
  return /^\s*SELECT\b/i.test(sql);
}
