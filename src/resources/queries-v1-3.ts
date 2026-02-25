import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { v13Queries } from "../queries";

export function registerQueriesV13Resource(server: McpServer) {
  server.registerResource(
    "focus-queries-v1.3",
    "focus://queries/v1.3",
    { mimeType: "application/json" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({ version: "1.3", queries: v13Queries }, null, 2),
        },
      ],
    })
  );
}
