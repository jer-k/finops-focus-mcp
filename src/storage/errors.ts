import { Data } from "effect";

import type { FocusVersion } from "../queries/types";

export type DatasetType = "cost_and_usage" | "contract_commitment";

export class DatasetNotFoundError extends Data.TaggedError("DatasetNotFoundError")<{
  datasetId: string;
}> {}

export class RowValidationError extends Data.TaggedError("RowValidationError")<{
  rowIndex: number;
  reason: string;
}> {}

export class VersionMismatchError extends Data.TaggedError("VersionMismatchError")<{
  datasetId: string;
  datasetVersion: string;
  requestedVersion: FocusVersion;
}> {}

export class DatasetTypeMismatchError extends Data.TaggedError("DatasetTypeMismatchError")<{
  datasetId: string;
  datasetType: string;
  requestedType: DatasetType;
}> {}
