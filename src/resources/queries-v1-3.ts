import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { v13Queries } from "../queries";

export function registerQueriesV13Resource(server: McpServer) {
  for (const query of v13Queries) {
    server.registerResource(
      `focus-query-v1.3-${query.id}`,
      `focus://queries/v1.3/${query.id}`,
      { mimeType: "application/json" },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ version: "1.3", query }, null, 2),
          },
        ],
      })
    );
  }
}
