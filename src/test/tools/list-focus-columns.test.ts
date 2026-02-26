import { describe, expect, it } from "vitest";

import { listFocusColumns } from "../../tools/list-focus-columns";

describe("listFocusColumns — version totals", () => {
  it("returns all v1.0 columns with no filters", () => {
    const result = listFocusColumns("1.0");
    expect(result.version).toBe("1.0");
    expect(result.totalColumns).toBe(43);
    expect(result.columns).toHaveLength(43);
    expect(result.filtersApplied).toEqual({});
  });

  it("returns all v1.1 columns with no filters", () => {
    const result = listFocusColumns("1.1");
    expect(result.totalColumns).toBe(50);
  });

  it("returns all v1.2 columns with no filters", () => {
    const result = listFocusColumns("1.2");
    expect(result.totalColumns).toBe(57);
  });

  it("returns combined cost-and-usage and contract-commitment columns for v1.3", () => {
    const result = listFocusColumns("1.3");
    expect(result.totalColumns).toBeGreaterThan(54);
    const datasets = new Set(result.columns.map((c) => c.dataset));
    expect(datasets).toContain("Cost and Usage");
    expect(datasets).toContain("Contract Commitment");
  });
});

describe("listFocusColumns — featureLevel filter", () => {
  it("returns only Mandatory columns for v1.0", () => {
    const result = listFocusColumns("1.0", "Mandatory");
    expect(result.filtersApplied).toEqual({ featureLevel: "Mandatory" });
    expect(result.columns.every((c) => c.featureLevel === "Mandatory")).toBe(true);
    expect(result.totalColumns).toBeGreaterThan(0);
  });

  it("returns only Conditional columns for v1.3 cost-and-usage dataset", () => {
    const result = listFocusColumns("1.3", "Conditional");
    expect(result.columns.every((c) => c.featureLevel === "Conditional")).toBe(true);
    expect(result.totalColumns).toBeGreaterThan(0);
  });

  it("returns empty list when featureLevel matches nothing", () => {
    // v1.0 has no Optional columns
    const result = listFocusColumns("1.0", "Optional");
    expect(result.totalColumns).toBe(0);
    expect(result.columns).toHaveLength(0);
  });
});

describe("listFocusColumns — columnType filter", () => {
  it("returns only Dimension columns for v1.0", () => {
    const result = listFocusColumns("1.0", undefined, "Dimension");
    expect(result.filtersApplied).toEqual({ columnType: "Dimension" });
    expect(result.columns.every((c) => c.columnType === "Dimension")).toBe(true);
    expect(result.totalColumns).toBeGreaterThan(0);
  });

  it("returns only Metric columns for v1.0", () => {
    const result = listFocusColumns("1.0", undefined, "Metric");
    expect(result.columns.every((c) => c.columnType === "Metric")).toBe(true);
    // BilledCost, ConsumedQuantity, ContractedCost, ContractedUnitPrice,
    // EffectiveCost, ListCost, ListUnitPrice, PricingQuantity = 8
    expect(result.totalColumns).toBe(8);
  });

  it('excludes "Dimension / Metric" columns when columnType filter is applied (v1.3)', () => {
    const all = listFocusColumns("1.3");
    const contractApplied = all.columns.find((c) => c.columnId === "ContractApplied");
    expect(contractApplied?.columnType).toBe("Dimension / Metric");

    const filtered = listFocusColumns("1.3", undefined, "Dimension");
    expect(filtered.columns.find((c) => c.columnId === "ContractApplied")).toBeUndefined();
  });
});

describe("listFocusColumns — search filter", () => {
  it("finds columns by columnId substring (case-insensitive)", () => {
    const result = listFocusColumns("1.0", undefined, undefined, "commitment");
    expect(result.filtersApplied).toEqual({ search: "commitment" });
    expect(result.totalColumns).toBeGreaterThan(0);
    // Every match must have "commitment" in columnId OR description
    expect(
      result.columns.every(
        (c) => c.columnId.toLowerCase().includes("commitment") || c.description.toLowerCase().includes("commitment")
      )
    ).toBe(true);
  });

  it("finds columns by description substring", () => {
    const result = listFocusColumns("1.0", undefined, undefined, "amortized");
    expect(result.totalColumns).toBeGreaterThan(0);
    expect(result.columns.every((c) => c.description.toLowerCase().includes("amortized"))).toBe(true);
  });

  it("returns empty list when search matches nothing", () => {
    const result = listFocusColumns("1.0", undefined, undefined, "zzznomatch");
    expect(result.totalColumns).toBe(0);
  });
});

describe("listFocusColumns — combined filters", () => {
  it("applies featureLevel and columnType together", () => {
    const result = listFocusColumns("1.2", "Mandatory", "Metric");
    expect(result.columns.every((c) => c.featureLevel === "Mandatory" && c.columnType === "Metric")).toBe(true);
    expect(result.filtersApplied).toEqual({ featureLevel: "Mandatory", columnType: "Metric" });
  });

  it("applies all three filters together", () => {
    const result = listFocusColumns("1.3", "Mandatory", "Dimension", "billing");
    expect(
      result.columns.every(
        (c) =>
          c.featureLevel === "Mandatory" &&
          c.columnType === "Dimension" &&
          (c.columnId.toLowerCase().includes("billing") || c.description.toLowerCase().includes("billing"))
      )
    ).toBe(true);
  });
});

describe("listFocusColumns — output shape", () => {
  it("maps column fields correctly for a known v1.0 column", () => {
    const result = listFocusColumns("1.0", undefined, undefined, "BilledCost");
    const col = result.columns.find((c) => c.columnId === "BilledCost");
    expect(col).toBeDefined();
    expect(col?.displayName).toBe("Billed Cost");
    expect(col?.columnType).toBe("Metric");
    expect(col?.dataType).toBe("Decimal");
    expect(col?.featureLevel).toBe("Mandatory");
    expect(col?.category).toBe("Billing");
    expect(col?.introducedVersion).toBe("0.5");
    expect(col?.deprecated).toBeUndefined();
    expect(col?.dataset).toBeUndefined();
  });

  it("includes deprecated flag for deprecated v1.3 columns", () => {
    const result = listFocusColumns("1.3", undefined, undefined, "ProviderName");
    const col = result.columns.find((c) => c.columnId === "ProviderName");
    expect(col?.deprecated).toBe(true);
  });

  it("includes dataset field for v1.3 columns", () => {
    const result = listFocusColumns("1.3", undefined, undefined, "BillingCurrency");
    const cauCols = result.columns.filter((c) => c.dataset === "Cost and Usage");
    const ccCols = result.columns.filter((c) => c.dataset === "Contract Commitment");
    // BillingCurrency appears in both datasets in v1.3
    expect(cauCols.length).toBeGreaterThan(0);
    expect(ccCols.length).toBeGreaterThan(0);
  });
});
