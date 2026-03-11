import * as SqliteClient from "@effect/sql-sqlite-do/SqliteClient";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as Effect from "effect/Effect";
import { z } from "zod";

import type { FocusVersion } from "../queries/types";
import type { DatasetType } from "../storage/errors";
import { listDatasets } from "../storage/insert-rows";

const schema = z.object({
  focusVersion: z
    .enum(["1.0", "1.1", "1.2", "1.3"])
    .optional()
    .describe("Filter results to a specific FOCUS spec version"),
  datasetType: z
    .enum(["cost_and_usage", "contract_commitment"])
    .optional()
    .describe("Filter results to a specific dataset type"),
});

export function registerListFocusDatasetsTool(server: McpServer, db: SqlStorage) {
  server.registerTool(
    "list-focus-datasets",
    {
      description:
        "List all FOCUS datasets that have been loaded. Returns dataset IDs, names, versions, types, row counts, and creation timestamps. Use the returned dataset IDs with insert-focus-rows.",
      inputSchema: schema.shape,
    },
    async ({ focusVersion, datasetType }) => {
      const datasets = await Effect.runPromise(
        listDatasets(focusVersion as FocusVersion | undefined, datasetType as DatasetType | undefined).pipe(
          Effect.provide(SqliteClient.layer({ db }))
        )
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ count: datasets.length, datasets }, null, 2),
          },
        ],
      };
    }
  );
}
