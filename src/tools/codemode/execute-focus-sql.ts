import * as SqliteClient from "@effect/sql-sqlite-do/SqliteClient";
import type { ToolDescriptor } from "@cloudflare/codemode";
import * as Effect from "effect/Effect";
import { z } from "zod";

import { executeRawSql } from "../../queries/execute-raw-sql";
import type { FocusVersion } from "../../queries/types";

export const descriptor: ToolDescriptor = {
  description:
    "Execute a SELECT statement against a FOCUS dataset version. Use focus_data_table as the table name placeholder. Only SELECT statements are permitted. Positional ? parameters are supported.",
  inputSchema: z.object({
    version: z.enum(["1.0", "1.1", "1.2", "1.3"]).describe("FOCUS spec version of the dataset to query"),
    sql: z
      .string()
      .describe("A SELECT statement using focus_data_table as the table name. Positional ? parameters are supported."),
    params: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .describe("Positional parameter values corresponding to ? placeholders in the SQL, in order."),
  }),
};

export function createFn(db: SqlStorage): (args: unknown) => Promise<unknown> {
  return async (args) => {
    const { version, sql, params } = args as {
      version: FocusVersion;
      sql: string;
      params?: (string | number)[];
    };
    return Effect.runPromise(
      executeRawSql(version, sql, params ?? []).pipe(Effect.provide(SqliteClient.layer({ db })))
    );
  };
}
