import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { v12Queries } from "../queries";

export function registerQueriesV12Resource(server: McpServer) {
  server.registerResource(
    "focus-queries-v1.2",
    "focus://queries/v1.2",
    { mimeType: "application/json" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({ version: "1.2", queries: v12Queries }, null, 2),
        },
      ],
    })
  );
}
