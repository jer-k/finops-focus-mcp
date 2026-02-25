import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { v11Queries } from "../queries";

export function registerQueriesV11Resource(server: McpServer) {
  server.registerResource(
    "focus-queries-v1.1",
    "focus://queries/v1.1",
    { mimeType: "application/json" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({ version: "1.1", queries: v11Queries }, null, 2),
        },
      ],
    })
  );
}
