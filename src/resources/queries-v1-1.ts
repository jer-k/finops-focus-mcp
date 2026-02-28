import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { v11Queries } from "../queries";

export function registerQueriesV11Resource(server: McpServer) {
  for (const query of v11Queries) {
    server.registerResource(
      `focus-query-v1.1-${query.id}`,
      `focus://queries/v1.1/${query.id}`,
      { mimeType: "application/json" },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ version: "1.1", query }, null, 2),
          },
        ],
      })
    );
  }
}
