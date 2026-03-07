import * as Effect from "effect/Effect";
import { SqlClient } from "effect/unstable/sql/SqlClient";

import { v10Queries, v11Queries, v12Queries, v13Queries } from ".";
import { replaceTableName } from "./helpers";
import type { FocusQuery, FocusVersion } from "./types";
import { MissingParamError, QueryNotFoundError } from "./types";

const queriesByVersion: Record<FocusVersion, FocusQuery[]> = {
  "1.0": v10Queries,
  "1.1": v11Queries,
  "1.2": v12Queries,
  "1.3": v13Queries,
};

export function findQuery(version: FocusVersion, queryId: string) {
  return Effect.gen(function* () {
    const queries = queriesByVersion[version];
    const query = queries.find((q) => q.id === queryId);
    if (!query) {
      return yield* Effect.fail(new QueryNotFoundError({ queryId, version }));
    }
    return query;
  });
}

export function buildPositionalParams(query: FocusQuery, namedParams: Record<string, string | number>) {
  return Effect.gen(function* () {
    const values: (string | number)[] = [];
    for (const param of query.params) {
      const value = namedParams[param.name];
      if (value === undefined) {
        return yield* Effect.fail(new MissingParamError({ paramName: param.name, queryId: query.id }));
      }
      values.push(value);
    }
    return values;
  });
}

export function executeCannedSql(version: FocusVersion, queryId: string, namedParams: Record<string, string | number>) {
  return Effect.gen(function* () {
    const sql = yield* SqlClient;
    const query = yield* findQuery(version, queryId);
    const positional = yield* buildPositionalParams(query, namedParams);
    const rewritten = replaceTableName(query.sql, version);
    const rows = yield* sql.unsafe(rewritten, positional);
    return rows;
  });
}
