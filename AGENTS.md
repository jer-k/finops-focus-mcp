# Cloudflare Workers

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Commands

| Command               | Purpose                   |
| --------------------- | ------------------------- |
| `npx wrangler dev`    | Local development         |
| `npx wrangler deploy` | Deploy to Cloudflare      |
| `npx wrangler types`  | Generate TypeScript types |

Run `wrangler types` after changing bindings in wrangler.jsonc.

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

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
