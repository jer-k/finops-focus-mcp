#!/usr/bin/env tsx
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SchemaAST } from "effect";

// Column data
import { columns as v10Columns } from "../src/focus/v1-0/columns";
// Schema ASTs (for nullable + allowedValues introspection)
import { CostAndUsageRow as v10Row } from "../src/focus/v1-0/schema";
import { columns as v11Columns } from "../src/focus/v1-1/columns";
import { CostAndUsageRow as v11Row } from "../src/focus/v1-1/schema";
import { columns as v12Columns } from "../src/focus/v1-2/columns";
import { CostAndUsageRow as v12Row } from "../src/focus/v1-2/schema";
import {
  contractCommitmentColumns as v13ContractCommitmentColumns,
  costAndUsageColumns as v13CostAndUsageColumns,
} from "../src/focus/v1-3/columns";
import {
  ContractCommitmentRow as v13ContractCommitmentRow,
  CostAndUsageRow as v13CostAndUsageRow,
} from "../src/focus/v1-3/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GENERATED_COMMENT = "Auto-generated. Do not edit directly. Run `npm run generate` to update.";

// ---------------------------------------------------------------------------
// Base column type that covers all versions
// ---------------------------------------------------------------------------

type BaseColumn = {
  name: string;
  displayName: string;
  introducedVersion: string;
  category: string;
  dataType: string;
  status: string;
  description: string;
  deprecated?: boolean;
};

type EnrichedColumn = BaseColumn & {
  nullable: boolean;
  allowedValues: string[] | null;
};

// ---------------------------------------------------------------------------
// AST introspection
// ---------------------------------------------------------------------------

// In Effect v4 beta the struct AST tag is "Objects" and optional fields are
// represented as Union(innerType, Undefined) rather than isOptional = true.
// Null is its own tag "Null" (distinct from Literal).

type TaggedAST = SchemaAST.AST & { _tag: string };

/**
 * Recursively collect all literal string values (and null for Null nodes)
 * from a union tree. Ignores Undefined (optional wrapper) and non-literal types.
 */
function collectLiterals(ast: SchemaAST.AST): Array<string | null> {
  const tag = (ast as TaggedAST)._tag;
  switch (tag) {
    case "Literal": {
      const lit = (ast as SchemaAST.Literal).literal;
      return typeof lit === "string" ? [lit] : [];
    }
    case "Null":
      return [null];
    case "Undefined":
      return []; // optional wrapper — not a value
    case "Union":
      return (ast as SchemaAST.Union).types.flatMap(collectLiterals);
    default:
      return [];
  }
}

function analyzeField(ast: SchemaAST.AST): {
  nullable: boolean;
  allowedValues: string[] | null;
} {
  const literals = collectLiterals(ast);
  if (literals.length === 0) return { nullable: false, allowedValues: null };

  const nullable = literals.includes(null);
  const stringLiterals = literals.filter((l): l is string => l !== null);
  return {
    nullable,
    allowedValues: stringLiterals.length > 0 ? stringLiterals : null,
  };
}

function buildFieldInfoMap(
  schemaAst: SchemaAST.AST
): Map<string, { nullable: boolean; allowedValues: string[] | null }> {
  const map = new Map<string, { nullable: boolean; allowedValues: string[] | null }>();
  // In Effect v4 beta, Schema.Struct produces an AST with _tag "Objects"
  if ((schemaAst as TaggedAST)._tag !== "Objects") return map;
  const typeLiteral = schemaAst as SchemaAST.AST & {
    propertySignatures: ReadonlyArray<{
      name: PropertyKey;
      type: SchemaAST.AST;
    }>;
  };
  for (const prop of typeLiteral.propertySignatures) {
    map.set(String(prop.name), analyzeField(prop.type));
  }
  return map;
}

function enrichColumns(columns: BaseColumn[], schemaAst: SchemaAST.AST): EnrichedColumn[] {
  const fieldInfo = buildFieldInfoMap(schemaAst);
  return columns.map((col) => ({
    ...col,
    ...(fieldInfo.get(col.name) ?? { nullable: false, allowedValues: null }),
  }));
}

