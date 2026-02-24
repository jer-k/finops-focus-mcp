import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import v12Jsonc from "../focus/v1-2/columns.jsonc";
import v12Md from "../focus/v1-2/columns.md";

import { stripComment } from "./json-helpers";

export function registerV12Resource(server: McpServer) {
  server.registerResource(
    "focus-schema-v1.2-json",
    "focus://schema/v1.2/json",
    { mimeType: "application/json" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: stripComment(v12Jsonc),
        },
      ],
    })
  );

  server.registerResource(
    "focus-schema-v1.2-markdown",
    "focus://schema/v1.2/markdown",
    { mimeType: "text/markdown" },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: v12Md }],
    })
  );
}
