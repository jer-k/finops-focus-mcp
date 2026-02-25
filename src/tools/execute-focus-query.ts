import * as SqliteClient from "@effect/sql-sqlite-do/SqliteClient";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as Effect from "effect/Effect";
import { SqlClient } from "effect/unstable/sql/SqlClient";
import { z } from "zod";

import { v10Queries, v11Queries, v12Queries, v13Queries } from "../queries";
import type { FocusQuery, FocusVersion } from "../queries/types";
import { replaceTableName } from "./helpers";
import { MissingParamError, QueryNotFoundError } from "./types";

const schema = z.object({
  version: z.enum(["1.0", "1.1", "1.2", "1.3"]).describe("FOCUS spec version of the dataset to query"),
  queryId: z.string().describe("The snake_case query ID from the focus://queries resource for this version"),
  params: z
    .record(z.string(), z.union([z.string(), z.number()]))
    .describe(
      "Named parameters matching the query's params array. Keys are param names; values are the corresponding values in the correct type."
    ),
});

const queriesByVersion: Record<FocusVersion, FocusQuery[]> = {
  "1.0": v10Queries,
  "1.1": v11Queries,
  "1.2": v12Queries,
  "1.3": v13Queries,
};

export function findQuery(version: FocusVersion, queryId: string) {
  return Effect.gen(function* () {
    const queries = queriesByVersion[version];
    const query = queries.find((q) => q.id === queryId);
    if (!query) {
      return yield* Effect.fail(new QueryNotFoundError({ queryId, version }));
    }
    return query;
  });
}

export function buildPositionalParams(query: FocusQuery, namedParams: Record<string, string | number>) {
  return Effect.gen(function* () {
    const values: (string | number)[] = [];
    for (const param of query.params) {
      const value = namedParams[param.name];
      if (value === undefined) {
        return yield* Effect.fail(new MissingParamError({ paramName: param.name, queryId: query.id }));
      }
      values.push(value);
    }
    return values;
  });
}

export function executeCannedQuery(
  version: FocusVersion,
  queryId: string,
  namedParams: Record<string, string | number>
) {
  return Effect.gen(function* () {
    const sql = yield* SqlClient;
    const query = yield* findQuery(version, queryId);
    const positional = yield* buildPositionalParams(query, namedParams);
    const rewritten = replaceTableName(query.sql, version);
    const rows = yield* sql.unsafe(rewritten, positional);
    return rows;
  });
}

export function registerExecuteFocusQueryTool(server: McpServer, db: SqlStorage) {
  server.tool(
    "execute_focus_query",
    "Execute a canned FOCUS use case query by ID against the stored dataset for a given spec version. Use the focus://queries resource to discover available query IDs and their required parameters.",
    schema.shape,
    async ({ version, queryId, params }) => {
      const result = await Effect.runPromise(
        executeCannedQuery(version as FocusVersion, queryId, params as Record<string, string | number>).pipe(
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
