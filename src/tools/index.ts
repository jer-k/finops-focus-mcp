import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerExecuteFocusCodemodeTool } from "./codemode";
import { registerCreateFocusDatasetTool } from "./create-focus-dataset";
import { registerInsertFocusRowsTool } from "./insert-focus-rows";
import { registerListFocusColumnsTool } from "./list-focus-columns";
import { registerListFocusDatasetsTool } from "./list-focus-datasets";
import { registerSearchFocusQueriesTool } from "./search-focus-queries";

export function registerTools(server: McpServer, db: SqlStorage, env: { LOADER: WorkerLoader }) {
  registerListFocusColumnsTool(server);
  registerSearchFocusQueriesTool(server);
  registerExecuteFocusCodemodeTool(server, db, env);
  registerCreateFocusDatasetTool(server, db);
  registerInsertFocusRowsTool(server, db);
  registerListFocusDatasetsTool(server, db);
}
