import { describe, expect, it } from "vitest";

import { isSelectStatement, replaceTableName } from "../../queries/helpers";

describe("replaceTableName", () => {
  it("replaces focus_data_table with focus_rows_v10 for version 1.0", () => {
    expect(replaceTableName("SELECT * FROM focus_data_table", "1.0")).toBe("SELECT * FROM focus_rows_v10");
  });

  it("replaces focus_data_table with focus_rows_v11 for version 1.1", () => {
    expect(replaceTableName("SELECT * FROM focus_data_table", "1.1")).toBe("SELECT * FROM focus_rows_v11");
  });

  it("replaces focus_data_table with focus_rows_v12 for version 1.2", () => {
    expect(replaceTableName("SELECT * FROM focus_data_table", "1.2")).toBe("SELECT * FROM focus_rows_v12");
  });

  it("replaces focus_data_table with focus_rows_v13 for version 1.3", () => {
    expect(replaceTableName("SELECT * FROM focus_data_table", "1.3")).toBe("SELECT * FROM focus_rows_v13");
  });

  it("replaces all occurrences when focus_data_table appears more than once", () => {
    const sql = "SELECT * FROM focus_data_table WHERE id IN (SELECT id FROM focus_data_table WHERE active = 1)";
    const result = replaceTableName(sql, "1.0");
    expect(result).toBe("SELECT * FROM focus_rows_v10 WHERE id IN (SELECT id FROM focus_rows_v10 WHERE active = 1)");
  });

  it("does not modify SQL that does not contain focus_data_table", () => {
    const sql = "SELECT * FROM some_other_table";
    expect(replaceTableName(sql, "1.0")).toBe(sql);
  });
});

describe("isSelectStatement", () => {
  it("returns true for a plain SELECT", () => {
    expect(isSelectStatement("SELECT * FROM focus_data_table")).toBe(true);
  });

  it("returns true when SELECT has leading whitespace", () => {
    expect(isSelectStatement("  SELECT id FROM t")).toBe(true);
  });

  it("returns true for uppercase SELECT", () => {
    expect(isSelectStatement("SELECT id FROM t")).toBe(true);
  });

  it("returns true for mixed-case sElEcT", () => {
    expect(isSelectStatement("sElEcT * FROM t")).toBe(true);
  });

  it("returns false for DROP TABLE", () => {
    expect(isSelectStatement("DROP TABLE focus_data_table")).toBe(false);
  });

  it("returns false for INSERT INTO", () => {
    expect(isSelectStatement("INSERT INTO focus_data_table VALUES (1)")).toBe(false);
  });

  it("returns false for UPDATE", () => {
    expect(isSelectStatement("UPDATE focus_data_table SET col = 1")).toBe(false);
  });

  it("returns false for DELETE", () => {
    expect(isSelectStatement("DELETE FROM focus_data_table")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isSelectStatement("")).toBe(false);
  });
});
