import * as Schema from "effect/Schema";
import { Model } from "effect/unstable/schema";
import * as V10 from "../focus/v1-0/schema";
import * as V11 from "../focus/v1-1/schema";
import * as V12 from "../focus/v1-2/schema";
import * as V13 from "../focus/v1-3/schema";

export class FocusDataset extends Model.Class<FocusDataset>("FocusDataset")({
  id: Model.Generated(Schema.String),
  name: Schema.String,
  focusVersion: Schema.Literals(["1.0", "1.1", "1.2", "1.3"]),
  datasetType: Schema.Literals(["cost_and_usage", "contract_commitment"]),
  rowCount: Schema.Number,
  createdAt: Model.DateTimeInsert,
}) {}

export class FocusRowV10 extends Model.Class<FocusRowV10>("FocusRowV10")({
  id: Model.Generated(Schema.Number),
  datasetId: Schema.String,
  ...V10.CostAndUsageRow.fields,
  Tags: Model.FieldOption(Model.JsonFromString(Schema.Record(Schema.String, Schema.String))),
}) {}

export class FocusRowV11 extends Model.Class<FocusRowV11>("FocusRowV11")({
  id: Model.Generated(Schema.Number),
  datasetId: Schema.String,
  ...V11.CostAndUsageRow.fields,
  Tags: Model.FieldOption(Model.JsonFromString(Schema.Record(Schema.String, Schema.String))),
}) {}

export class FocusRowV12 extends Model.Class<FocusRowV12>("FocusRowV12")({
  id: Model.Generated(Schema.Number),
  datasetId: Schema.String,
  ...V12.CostAndUsageRow.fields,
  Tags: Model.FieldOption(Model.JsonFromString(Schema.Record(Schema.String, Schema.String))),
}) {}

export class FocusRowV13 extends Model.Class<FocusRowV13>("FocusRowV13")({
  id: Model.Generated(Schema.Number),
  datasetId: Schema.String,
  ...V13.CostAndUsageRow.fields,
  AllocatedMethodDetails: Model.FieldOption(Model.JsonFromString(V13.AllocatedMethodDetails)),
  AllocatedTags: Model.FieldOption(
    Model.JsonFromString(Schema.Record(Schema.String, Schema.Union([Schema.String, Schema.Boolean] as const)))
  ),
  ContractApplied: Model.FieldOption(Model.JsonFromString(V13.ContractApplied)),
  SkuPriceDetails: Model.FieldOption(Model.JsonFromString(Schema.Record(Schema.String, Schema.Unknown))),
  Tags: Model.FieldOption(
    Model.JsonFromString(Schema.Record(Schema.String, Schema.Union([Schema.String, Schema.Boolean] as const)))
  ),
}) {}

export class FocusRowV13ContractCommitment extends Model.Class<FocusRowV13ContractCommitment>(
  "FocusRowV13ContractCommitment"
)({
  id: Model.Generated(Schema.Number),
  datasetId: Schema.String,
  ...V13.ContractCommitmentRow.fields,
}) {}
