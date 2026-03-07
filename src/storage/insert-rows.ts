import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { Schema } from "effect";
import { SqlClient } from "effect/unstable/sql/SqlClient";

import * as V10 from "../focus/v1-0/schema";
import * as V11 from "../focus/v1-1/schema";
import * as V12 from "../focus/v1-2/schema";
import * as V13 from "../focus/v1-3/schema";
import type { FocusVersion } from "../queries/types";
import { DatasetNotFoundError, DatasetTypeMismatchError, RowValidationError, VersionMismatchError } from "./errors";
import type { DatasetType } from "./errors";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const rowTableNames: Record<FocusVersion, Record<DatasetType, string>> = {
  "1.0": { cost_and_usage: "focus_rows_v10", contract_commitment: "focus_rows_v10" },
  "1.1": { cost_and_usage: "focus_rows_v11", contract_commitment: "focus_rows_v11" },
  "1.2": { cost_and_usage: "focus_rows_v12", contract_commitment: "focus_rows_v12" },
  "1.3": {
    cost_and_usage: "focus_rows_v13",
    contract_commitment: "focus_rows_v13_contract_commitment",
  },
};

// Fields whose values are objects and must be JSON.stringify'd before sql.unsafe insert.
// SkuPriceDetails in v1.1/v1.2 is Schema.String in the FOCUS schema (already a string),
// so it does NOT appear here. v1.3 SkuPriceDetails is a Record, so it does.
const jsonFieldsByVersion: Record<FocusVersion, Record<DatasetType, string[]>> = {
  "1.0": { cost_and_usage: ["Tags"], contract_commitment: [] },
  "1.1": { cost_and_usage: ["Tags"], contract_commitment: [] },
  "1.2": { cost_and_usage: ["Tags"], contract_commitment: [] },
  "1.3": {
    cost_and_usage: ["Tags", "AllocatedMethodDetails", "AllocatedTags", "ContractApplied", "SkuPriceDetails"],
    contract_commitment: [],
  },
};

type DecodableSchema = Schema.Top & { readonly DecodingServices: never };

function getRowSchema(version: FocusVersion, datasetType: DatasetType): DecodableSchema {
  if (datasetType === "contract_commitment") {
    return V13.ContractCommitmentRow as unknown as DecodableSchema;
  }
  switch (version) {
    case "1.0":
      return V10.CostAndUsageRow as unknown as DecodableSchema;
    case "1.1":
      return V11.CostAndUsageRow as unknown as DecodableSchema;
    case "1.2":
      return V12.CostAndUsageRow as unknown as DecodableSchema;
    case "1.3":
      return V13.CostAndUsageRow as unknown as DecodableSchema;
  }
}

