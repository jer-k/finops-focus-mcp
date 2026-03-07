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
├── errors.ts      # Domain error types: DatasetNotFoundError, RowValidationError, VersionMismatchError, DatasetTypeMismatchError
├── insert-rows.ts # Effect programs: createDataset, validateRows, serializeJsonFields, insertRows, listDatasets
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
├── create-focus-dataset.ts         # create_focus_dataset tool
├── insert-focus-rows.ts            # insert_focus_rows tool
├── list-focus-datasets.ts          # list_focus_datasets tool
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
| `create_focus_dataset` | `create-focus-dataset.ts` | Create a dataset metadata record. Takes `name`, `focusVersion`, and `datasetType`. Returns a `datasetId` for use with `insert_focus_rows`. `contract_commitment` type is only valid for v1.3. |
| `insert_focus_rows` | `insert-focus-rows.ts` | Insert FOCUS rows into an existing dataset. Validates all rows against the FOCUS schema before writing any — fail-fast on the first invalid row (returns `rowIndex` + reason). Updates `rowCount` on success. Can be called multiple times for the same dataset. |
| `list_focus_datasets` | `list-focus-datasets.ts` | List all loaded datasets. Returns `id`, `name`, `focusVersion`, `datasetType`, `rowCount`, `createdAt`. Supports optional `focusVersion` and `datasetType` filters. |
| `list_focus_columns` | `list-focus-columns.ts` | List and filter FOCUS spec columns for a version. Supports `featureLevel`, `columnType`, and `search` filters. v1.3 results include a `dataset` field (`Cost and Usage` / `Contract Commitment`). |
| `search_focus_queries` | `search-focus-queries.ts` | Search available canned FOCUS queries for a version. Returns query IDs, names, SQL, and parameters. Optional `search` substring filter on id/name. |
| `execute_focus_query` | `codemode/index.ts` | Execute a JavaScript async arrow function (via `@cloudflare/codemode` `DynamicWorkerExecutor`). The function can call `codemode.execute_raw_sql` and `codemode.execute_canned_sql` to run multi-step queries with logic between them. |

### Codemode sub-functions

| Function | File | Description |
|---|---|---|
| `execute_raw_sql` | `codemode/execute-focus-sql.ts` | Run a raw `SELECT` against a versioned FOCUS table. Use `focus_data_table` as the table name placeholder. Positional `?` params supported. |
| `execute_canned_sql` | `codemode/execute-focus-query.ts` | Run a canned query by `queryId` for a given version. Named params passed as a `Record<string, string \| number>`. |

### Tool registration pattern

Each tool file exports a `register*` function that takes `McpServer` (and `db: SqlStorage` for tools that access the database). `src/tools/index.ts` calls all of them:

```ts
export function registerTools(server: McpServer, db: SqlStorage, env: { LOADER: WorkerLoader }) {
  registerListFocusColumnsTool(server);
  registerSearchFocusQueriesTool(server);
  registerExecuteFocusCodemodeTool(server, db, env);
  registerCreateFocusDatasetTool(server, db);
  registerInsertFocusRowsTool(server, db);
  registerListFocusDatasetsTool(server, db);
}
```

### Data upload flow

1. Call `create_focus_dataset` → returns `{ id, name, focusVersion, datasetType, rowCount, createdAt }`
2. Call `insert_focus_rows` with the `datasetId` and an array of row objects → returns `{ inserted: N }`
   - Rows are validated against the FOCUS Effect schema for the version and type before any writes
   - JSON fields (`Tags`, `AllocatedMethodDetails`, etc.) are serialized automatically
3. Repeat step 2 to load additional chunks
4. Query data with `execute_focus_query` or `execute_focus_sql`

### Storage notes (insert path)

- `focus_datasets` uses **snake_case** columns in SQL: `focus_version`, `dataset_type`, `row_count`, `created_at`
- Row tables use `dataset_id` (snake_case FK) + **PascalCase** FOCUS field names (`BilledCost`, `BillingAccountId`, …)
- JSON-typed FOCUS fields must be `JSON.stringify`'d before `sql.unsafe` insert — handled by `serializeJsonFields` in `src/storage/insert-rows.ts`:
  - v1.0–v1.2: `Tags`
  - v1.3 cost_and_usage: `Tags`, `AllocatedMethodDetails`, `AllocatedTags`, `ContractApplied`, `SkuPriceDetails`
- Dataset IDs are generated with `crypto.randomUUID()` (available as a global in Cloudflare Workers)

## Tests

Tests live under `src/test/`, mirroring the source structure:

```
src/test/
├── focus/
│   ├── v1-0/schema.test.ts
│   ├── v1-1/schema.test.ts
│   ├── v1-2/schema.test.ts
│   └── v1-3/schema.test.ts
├── queries/
│   ├── catalog.test.ts
│   ├── execute-canned-sql.test.ts
│   ├── execute-raw-sql.test.ts
│   └── helpers.test.ts
├── storage/
│   └── models.test.ts
└── tools/
    ├── create-focus-dataset.test.ts  # Zod schema + guard logic (no DB)
    ├── insert-focus-rows.test.ts     # validateRows + serializeJsonFields (pure, no DB)
    ├── list-focus-columns.test.ts
    ├── list-focus-datasets.test.ts   # Zod schema + query-builder logic (no DB)
    └── search-focus-queries.test.ts
```

Run with `npm test` (vitest). Each schema test file has:

- Two "parses a valid row" tests using fixtures
- One "rejects empty object" test
- One "rejects wrong type on a mandatory numeric field" test

Use `Schema.decodeUnknownExit` (not `decodeUnknownSync`) in tests so failures surface as inspectable `Exit.Failure` values rather than thrown exceptions.

For pure Effect functions with no IO (e.g. `validateRows`), use `Effect.runSyncExit` in tests.

## Verification

After any code changes, run all of the following and fix any issues before considering the task complete:

| Command              | Purpose                  |
| -------------------- | ------------------------ |
| `npm run type-check` | TypeScript type checking |
| `npm run lint:fix`   | Lint and auto-fix        |
| `npm run format`     | Format code              |
