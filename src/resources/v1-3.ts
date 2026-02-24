import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import v13Jsonc from "../focus/v1-3/columns.jsonc";
import v13Md from "../focus/v1-3/columns.md";

import { stripComment } from "./json-helpers";

export function registerV13Resources(server: McpServer) {
  server.registerResource(
    "focus-schema-v1.3-json",
    "focus://schema/v1.3/json",
    { mimeType: "application/json" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: stripComment(v13Jsonc),
        },
      ],
    }),
  );

  server.registerResource(
    "focus-schema-v1.3-markdown",
    "focus://schema/v1.3/markdown",
    { mimeType: "text/markdown" },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: v13Md }],
    }),
  );
}
