# AGENTS.md

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## FOCUS Schemas

Effect Schemas for each FOCUS spec version live under `src/focus/`:

```
src/focus/
├── v1-0/
│   ├── columns.ts   # FocusColumn metadata array
│   ├── schema.ts    # Effect Schema — CostAndUsageRow
│   └── index.ts     # re-exports
├── v1-1/            # same layout
├── v1-2/            # same layout
└── v1-3/
    ├── columns.ts   # two arrays: costAndUsageColumns, contractCommitmentColumns
    ├── schema.ts    # CostAndUsageRow + ContractCommitmentRow
    └── index.ts
```

### Schema conventions

- **Mandatory** FOCUS columns → non-optional fields (`Schema.String`, `Schema.Number`)
- **Recommended / Conditional / Optional** columns → `Schema.optional(...)`
- `ChargeClass` is `Schema.NullOr(Schema.Literal("Correction"))` in all versions — the column is always present but its value is `null` for regular charges and `"Correction"` for correction rows
- DateTime columns use `Schema.String` (ISO 8601 strings)
- Tags / KeyValue columns use `Schema.Record(Schema.String, Schema.String)`
- JSON columns use `Schema.Unknown` or a typed nested `Schema.Struct`

## Storage (Effect SQL)

SQLite tables are managed via Effect SQL using the `@effect/sql-sqlite-do` package. Source lives under `src/storage/`:

```
src/storage/
├── models.ts      # Model.Class definitions — one per table
├── migrations.ts  # DDL migrations via Migrator.fromRecord
├── programs.ts    # createFocusTables Effect (runs migrations)
└── index.ts       # re-exports
```

### Models

| Model | Table | Description |
|---|---|---|
| `FocusDataset` | `focus_datasets` | Upload metadata — name, version, type, row count, timestamp |
| `FocusRowV10` | `focus_rows_v10` | v1.0 cost and usage rows |
| `FocusRowV11` | `focus_rows_v11` | v1.1 cost and usage rows |
| `FocusRowV12` | `focus_rows_v12` | v1.2 cost and usage rows |
| `FocusRowV13` | `focus_rows_v13` | v1.3 cost and usage rows |
| `FocusRowV13ContractCommitment` | `focus_rows_v13_contract_commitment` | v1.3 contract commitment rows |

Each row model has `id: Model.Generated(Schema.Number)` and `datasetId: Schema.String` (FK to `focus_datasets.id`), then spreads the corresponding FOCUS schema's `.fields`.

## MCP Tools

Tools are registered in `src/tools/` and exposed via the MCP server.

```
src/tools/
├── index.ts                        # registerTools — calls all register* functions
├── list-focus-columns.ts           # list_focus_columns tool
├── search-focus-queries.ts         # search_focus_queries tool
└── codemode/
    ├── index.ts                    # registerExecuteFocusCodemodeTool — execute_focus_query tool
    ├── execute-focus-query.ts      # codemode sub-fn: execute_canned_sql descriptor + createFn
    └── execute-focus-sql.ts        # codemode sub-fn: execute_raw_sql descriptor + createFn
```

### Tool catalog

| Tool name | File | Description |
|---|---|---|
| `list_focus_columns` | `list-focus-columns.ts` | List and filter FOCUS spec columns for a version. Supports `featureLevel`, `columnType`, and `search` filters. v1.3 results include a `dataset` field (`Cost and Usage` / `Contract Commitment`). |
| `search_focus_queries` | `search-focus-queries.ts` | Search available canned FOCUS queries for a version. Returns query IDs, names, SQL, and parameters. Optional `search` substring filter on id/name. |
| `execute_focus_query` | `codemode/index.ts` | Execute a JavaScript async arrow function (via `@cloudflare/codemode` `DynamicWorkerExecutor`). The function can call `codemode.execute_raw_sql` and `codemode.execute_canned_sql` to run multi-step queries with logic between them. |

### Codemode sub-functions

| Function | File | Description |
|---|---|---|
| `execute_raw_sql` | `codemode/execute-focus-sql.ts` | Run a raw `SELECT` against a versioned FOCUS table. Use `focus_data_table` as the table name placeholder. Positional `?` params supported. |
| `execute_canned_sql` | `codemode/execute-focus-query.ts` | Run a canned query by `queryId` for a given version. Named params passed as a `Record<string, string \| number>`. |

### Tool registration pattern

Each tool file exports a `register*` function that takes `McpServer` (and `db`/`env` for codemode). `src/tools/index.ts` calls all of them:

```ts
export function registerTools(server: McpServer, db: SqlStorage, env: { LOADER: WorkerLoader }) {
  registerListFocusColumnsTool(server);
  registerSearchFocusQueriesTool(server);
  registerExecuteFocusCodemodeTool(server, db, env);
}
```

## Tests

Tests live under `src/test/`, mirroring the source structure:

```
src/test/focus/
├── v1-0/schema.test.ts
├── v1-1/schema.test.ts
├── v1-2/schema.test.ts
└── v1-3/schema.test.ts
```

Run with `npm test` (vitest). Each test file has:

- Two "parses a valid row" tests using fixtures
- One "rejects empty object" test
- One "rejects wrong type on a mandatory numeric field" test

Use `Schema.decodeUnknownExit` (not `decodeUnknownSync`) in tests so failures surface as inspectable `Exit.Failure` values rather than thrown exceptions.

## Verification

After any code changes, run all of the following and fix any issues before considering the task complete:

| Command              | Purpose                  |
| -------------------- | ------------------------ |
| `npm run type-check` | TypeScript type checking |
| `npm run lint:fix`   | Lint and auto-fix        |
| `npm run format`     | Format code              |
