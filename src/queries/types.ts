import { Data } from "effect";

export type FocusVersion = "1.0" | "1.1" | "1.2" | "1.3";

export type ParamType = "DateTime" | "String" | "Decimal";

export type QueryParam = {
  name: string;
  type: ParamType;
  description: string;
};

export type FocusQuery = {
  id: string;
  name: string;
  sql: string;
  params: QueryParam[];
};

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
