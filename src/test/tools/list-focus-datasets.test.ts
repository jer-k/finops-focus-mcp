import { describe, expect, it } from "vitest";
import { z } from "zod";

// Replicate the input schema to test it independently of the tool registration
const listDatasetsSchema = z.object({
  focusVersion: z.enum(["1.0", "1.1", "1.2", "1.3"]).optional(),
  datasetType: z.enum(["cost_and_usage", "contract_commitment"]).optional(),
});

describe("list_focus_datasets input schema", () => {
  it("accepts no filters", () => {
    const result = listDatasetsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts focusVersion filter only", () => {
    const result = listDatasetsSchema.safeParse({ focusVersion: "1.2" });
    expect(result.success).toBe(true);
  });

  it("accepts datasetType filter only", () => {
    const result = listDatasetsSchema.safeParse({ datasetType: "contract_commitment" });
    expect(result.success).toBe(true);
  });

  it("accepts both filters", () => {
    const result = listDatasetsSchema.safeParse({
      focusVersion: "1.3",
      datasetType: "contract_commitment",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown focusVersion", () => {
    const result = listDatasetsSchema.safeParse({ focusVersion: "2.0" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown datasetType", () => {
    const result = listDatasetsSchema.safeParse({ datasetType: "invalid" });
    expect(result.success).toBe(false);
  });
});

// Test the WHERE clause building logic independently
function buildListQuery(focusVersion?: string, datasetType?: string): { query: string; params: string[] } {
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
  return {
    query: `SELECT id, name, focus_version, dataset_type, row_count, created_at FROM focus_datasets${whereClause} ORDER BY created_at DESC`,
    params,
  };
}

describe("list_focus_datasets query builder", () => {
  it("builds an unfiltered query when no filters given", () => {
    const { query, params } = buildListQuery();
    expect(query).not.toContain("WHERE");
    expect(params).toHaveLength(0);
  });

  it("adds WHERE clause for focusVersion filter", () => {
    const { query, params } = buildListQuery("1.2");
    expect(query).toContain("WHERE focus_version = ?");
    expect(params).toEqual(["1.2"]);
  });

  it("adds WHERE clause for datasetType filter", () => {
    const { query, params } = buildListQuery(undefined, "contract_commitment");
    expect(query).toContain("WHERE dataset_type = ?");
    expect(params).toEqual(["contract_commitment"]);
  });

  it("combines both filters with AND", () => {
    const { query, params } = buildListQuery("1.3", "contract_commitment");
    expect(query).toContain("WHERE focus_version = ? AND dataset_type = ?");
    expect(params).toEqual(["1.3", "contract_commitment"]);
  });
});