export function serializeJsonFields(
  row: Record<string, unknown>,
  version: FocusVersion,
  datasetType: DatasetType
): Record<string, unknown> {
  const jsonFields = jsonFieldsByVersion[version][datasetType];
  const result = { ...row };
  for (const field of jsonFields) {
    if (result[field] != null) {
      result[field] = JSON.stringify(result[field]);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// validateRows — pure (no IO), fail-fast on first invalid row
// ---------------------------------------------------------------------------

export function validateRows(
  rows: unknown[],
  version: FocusVersion,
  datasetType: DatasetType
): Effect.Effect<Record<string, unknown>[], RowValidationError> {
  return Effect.gen(function* () {
    const schema = getRowSchema(version, datasetType);
    const validated: Record<string, unknown>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const exit = Schema.decodeUnknownExit(schema)(rows[i]);
      if (Exit.isFailure(exit)) {
        const cause = Cause.squash(exit.cause);
        return yield* Effect.fail(new RowValidationError({ rowIndex: i, reason: String(cause) }));
      }
      validated.push(exit.value as Record<string, unknown>);
    }

    return validated;
  });
}

// ---------------------------------------------------------------------------
// createDataset
// ---------------------------------------------------------------------------

export type DatasetRecord = {
  id: string;
  name: string;
  focusVersion: FocusVersion;
  datasetType: DatasetType;
  rowCount: number;
  createdAt: string;
};

export function createDataset(name: string, focusVersion: FocusVersion, datasetType: DatasetType) {
  return Effect.gen(function* () {
    const sql = yield* SqlClient;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    yield* sql.unsafe(
      `INSERT INTO focus_datasets (id, name, focus_version, dataset_type, row_count, created_at) VALUES (?, ?, ?, ?, 0, ?)`,
      [id, name, focusVersion, datasetType, now]
    );

    return { id, name, focusVersion, datasetType, rowCount: 0, createdAt: now };
  });
}

// ---------------------------------------------------------------------------
// insertRows
// ---------------------------------------------------------------------------

export type InsertRowsResult = { inserted: number };

export function insertRows(datasetId: string, rows: unknown[], version: FocusVersion, datasetType: DatasetType) {
  return Effect.gen(function* () {
    const sql = yield* SqlClient;

    // 1. Verify dataset exists and version/type match
    const found = yield* sql.unsafe(`SELECT focus_version, dataset_type FROM focus_datasets WHERE id = ?`, [datasetId]);

    if (found.length === 0) {
      return yield* Effect.fail(new DatasetNotFoundError({ datasetId }));
    }

    const dataset = found[0] as { focus_version: string; dataset_type: string };

    if (dataset.focus_version !== version) {
      return yield* Effect.fail(
        new VersionMismatchError({
          datasetId,
          datasetVersion: dataset.focus_version,
          requestedVersion: version,
        })
      );
    }

    if (dataset.dataset_type !== datasetType) {
      return yield* Effect.fail(
        new DatasetTypeMismatchError({
          datasetId,
          datasetType: dataset.dataset_type,
          requestedType: datasetType,
        })
      );
    }

    // 2. Validate all rows upfront (fail-fast — no rows are written if any fail)
    const validatedRows = yield* validateRows(rows, version, datasetType);

    // 3. Insert each row
    const tableName = rowTableNames[version][datasetType];

    for (const row of validatedRows) {
      const serialized = serializeJsonFields(row, version, datasetType);
      const columns = ["dataset_id", ...Object.keys(serialized)];
      const placeholders = columns.map(() => "?").join(", ");
      const values = [datasetId, ...Object.values(serialized)] as (string | number | null)[];

      // tableName comes from our own constant, never from user input — safe to interpolate
      yield* sql.unsafe(`INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`, values);
    }

    // 4. Update rowCount
    yield* sql.unsafe(`UPDATE focus_datasets SET row_count = row_count + ? WHERE id = ?`, [
      validatedRows.length,
      datasetId,
    ]);

    return { inserted: validatedRows.length };
  });
}

// ---------------------------------------------------------------------------
// listDatasets
// ---------------------------------------------------------------------------

export function listDatasets(focusVersion?: FocusVersion, datasetType?: DatasetType) {
  return Effect.gen(function* () {
    const sql = yield* SqlClient;

    const conditions: string[] = [];
    const params: string[] = [];

    if (focusVersion) {
      conditions.push("focus_version = ?");
      params.push(focusVersion);
    }
    if (datasetType) {
      conditions.push("dataset_type = ?");
      params.push(datasetType);
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
    const query = `SELECT id, name, focus_version, dataset_type, row_count, created_at FROM focus_datasets${whereClause} ORDER BY created_at DESC`;

    const rows = yield* sql.unsafe(query, params);

    return rows.map((r) => {
      const row = r as {
        id: string;
        name: string;
        focus_version: string;
        dataset_type: string;
        row_count: number;
        created_at: string;
      };
      return {
        id: row.id,
        name: row.name,
        focusVersion: row.focus_version as FocusVersion,
        datasetType: row.dataset_type as DatasetType,
        rowCount: row.row_count,
        createdAt: row.created_at,
      };
    });
  });
}
