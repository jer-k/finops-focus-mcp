# finops-focus-mcp

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for working with [FinOps FOCUS](https://focus.finops.org) cost and usage data. Built on Cloudflare Workers with a SQLite-backed Durable Object as a playground environment for exploring FOCUS data.

## What is FOCUS?

[FOCUS (FinOps Open Cost and Usage Specification)](https://focus.finops.org) is an open specification that defines a consistent schema for cloud cost and usage data across providers. This MCP server provides tooling to query, explore, and analyze FOCUS-formatted datasets.

Supported spec versions: **v1.0, v1.1, v1.2, v1.3**

## Features

### Tools

| Tool | Description |
|---|---|
| `execute_focus_query` | Run a named FOCUS use-case query by ID against your uploaded dataset |
| `execute_focus_sql` | Execute arbitrary `SELECT` SQL against your dataset using `focus_data_table` as the table name |
| `search_focus_queries` | Discover available FOCUS use-case queries for a given spec version |
| `list-focus-columns` | List and filter FOCUS spec column definitions with metadata |

### Resources

Each resource is addressable by URI and readable by any MCP client.

| URI pattern | Description |
|---|---|
| `focus://schema/v{version}/json` | FOCUS column schema for a given version as JSON |
| `focus://schema/v{version}/markdown` | FOCUS column schema for a given version as Markdown |
| `focus://queries/v{version}/{queryId}` | Individual query definition (SQL, parameters, metadata) |

## Architecture

```
Cloudflare Worker (HTTP)
└── /mcp  →  FinopsFocusMcpAgent (Durable Object)
              ├── McpServer (@modelcontextprotocol/sdk)
              │   ├── Tools (src/tools/)
              │   └── Resources (src/resources/)
              ├── SQLite (via @effect/sql-sqlite-do)
              │   └── FOCUS row tables per version
              └── Effect (typed SQL + error handling)
```

- **Runtime:** Cloudflare Workers with [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- **MCP transport:** HTTP (`/mcp` endpoint), using the [`agents`](https://github.com/cloudflare/agents) SDK
- **Database:** SQLite embedded in the Durable Object — no external database required
- **SQL layer:** [Effect](https://effect.website) + `@effect/sql-sqlite-do` for type-safe queries
- **Linting/formatting:** [Biome](https://biomejs.dev)

> **Note:** The SQLite backend is a playground for exploring and testing FOCUS data. It is not intended for production-scale datasets.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works for development)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (installed as a dev dependency)

### Install dependencies

```sh
npm install
```

### Run locally

```sh
npm run dev
```

The MCP server will be available at `http://localhost:8787/mcp`.

### Connect to an MCP client

The MCP server uses HTTP transport at the `/mcp` endpoint. Replace `http://localhost:8787` with your deployed worker URL when connecting to a production instance.

#### Claude Code

Add the server using the CLI:

```sh
claude mcp add --transport http finops-focus http://localhost:8787/mcp
```

Or add it manually to your project's `.claude/settings.json` (or `~/.claude/settings.json` for global access):

```json
{
  "mcpServers": {
    "finops-focus": {
      "type": "http",
      "url": "http://localhost:8787/mcp"
    }
  }
}
```

Verify it's connected with `/mcp` in the Claude Code chat.

#### Claude Desktop

Add an entry to your `claude_desktop_config.json`:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "finops-focus": {
      "url": "http://localhost:8787/mcp"
    }
  }
}
```

Restart Claude Desktop after saving. The FOCUS tools will appear in the tool picker.

#### Cursor

Add an entry to your project's `.cursor/mcp.json` (or `~/.cursor/mcp.json` for global access):

```json
{
  "mcpServers": {
    "finops-focus": {
      "url": "http://localhost:8787/mcp"
    }
  }
}
```

### Deploy to Cloudflare

```sh
npm run deploy
```

## Development

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server (Wrangler) |
| `npm test` | Run tests (Vitest) |
| `npm run type-check` | TypeScript type checking |
| `npm run lint:fix` | Lint and auto-fix with Biome |
| `npm run format` | Format code with Biome |
| `npm run generate` | Regenerate FOCUS spec docs from source |
| `npm run deploy` | Deploy to Cloudflare Workers |

### Project structure

```
src/
├── index.ts              # Worker entry point, FinopsFocusMcpAgent class
├── focus/                # Effect schemas for each FOCUS spec version
│   ├── v1-0/             # columns.ts, schema.ts, index.ts
│   ├── v1-1/
│   ├── v1-2/
│   └── v1-3/             # two datasets: cost-and-usage + contract-commitment
├── queries/              # FOCUS use-case query catalog per version
│   ├── types.ts          # FocusQuery, FocusVersion, QueryParam types
│   ├── shared.ts         # Queries shared across versions
│   ├── v1-0.ts
│   ├── v1-1.ts
│   ├── v1-2.ts
│   └── v1-3.ts
├── resources/            # MCP resource registrations
│   ├── index.ts
│   ├── v1-{0..3}.ts      # Schema resources (JSON + Markdown)
│   └── queries-v1-{0..3}.ts  # Per-query resources
├── storage/              # SQLite models, migrations, Effect SQL programs
│   ├── models.ts
│   ├── migrations.ts
│   ├── programs.ts
│   └── index.ts
├── tools/                # MCP tool registrations
│   ├── index.ts
│   ├── execute-focus-query.ts
│   ├── execute-focus-sql.ts
│   ├── search-focus-queries.ts
│   ├── list-focus-columns.ts
│   ├── helpers.ts
│   └── types.ts
└── test/                 # Tests mirroring src structure
    ├── focus/
    └── tools/
```

### Adding a query

Queries live in `src/queries/`. Each `FocusQuery` has an `id`, `name`, `sql` (using `focus_data_table` as the table name placeholder), and a `params` array describing any positional `?` parameters:

```ts
{
  id: "my_new_query",
  name: "My New Query",
  sql: "SELECT * FROM focus_data_table WHERE ChargePeriodStart >= ? LIMIT 100",
  params: [
    { name: "start_date", type: "DateTime", description: "Start of the charge period" }
  ]
}
```

Add it to the appropriate version file (`v1-0.ts` through `v1-3.ts`) and it will automatically be available as a resource and via the `search_focus_queries` and `execute_focus_query` tools.

### Adding a FOCUS spec version

1. Create `src/focus/v{X-Y}/` with `columns.ts`, `schema.ts`, and `index.ts` following the existing version layout
2. Add a model and migration in `src/storage/`
3. Add a query file in `src/queries/`
4. Register resources in `src/resources/`
5. Wire up tools in `src/tools/`

## Contributing

Contributions are welcome. Please open an issue to discuss larger changes before submitting a pull request.

## License

MIT
