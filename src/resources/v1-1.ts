import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import v11Jsonc from "../focus/v1-1/columns.jsonc";
import v11Md from "../focus/v1-1/columns.md";

import { stripComment } from "./json-helpers";

export function registerV11Resource(server: McpServer) {
  server.registerResource(
    "focus-schema-v1.1-json",
    "focus://schema/v1.1/json",
    { mimeType: "application/json" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: stripComment(v11Jsonc),
        },
      ],
    }),
  );

  server.registerResource(
    "focus-schema-v1.1-markdown",
    "focus://schema/v1.1/markdown",
    { mimeType: "text/markdown" },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: v11Md }],
    }),
  );
}