// ---------------------------------------------------------------------------
// JSON output
// ---------------------------------------------------------------------------

function buildJson(version: string, columns: EnrichedColumn[]): object {
  return { version, columns };
}

function buildJsonV13(costAndUsage: EnrichedColumn[], contractCommitment: EnrichedColumn[]): object {
  return {
    version: "1.3",
    costAndUsage: { columns: costAndUsage },
    contractCommitment: { columns: contractCommitment },
  };
}

// ---------------------------------------------------------------------------
// Markdown output
// ---------------------------------------------------------------------------

const TABLE_HEADER =
  "| Column | Display Name | Category | Type | Introduced | Status | Nullable | Allowed Values | Description |";
const TABLE_DIVIDER =
  "|--------|-------------|----------|------|------------|--------|----------|----------------|-------------|";

function buildMarkdownTable(columns: EnrichedColumn[]): string {
  const rows = columns.map((col) => {
    const nameCell = `\`${col.name}\`${col.deprecated ? " *(deprecated)*" : ""}`;
    const allowedValues = col.allowedValues != null ? col.allowedValues.join(", ") : "—";
    const description = col.description.replace(/\|/g, "\\|");
    return `| ${nameCell} | ${col.displayName} | ${col.category} | ${col.dataType} | ${col.introducedVersion} | ${col.status} | ${col.nullable ? "Yes" : "No"} | ${allowedValues} | ${description} |`;
  });
  return [TABLE_HEADER, TABLE_DIVIDER, ...rows].join("\n");
}

function buildMarkdown(version: string, dataset: string, columns: EnrichedColumn[]): string {
  return [
    `<!-- ${GENERATED_COMMENT} -->`,
    `# FOCUS v${version} ${dataset} Columns`,
    "",
    buildMarkdownTable(columns),
    "",
  ].join("\n");
}

function buildMarkdownV13(costAndUsage: EnrichedColumn[], contractCommitment: EnrichedColumn[]): string {
  return [
    `<!-- ${GENERATED_COMMENT} -->`,
    "# FOCUS v1.3 Columns",
    "",
    "## Cost and Usage",
    "",
    buildMarkdownTable(costAndUsage),
    "",
    "## Contract Commitment",
    "",
    buildMarkdownTable(contractCommitment),
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------

function writeFiles(dir: string, json: object, markdown: string): void {
  const jsonBody = `${JSON.stringify(json, null, 2)}\n`;
  writeFileSync(join(dir, "columns.jsonc"), `// ${GENERATED_COMMENT}\n${jsonBody}`);
  writeFileSync(join(dir, "columns.md"), markdown);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const srcDir = join(__dirname, "..", "src", "focus");

const v10Enriched = enrichColumns(v10Columns as BaseColumn[], v10Row.ast);
writeFiles(join(srcDir, "v1-0"), buildJson("1.0", v10Enriched), buildMarkdown("1.0", "Cost and Usage", v10Enriched));
console.log("✓ v1.0");

const v11Enriched = enrichColumns(v11Columns as BaseColumn[], v11Row.ast);
writeFiles(join(srcDir, "v1-1"), buildJson("1.1", v11Enriched), buildMarkdown("1.1", "Cost and Usage", v11Enriched));
console.log("✓ v1.1");

const v12Enriched = enrichColumns(v12Columns as BaseColumn[], v12Row.ast);
writeFiles(join(srcDir, "v1-2"), buildJson("1.2", v12Enriched), buildMarkdown("1.2", "Cost and Usage", v12Enriched));
console.log("✓ v1.2");

const v13CUEnriched = enrichColumns(v13CostAndUsageColumns as BaseColumn[], v13CostAndUsageRow.ast);
const v13CCEnriched = enrichColumns(v13ContractCommitmentColumns as BaseColumn[], v13ContractCommitmentRow.ast);
writeFiles(
  join(srcDir, "v1-3"),
  buildJsonV13(v13CUEnriched, v13CCEnriched),
  buildMarkdownV13(v13CUEnriched, v13CCEnriched)
);
console.log("✓ v1.3");

console.log("Done.");
