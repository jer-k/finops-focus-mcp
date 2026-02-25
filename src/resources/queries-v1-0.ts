import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { v10Queries } from "../queries";

export function registerQueriesV10Resource(server: McpServer) {
  server.registerResource(
    "focus-queries-v1.0",
    "focus://queries/v1.0",
    { mimeType: "application/json" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({ version: "1.0", queries: v10Queries }, null, 2),
        },
      ],
    })
  );
}
