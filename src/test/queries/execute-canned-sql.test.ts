import { Cause, Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";

import type { FocusQuery } from "../../queries/types";
import { buildPositionalParams, findQuery } from "../../queries/execute-canned-sql";
import { MissingParamError, QueryNotFoundError } from "../../queries/types";

// A minimal two-param query for testing buildPositionalParams
const twoParamQuery: FocusQuery = {
  id: "test_query",
  name: "Test Query",
  sql: "SELECT * FROM focus_data_table WHERE col_a = ? AND col_b = ?",
  params: [
    { name: "col_a", type: "String", description: "First column" },
    { name: "col_b", type: "DateTime", description: "Second column" },
  ],
};

describe("buildPositionalParams", () => {
  it("maps named params to ordered array matching SQL ? order", () => {
    const exit = Effect.runSyncExit(buildPositionalParams(twoParamQuery, { col_a: "foo", col_b: "2024-01-01" }));
    expect(Exit.isSuccess(exit)).toBe(true);
    if (Exit.isSuccess(exit)) {
      expect(exit.value).toEqual(["foo", "2024-01-01"]);
    }
  });

  it("fails with MissingParamError when a required param is absent", () => {
    const exit = Effect.runSyncExit(buildPositionalParams(twoParamQuery, { col_a: "foo" }));
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const err = Cause.squash(exit.cause) as MissingParamError;
      expect(err).toBeInstanceOf(MissingParamError);
      expect(err.paramName).toBe("col_b");
      expect(err.queryId).toBe("test_query");
    }
  });
});

describe("findQuery", () => {
  it("returns the correct query for a valid id + version", () => {
    const exit = Effect.runSyncExit(findQuery("1.0", "allocate_multi_currency_charges_per_application"));
    expect(Exit.isSuccess(exit)).toBe(true);
    if (Exit.isSuccess(exit)) {
      expect(exit.value.id).toBe("allocate_multi_currency_charges_per_application");
    }
  });

  it("fails with QueryNotFoundError for an unknown id", () => {
    const exit = Effect.runSyncExit(findQuery("1.0", "nonexistent_query"));
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const err = Cause.squash(exit.cause);
      expect(err).toBeInstanceOf(QueryNotFoundError);
    }
  });

  it("fails with QueryNotFoundError for a query id that exists in v1.3 but not v1.0", () => {
    // calculate_unit_economics is a v1.2+ query, not present in v1.0
    const exit = Effect.runSyncExit(findQuery("1.0", "calculate_unit_economics"));
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const err = Cause.squash(exit.cause) as QueryNotFoundError;
      expect(err).toBeInstanceOf(QueryNotFoundError);
      expect(err.queryId).toBe("calculate_unit_economics");
      expect(err.version).toBe("1.0");
    }
  });
});
