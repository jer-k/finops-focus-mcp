import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerExecuteFocusQueryTool } from "./execute-focus-query";
import { registerExecuteFocusSqlTool } from "./execute-focus-sql";

export function registerTools(server: McpServer, db: SqlStorage) {
  registerExecuteFocusQueryTool(server, db);
  registerExecuteFocusSqlTool(server, db);
}
