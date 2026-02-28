import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { v10Queries } from "../queries";

export function registerQueriesV10Resource(server: McpServer) {
  for (const query of v10Queries) {
    server.registerResource(
      `focus-query-v1.0-${query.id}`,
      `focus://queries/v1.0/${query.id}`,
      { mimeType: "application/json" },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ version: "1.0", query }, null, 2),
          },
        ],
      })
    );
  }
}
