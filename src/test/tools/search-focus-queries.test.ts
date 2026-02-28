import { describe, expect, it } from "vitest";

import { v10Queries, v11Queries, v12Queries, v13Queries } from "../../queries";
import { searchFocusQueries } from "../../tools/search-focus-queries";

describe("searchFocusQueries — no search filter", () => {
  it("returns all v1.0 queries when no search is provided", () => {
    const result = searchFocusQueries("1.0");
    expect(result).toHaveLength(v10Queries.length);
    expect(result).toEqual(v10Queries);
  });

  it("returns all v1.1 queries when no search is provided", () => {
    const result = searchFocusQueries("1.1");
    expect(result).toHaveLength(v11Queries.length);
  });

  it("returns all v1.2 queries when no search is provided", () => {
    const result = searchFocusQueries("1.2");
    expect(result).toHaveLength(v12Queries.length);
  });

  it("returns all v1.3 queries when no search is provided", () => {
    const result = searchFocusQueries("1.3");
    expect(result).toHaveLength(v13Queries.length);
  });
});

describe("searchFocusQueries — search by id", () => {
  it("filters queries by matching query id substring (case-insensitive)", () => {
    const result = searchFocusQueries("1.0", "allocate_multi_currency");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((q) => q.id.toLowerCase().includes("allocate_multi_currency"))).toBe(true);
  });

  it("filters case-insensitively on id", () => {
    const lower = searchFocusQueries("1.0", "allocate");
    const upper = searchFocusQueries("1.0", "ALLOCATE");
    expect(lower).toEqual(upper);
  });
});

describe("searchFocusQueries — search by name", () => {
  it("filters queries by matching query name substring", () => {
    const result = searchFocusQueries("1.0", "availability zone");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((q) => q.name.toLowerCase().includes("availability zone"))).toBe(true);
  });

  it("returns queries matching either id or name", () => {
    // "currency" appears in the name of allocate_multi_currency_charges_per_application
    const result = searchFocusQueries("1.0", "currency");
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((q) => q.id.toLowerCase().includes("currency") || q.name.toLowerCase().includes("currency"))
    ).toBe(true);
  });
});

describe("searchFocusQueries — non-matching search", () => {
  it("returns empty array when search matches nothing", () => {
    const result = searchFocusQueries("1.0", "zzznomatch_xyz");
    expect(result).toHaveLength(0);
  });

  it("returns empty array for non-matching search across all versions", () => {
    expect(searchFocusQueries("1.1", "zzznomatch_xyz")).toHaveLength(0);
    expect(searchFocusQueries("1.2", "zzznomatch_xyz")).toHaveLength(0);
    expect(searchFocusQueries("1.3", "zzznomatch_xyz")).toHaveLength(0);
  });
});

describe("searchFocusQueries — output shape", () => {
  it("returns full query objects with id, name, sql, and params", () => {
    const result = searchFocusQueries("1.0", "allocate_multi_currency_charges_per_application");
    expect(result.length).toBeGreaterThan(0);
    const q = result[0];
    expect(q).toHaveProperty("id");
    expect(q).toHaveProperty("name");
    expect(q).toHaveProperty("sql");
    expect(q).toHaveProperty("params");
    expect(Array.isArray(q.params)).toBe(true);
  });
});
