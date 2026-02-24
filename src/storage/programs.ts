import * as SqliteMigrator from "@effect/sql-sqlite-do/SqliteMigrator";
import { migrations } from "./migrations";

export const createFocusTables = SqliteMigrator.run({ loader: migrations });
