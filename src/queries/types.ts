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
