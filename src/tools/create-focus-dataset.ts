import * as SqliteClient from "@effect/sql-sqlite-do/SqliteClient";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as Effect from "effect/Effect";
import { z } from "zod";

import type { FocusVersion } from "../queries/types";
import { createDataset } from "../storage/insert-rows";
import type { DatasetType } from "../storage/errors";

const schema = z.object({
  name: z.string().describe("Human-readable name for this dataset"),
  focusVersion: z.enum(["1.0", "1.1", "1.2", "1.3"]).describe("FOCUS spec version"),
  datasetType: z
    .enum(["cost_and_usage", "contract_commitment"])
    .describe("Dataset type. 'contract_commitment' is only valid for focusVersion '1.3'"),
});

export function registerCreateFocusDatasetTool(server: McpServer, db: SqlStorage) {
  server.registerTool(
    "create-focus-dataset",
    {
      description:
        "Create a new FOCUS dataset record. Returns the dataset ID to use with insert-focus-rows. Call this once per upload, then call insert-focus-rows one or more times to load rows.",
      inputSchema: schema.shape,
    },
    async ({ name, focusVersion, datasetType }) => {
      if (datasetType === "contract_commitment" && focusVersion !== "1.3") {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: "contract_commitment datasets are only supported for FOCUS version 1.3",
              }),
            },
          ],
          isError: true,
        };
      }

      const dataset = await Effect.runPromise(
        createDataset(name, focusVersion as FocusVersion, datasetType as DatasetType).pipe(
          Effect.provide(SqliteClient.layer({ db }))
        )
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(dataset, null, 2) }],
      };
    }
  );
}
