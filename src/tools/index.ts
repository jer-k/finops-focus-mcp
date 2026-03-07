import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerExecuteFocusCodemodeTool } from "./codemode";
import { registerListFocusColumnsTool } from "./list-focus-columns";
import { registerSearchFocusQueriesTool } from "./search-focus-queries";

export function registerTools(server: McpServer, db: SqlStorage, env: { LOADER: WorkerLoader }) {
  registerListFocusColumnsTool(server);
  registerSearchFocusQueriesTool(server);
  registerExecuteFocusCodemodeTool(server, db, env);
}
