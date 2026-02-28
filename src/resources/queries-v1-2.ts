import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { v12Queries } from "../queries";

export function registerQueriesV12Resource(server: McpServer) {
  for (const query of v12Queries) {
    server.registerResource(
      `focus-query-v1.2-${query.id}`,
      `focus://queries/v1.2/${query.id}`,
      { mimeType: "application/json" },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ version: "1.2", query }, null, 2),
          },
        ],
      })
    );
  }
}
