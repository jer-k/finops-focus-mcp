import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerExecuteFocusQueryTool } from "./execute-focus-query";
import { registerExecuteFocusSqlTool } from "./execute-focus-sql";
import { registerListFocusColumnsTool } from "./list-focus-columns";
import { registerSearchFocusQueriesTool } from "./search-focus-queries";

export function registerTools(server: McpServer, db: SqlStorage) {
  registerExecuteFocusQueryTool(server, db);
  registerExecuteFocusSqlTool(server, db);
  registerListFocusColumnsTool(server);
  registerSearchFocusQueriesTool(server);
}
