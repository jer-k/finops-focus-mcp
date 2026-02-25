import * as SqliteClient from "@effect/sql-sqlite-do/SqliteClient";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as Effect from "effect/Effect";
import { SqlClient } from "effect/unstable/sql/SqlClient";
import { z } from "zod";

import { isSelectStatement, replaceTableName } from "./helpers";
import type { FocusVersion } from "./types";
import { InvalidSqlError } from "./types";

const schema = z.object({
  version: z.enum(["1.0", "1.1", "1.2", "1.3"]).describe("FOCUS spec version of the dataset to query"),
  sql: z
    .string()
    .describe("A SELECT statement using focus_data_table as the table name. Positional ? parameters are supported."),
  params: z
    .array(z.union([z.string(), z.number()]))
    .optional()
    .describe("Positional parameter values corresponding to ? placeholders in the SQL, in order."),
});

export function executeArbitrarySql(version: FocusVersion, userSql: string, params: (string | number)[] = []) {
  return Effect.gen(function* () {
    if (!isSelectStatement(userSql)) {
      return yield* Effect.fail(new InvalidSqlError({ reason: "Only SELECT statements are permitted" }));
    }

    const sql = yield* SqlClient;
    const rewritten = replaceTableName(userSql, version);

    // Validate syntax with EXPLAIN before executing
    yield* sql
      .unsafe(`EXPLAIN ${rewritten}`, [])
      .pipe(Effect.mapError((err) => new InvalidSqlError({ reason: `SQL syntax error: ${String(err)}` })));

    const rows = yield* sql.unsafe(rewritten, params);
    return rows;
  });
}

export function registerExecuteFocusSqlTool(server: McpServer, db: SqlStorage) {
  server.tool(
    "execute_focus_sql",
    "Execute arbitrary SQL against the FOCUS data table. Use focus_data_table as the table name placeholder. Only SELECT statements are permitted.",
    schema.shape,
    async ({ version, sql: userSql, params }) => {
      const result = await Effect.runPromise(
        executeArbitrarySql(version as FocusVersion, userSql, params ?? []).pipe(
          Effect.provide(SqliteClient.layer({ db }))
        )
      ).catch((err) => ({ error: String(err) }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}
