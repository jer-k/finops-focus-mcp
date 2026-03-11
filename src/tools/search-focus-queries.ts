import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { v10Queries, v11Queries, v12Queries, v13Queries } from "../queries";
import type { FocusQuery, FocusVersion } from "../queries/types";

const schema = z.object({
  version: z.enum(["1.0", "1.1", "1.2", "1.3"]).describe("FOCUS spec version"),
  search: z.string().optional().describe("Case-insensitive substring match on query id or name"),
});

const queriesByVersion: Record<FocusVersion, FocusQuery[]> = {
  "1.0": v10Queries,
  "1.1": v11Queries,
  "1.2": v12Queries,
  "1.3": v13Queries,
};

export function searchFocusQueries(version: FocusVersion, search?: string): FocusQuery[] {
  const queries = queriesByVersion[version];
  if (!search) {
    return queries;
  }
  const lower = search.toLowerCase();
  return queries.filter((q) => q.id.toLowerCase().includes(lower) || q.name.toLowerCase().includes(lower));
}

export function registerSearchFocusQueriesTool(server: McpServer) {
  server.registerTool(
    "search-focus-queries",
    {
      description:
        "Search and discover available FOCUS use-case queries for a given spec version. Returns query IDs, names, SQL, and parameters. Use the returned query IDs with execute-focus-query.",
      inputSchema: schema.shape,
    },
    async ({ version, search }) => {
      const queries = searchFocusQueries(version, search);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ version, count: queries.length, queries }, null, 2),
          },
        ],
      };
    }
  );
}
