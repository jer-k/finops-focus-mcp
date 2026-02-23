import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import v10Jsonc from "../focus/v1-0/columns.jsonc";
import v10Md from "../focus/v1-0/columns.md";

import { stripComment } from "./json-helpers";

export function registerV10Resource(server: McpServer) {
  server.registerResource(
    "focus-schema-v1.0-json",
    "focus://schema/v1.0/json",
    { mimeType: "application/json" },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "application/json", text: stripComment(v10Jsonc) }],
    }),
  );

  server.registerResource(
    "focus-schema-v1.0-markdown",
    "focus://schema/v1.0/markdown",
    { mimeType: "text/markdown" },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: v10Md }],
    }),
  );
}
