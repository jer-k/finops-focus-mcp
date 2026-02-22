import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { columns as v10Columns } from "./focus/v1-0";
import { columns as v11Columns } from "./focus/v1-1";

export class FinopsFocusMcpAgent extends McpAgent {
  server = new McpServer({
    name: "FinOps FOCUS MCP",
    version: "0.1.0",
  });

  async init() {
    this.server.registerResource(
      "focus-schema-v1.0",
      "focus://schema/v1.0",
      { mimeType: "application/json" },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ version: "1.0", columns: v10Columns }, null, 2),
          },
        ],
      }),
    );

    this.server.registerResource(
      "focus-schema-v1.1",
      "focus://schema/v1.1",
      { mimeType: "application/json" },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ version: "1.1", columns: v11Columns }, null, 2),
          },
        ],
      }),
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/mcp") {
      return FinopsFocusMcpAgent.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
