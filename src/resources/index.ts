import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerV10Resource } from "./v1-0";
import { registerV11Resource } from "./v1-1";
import { registerV12Resource } from "./v1-2";
import { registerV13Resources } from "./v1-3";

export function registerResources(server: McpServer) {
  registerV10Resource(server);
  registerV11Resource(server);
  registerV12Resource(server);
  registerV13Resources(server);
}
