import * as SqliteClient from "@effect/sql-sqlite-do/SqliteClient";
import type { ToolDescriptor } from "@cloudflare/codemode";
import * as Effect from "effect/Effect";
import { z } from "zod";

import { executeCannedSql } from "../../queries/execute-canned-sql";
import type { FocusVersion } from "../../queries/types";

export const descriptor: ToolDescriptor = {
  description:
    "Execute a canned FOCUS query by ID for a given spec version. Use the focus://queries resource to discover available query IDs and their required parameters.",
  inputSchema: z.object({
    version: z.enum(["1.0", "1.1", "1.2", "1.3"]).describe("FOCUS spec version of the dataset to query"),
    queryId: z.string().describe("The snake_case query ID from the focus://queries resource for this version"),
    params: z
      .record(z.string(), z.union([z.string(), z.number()]))
      .describe(
        "Named parameters matching the query's params array. Keys are param names; values are the corresponding values in the correct type."
      ),
  }),
};

export function createFn(db: SqlStorage): (args: unknown) => Promise<unknown> {
  return async (args) => {
    const { version, queryId, params } = args as {
      version: FocusVersion;
      queryId: string;
      params: Record<string, string | number>;
    };
    return Effect.runPromise(
      executeCannedSql(version, queryId, params).pipe(Effect.provide(SqliteClient.layer({ db })))
    );
  };
}
