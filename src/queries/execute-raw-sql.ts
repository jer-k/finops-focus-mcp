import * as Effect from "effect/Effect";
import { SqlClient } from "effect/unstable/sql/SqlClient";

import { isSelectStatement, replaceTableName } from "./helpers";
import type { FocusVersion } from "./types";
import { InvalidSqlError } from "./types";

export function executeRawSql(version: FocusVersion, userSql: string, params: (string | number)[] = []) {
  return Effect.gen(function* () {
    if (!isSelectStatement(userSql)) {
      return yield* Effect.fail(new InvalidSqlError({ reason: "Only SELECT statements are permitted" }));
    }

    const sql = yield* SqlClient;
    const rewritten = replaceTableName(userSql, version);

    // Validate syntax with EXPLAIN before executing
    yield* sql
      .unsafe(`EXPLAIN ${rewritten}`, [])
      .pipe(Effect.mapError((err) => new InvalidSqlError({ reason: `SQL syntax error: ${String(err)}` })));

    const rows = yield* sql.unsafe(rewritten, params);
    return rows;
  });
}
