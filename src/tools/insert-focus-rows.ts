import * as SqliteClient from "@effect/sql-sqlite-do/SqliteClient";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as Effect from "effect/Effect";
import { z } from "zod";

import type { FocusVersion } from "../queries/types";
import type { DatasetType } from "../storage/errors";
import { insertRows } from "../storage/insert-rows";

const schema = z.object({
  datasetId: z.string().describe("Dataset ID returned by create_focus_dataset"),
  version: z.enum(["1.0", "1.1", "1.2", "1.3"]).describe("FOCUS spec version matching the dataset"),
  datasetType: z.enum(["cost_and_usage", "contract_commitment"]).describe("Dataset type matching the dataset"),
  rows: z
    .array(z.record(z.string(), z.unknown()))
    .min(1)
    .describe(
      "Array of FOCUS row objects to insert. All rows must conform to the FOCUS schema for the version and type. If any row fails validation, the entire batch is rejected."
    ),
});

export function registerInsertFocusRowsTool(server: McpServer, db: SqlStorage) {
  server.tool(
    "insert_focus_rows",
    "Insert FOCUS rows into an existing dataset. All rows are validated against the FOCUS schema before any are written — if any row fails validation, the entire batch is rejected with the row index and error details. Can be called multiple times for the same dataset to load data in chunks.",
    schema.shape,
    async ({ datasetId, version, datasetType, rows }) => {
      const result = await Effect.runPromise(
        insertRows(datasetId, rows, version as FocusVersion, datasetType as DatasetType).pipe(
          Effect.provide(SqliteClient.layer({ db })),
          Effect.match({
            onFailure: (err) => ({
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify({ error: err }, null, 2),
                },
              ],
              isError: true as const,
            }),
            onSuccess: (res) => ({
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify(res, null, 2),
                },
              ],
            }),
          })
        )
      );

      return result;
    }
  );
}
