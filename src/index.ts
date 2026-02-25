import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";

import { registerResources } from "./resources";
import { registerTools } from "./tools";

export class FinopsFocusMcpAgent extends McpAgent {
  server = new McpServer({
    name: "FinOps FOCUS MCP",
    version: "0.1.0",
  });

  async init() {
    registerResources(this.server);
    registerTools(this.server, this.ctx.storage.sql);
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
