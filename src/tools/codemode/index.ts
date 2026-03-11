import { DynamicWorkerExecutor, generateTypes, type ToolDescriptors } from "@cloudflare/codemode";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import * as executeFocusQuery from "./execute-focus-query";
import * as executeFocusSql from "./execute-focus-sql";

const descriptors: ToolDescriptors = {
  execute_raw_sql: executeFocusSql.descriptor,
  execute_canned_sql: executeFocusQuery.descriptor,
};

const TYPES = generateTypes(descriptors);

const TOOL_DESCRIPTION = `Execute multiple SQL operations with logic between them using a JavaScript function.

Use this tool when you need to:
- Compare results across FOCUS spec versions (v1.0, v1.1, v1.2, v1.3)
- Apply conditional fallback logic (try a canned query, fall back to custom SQL)
- Iterate over result sets (e.g. query distinct providers, then query cost per provider)
- Query both cost-and-usage and contract-commitment tables (v1.3) in one pass

Available functions:
${TYPES}

Write an async arrow function in JavaScript. Do NOT use TypeScript syntax — no type annotations, interfaces, or generics. Do NOT define named functions and then call them — write the arrow function body directly.

Example — compare total cost across all versions:
\`\`\`js
async () => {
  const versions = ["1.0", "1.1", "1.2", "1.3"];
  const results = {};
  for (const version of versions) {
    const rows = await codemode.execute_raw_sql({
      version,
      sql: "SELECT SUM(BilledCost) as total FROM focus_data_table",
    });
    results[version] = rows[0]?.total ?? null;
  }
  return results;
}
\`\`\``;

export function registerExecuteFocusCodemodeTool(server: McpServer, db: SqlStorage, env: { LOADER: WorkerLoader }) {
  const fns: Record<string, (args: unknown) => Promise<unknown>> = {
    execute_raw_sql: executeFocusSql.createFn(db),
    execute_canned_sql: executeFocusQuery.createFn(db),
  };

  server.registerTool(
    "execute_focus_query",
    {
      description: TOOL_DESCRIPTION,
      inputSchema: { code: z.string().describe("JavaScript async arrow function to execute") },
    },
    async ({ code }) => {
      const executor = new DynamicWorkerExecutor({ loader: env.LOADER });
      const executeResult = await executor.execute(
        code,
        fns as Record<string, (...args: unknown[]) => Promise<unknown>>
      );

      const output: Record<string, unknown> = { result: executeResult.result };
      if (executeResult.error) output.error = executeResult.error;
      if (executeResult.logs?.length) output.logs = executeResult.logs;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(output, null, 2),
          },
        ],
      };
    }
  );
}
