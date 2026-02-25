import { v10BaseQueries, v11AdditionQueries } from "./shared";
import type { FocusQuery } from "./types";

export const v11Queries: FocusQuery[] = [...v10BaseQueries, ...v11AdditionQueries];
