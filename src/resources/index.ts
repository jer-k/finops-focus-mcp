import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerQueriesV10Resource } from "./queries-v1-0";
import { registerQueriesV11Resource } from "./queries-v1-1";
import { registerQueriesV12Resource } from "./queries-v1-2";
import { registerQueriesV13Resource } from "./queries-v1-3";
import { registerV10Resource } from "./v1-0";
import { registerV11Resource } from "./v1-1";
import { registerV12Resource } from "./v1-2";
import { registerV13Resources } from "./v1-3";

export function registerResources(server: McpServer) {
  registerV10Resource(server);
  registerV11Resource(server);
  registerV12Resource(server);
  registerV13Resources(server);
  registerQueriesV10Resource(server);
  registerQueriesV11Resource(server);
  registerQueriesV12Resource(server);
  registerQueriesV13Resource(server);
}
