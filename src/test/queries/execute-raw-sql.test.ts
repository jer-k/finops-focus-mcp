import { Cause, Effect, Exit, Layer } from "effect";
import { SqlClient } from "effect/unstable/sql/SqlClient";
import { describe, expect, it } from "vitest";

import { executeRawSql } from "../../queries/execute-raw-sql";
import { InvalidSqlError } from "../../queries/types";

function createMockSqlLayer(capturedSqls: string[]) {
  const mockUnsafe = (sql: string, _params?: ReadonlyArray<unknown>) => {
    capturedSqls.push(sql);
    return Effect.succeed([]) as unknown as ReturnType<SqlClient["unsafe"]>;
  };
  const mockClient = { unsafe: mockUnsafe } as unknown as SqlClient;
  return Layer.succeed(SqlClient)(mockClient);
}

describe("executeRawSql", () => {
  it("rejects non-SELECT SQL before hitting the database", () => {
    const capturedSqls: string[] = [];
    const exit = Effect.runSyncExit(
      executeRawSql("1.0", "DELETE FROM focus_data_table", []).pipe(Effect.provide(createMockSqlLayer(capturedSqls)))
    );
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const err = Cause.squash(exit.cause) as InvalidSqlError;
      expect(err).toBeInstanceOf(InvalidSqlError);
      expect(err.reason).toBe("Only SELECT statements are permitted");
    }
    // The mock should never have been called since failure occurred before SqlClient access
    expect(capturedSqls).toHaveLength(0);
  });

  it("accepts a valid SELECT and substitutes the table name", () => {
    const capturedSqls: string[] = [];
    const exit = Effect.runSyncExit(
      executeRawSql("1.0", "SELECT * FROM focus_data_table WHERE BilledCost > 0", []).pipe(
        Effect.provide(createMockSqlLayer(capturedSqls))
      )
    );
    expect(Exit.isSuccess(exit)).toBe(true);
    // Two calls: EXPLAIN and the actual query
    expect(capturedSqls).toHaveLength(2);
    // Both should use the rewritten table name
    for (const sql of capturedSqls) {
      expect(sql).not.toContain("focus_data_table");
      expect(sql).toContain("focus_rows_v10");
    }
    // First call is EXPLAIN
    expect(capturedSqls[0]).toMatch(/^EXPLAIN /);
    // Second call is the actual query
    expect(capturedSqls[1]).toBe("SELECT * FROM focus_rows_v10 WHERE BilledCost > 0");
  });
});
