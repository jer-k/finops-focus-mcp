import { v10BaseQueries, v11AdditionQueries, v12AdditionQueries } from "./shared";
import type { FocusQuery } from "./types";

export const v12Queries: FocusQuery[] = [...v10BaseQueries, ...v11AdditionQueries, ...v12AdditionQueries];
