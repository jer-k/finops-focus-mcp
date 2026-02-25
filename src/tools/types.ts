import { Data } from "effect";
import type { FocusVersion } from "../queries/types";

export type { FocusVersion };

export type SqlRow = Record<string, unknown>;

export class QueryNotFoundError extends Data.TaggedError("QueryNotFoundError")<{
  queryId: string;
  version: FocusVersion;
}> {}

export class InvalidSqlError extends Data.TaggedError("InvalidSqlError")<{
  reason: string;
}> {}

export class MissingParamError extends Data.TaggedError("MissingParamError")<{
  paramName: string;
  queryId: string;
}> {}
