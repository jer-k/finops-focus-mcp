import { describe, expect, it } from "vitest";

import type { FocusQuery } from "../../queries/types";
import { v10Queries } from "../../queries/v1-0";
import { v11Queries } from "../../queries/v1-1";
import { v12Queries } from "../../queries/v1-2";
import { v13Queries } from "../../queries/v1-3";

function countPlaceholders(sql: string): number {
  // Strip string literals to avoid counting ? inside them (e.g. JSON path wildcards like '$.?')
  const stripped = sql.replace(/'[^']*'/g, "''");
  return (stripped.match(/\?/g) ?? []).length;
}

function getIds(queries: FocusQuery[]): Set<string> {
  return new Set(queries.map((q) => q.id));
}

describe("v1.0 catalog", () => {
  it("has no duplicate IDs", () => {
    const ids = v10Queries.map((q) => q.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("every query's params.length matches its SQL ? count", () => {
    for (const q of v10Queries) {
      expect(countPlaceholders(q.sql), `query "${q.id}" has mismatched ? count`).toBe(q.params.length);
    }
  });
});

describe("v1.1 catalog", () => {
  it("includes all v1.0 query IDs", () => {
    const v11Ids = getIds(v11Queries);
    for (const q of v10Queries) {
      expect(v11Ids.has(q.id), `v1.1 missing id "${q.id}"`).toBe(true);
    }
  });

  it("has no duplicate IDs", () => {
    const ids = v11Queries.map((q) => q.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("every query's params.length matches its SQL ? count", () => {
    for (const q of v11Queries) {
      expect(countPlaceholders(q.sql), `query "${q.id}" has mismatched ? count`).toBe(q.params.length);
    }
  });
});

describe("v1.2 catalog", () => {
  it("includes all v1.1 query IDs", () => {
    const v12Ids = getIds(v12Queries);
    for (const q of v11Queries) {
      expect(v12Ids.has(q.id), `v1.2 missing id "${q.id}"`).toBe(true);
    }
  });

  it("has no duplicate IDs", () => {
    const ids = v12Queries.map((q) => q.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("every query's params.length matches its SQL ? count", () => {
    for (const q of v12Queries) {
      expect(countPlaceholders(q.sql), `query "${q.id}" has mismatched ? count`).toBe(q.params.length);
    }
  });
});

describe("v1.3 catalog", () => {
  it("includes all v1.2 query IDs", () => {
    const v13Ids = getIds(v13Queries);
    for (const q of v12Queries) {
      expect(v13Ids.has(q.id), `v1.3 missing id "${q.id}"`).toBe(true);
    }
  });

  it("has 59 total queries", () => {
    expect(v13Queries.length).toBe(59);
  });

  it("has no duplicate IDs", () => {
    const ids = v13Queries.map((q) => q.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("every query's params.length matches its SQL ? count", () => {
    for (const q of v13Queries) {
      expect(countPlaceholders(q.sql), `query "${q.id}" has mismatched ? count`).toBe(q.params.length);
    }
  });
});
