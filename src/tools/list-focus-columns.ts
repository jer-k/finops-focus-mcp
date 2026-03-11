import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { pipe } from "effect";
import { z } from "zod";

import { columns as v10Columns } from "../focus/v1-0/columns";
import { columns as v11Columns } from "../focus/v1-1/columns";
import { columns as v12Columns } from "../focus/v1-2/columns";
import { contractCommitmentColumns, costAndUsageColumns } from "../focus/v1-3/columns";
import type { FocusVersion } from "../queries/types";

const schema = z.object({
  version: z.enum(["1.0", "1.1", "1.2", "1.3"]).describe("FOCUS spec version to list columns for"),
  featureLevel: z
    .enum(["Mandatory", "Conditional", "Recommended", "Optional"])
    .optional()
    .describe("Filter columns by feature level"),
  columnType: z
    .enum(["Dimension", "Metric"])
    .optional()
    .describe(
      'Filter columns by type. Columns with type "Dimension / Metric" (e.g., ContractApplied in v1.3) are excluded when this filter is applied.'
    ),
  search: z.string().optional().describe("Case-insensitive substring search against columnId and description"),
});

type RawColumn = {
  name: string;
  displayName: string;
  columnType: string;
  dataType: string;
  status: string;
  category: string;
  introducedVersion: string;
  description: string;
  deprecated?: boolean;
  dataset?: "Cost and Usage" | "Contract Commitment";
};

type ColumnEntry = {
  columnId: string;
  displayName: string;
  columnType: string;
  dataType: string;
  featureLevel: string;
  category: string;
  introducedVersion: string;
  description: string;
  deprecated?: true;
  dataset?: "Cost and Usage" | "Contract Commitment";
};

function getColumns(version: FocusVersion): RawColumn[] {
  switch (version) {
    case "1.0":
      return v10Columns;
    case "1.1":
      return v11Columns;
    case "1.2":
      return v12Columns;
    case "1.3":
      return [
        ...costAndUsageColumns.map((c) => ({ ...c, dataset: "Cost and Usage" as const })),
        ...contractCommitmentColumns.map((c) => ({ ...c, dataset: "Contract Commitment" as const })),
      ];
  }
}

function toColumnEntry(c: RawColumn): ColumnEntry {
  const entry: ColumnEntry = {
    columnId: c.name,
    displayName: c.displayName,
    columnType: c.columnType,
    dataType: c.dataType,
    featureLevel: c.status,
    category: c.category,
    introducedVersion: c.introducedVersion,
    description: c.description,
  };
  if (c.deprecated) entry.deprecated = true;
  if (c.dataset) entry.dataset = c.dataset;
  return entry;
}

export function listFocusColumns(version: FocusVersion, featureLevel?: string, columnType?: string, search?: string) {
  const columns = pipe(
    getColumns(version),
    (cols) => (featureLevel ? cols.filter((c) => c.status === featureLevel) : cols),
    (cols) => (columnType ? cols.filter((c) => c.columnType === columnType) : cols),
    (cols) => {
      if (!search) return cols;
      const q = search.toLowerCase();
      return cols.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    },
    (cols) => cols.map(toColumnEntry)
  );

  return {
    version,
    totalColumns: columns.length,
    filtersApplied: {
      ...(featureLevel && { featureLevel }),
      ...(columnType && { columnType }),
      ...(search && { search }),
    },
    columns,
  };
}

export function registerListFocusColumnsTool(server: McpServer) {
  server.registerTool(
    "list-focus-columns",
    {
      description:
        "List and filter FOCUS spec columns for a given version. Returns column metadata including ID, display name, type, data type, and feature level. Supports filtering by feature level (Mandatory/Conditional/Recommended/Optional), column type (Dimension/Metric), and free-text search on column ID or description. For v1.3, results include a dataset field indicating whether the column belongs to the Cost and Usage or Contract Commitment dataset.",
      inputSchema: schema.shape,
    },
    async ({ version, featureLevel, columnType, search }) => {
      const result = listFocusColumns(version as FocusVersion, featureLevel, columnType, search);
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
