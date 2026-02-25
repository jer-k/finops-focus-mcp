import { Exit, Schema } from "effect";
import { describe, expect, it } from "vitest";
import {
  FocusDataset,
  FocusRowV10,
  FocusRowV11,
  FocusRowV12,
  FocusRowV13,
  FocusRowV13ContractCommitment,
} from "../../storage/models";

// ---------------------------------------------------------------------------
// FocusDataset
// ---------------------------------------------------------------------------

const validDatasetInsert = {
  name: "q3-2024-aws",
  focusVersion: "1.0",
  datasetType: "cost_and_usage",
  rowCount: 1000,
  // createdAt is omitted — DateTimeInsert defaults to now
};

describe("FocusDataset.insert", () => {
  it("accepts a valid insert payload without id or createdAt", () => {
    const result = Schema.decodeUnknownExit(FocusDataset.insert)(validDatasetInsert);
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("rejects an invalid focusVersion", () => {
    const result = Schema.decodeUnknownExit(FocusDataset.insert)({
      ...validDatasetInsert,
      focusVersion: "2.0",
    });
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("rejects an invalid datasetType", () => {
    const result = Schema.decodeUnknownExit(FocusDataset.insert)({
      ...validDatasetInsert,
      datasetType: "billing",
    });
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("rejects a missing name", () => {
    const { name: _name, ...withoutName } = validDatasetInsert;
    const result = Schema.decodeUnknownExit(FocusDataset.insert)(withoutName);
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("rejects a non-numeric rowCount", () => {
    const result = Schema.decodeUnknownExit(FocusDataset.insert)({
      ...validDatasetInsert,
      rowCount: "many",
    });
    expect(Exit.isFailure(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FocusRowV10
// ---------------------------------------------------------------------------

// Tags: null because Model.FieldOption → OptionFromNullOr in the insert schema,
// meaning the key must be present but accepts null (→ Option.none).
const validV10RowInsert = {
  datasetId: "dataset-abc-123",
  BilledCost: 0.0000008,
  BillingAccountId: "1234567890123",
  BillingAccountName: "SunBird",
  BillingCurrency: "USD",
  BillingPeriodEnd: "2024-10-01 00:00:00",
  BillingPeriodStart: "2024-09-01 00:00:00",
  ChargeCategory: "Usage",
  ChargeClass: null,
  ChargeDescription: "$0.40 per million Amazon SQS requests",
  ChargePeriodEnd: "2024-09-18 23:00:00",
  ChargePeriodStart: "2024-09-18 22:00:00",
  ContractedCost: 0,
  EffectiveCost: 0,
  InvoiceIssuerName: "Amazon Web Services, Inc.",
  ListCost: 0.0000008,
  PricingQuantity: 2,
  PricingUnit: "Requests",
  ProviderName: "AWS",
  PublisherName: "Amazon Web Services, Inc.",
  ServiceCategory: "Integration",
  ServiceName: "Amazon Simple Queue Service",
  Tags: null,
};

describe("FocusRowV10.insert", () => {
  it("accepts a valid insert payload with all mandatory FOCUS fields", () => {
    const result = Schema.decodeUnknownExit(FocusRowV10.insert)(validV10RowInsert);
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("rejects a missing datasetId", () => {
    const { datasetId: _datasetId, ...withoutDatasetId } = validV10RowInsert;
    const result = Schema.decodeUnknownExit(FocusRowV10.insert)(withoutDatasetId);
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("rejects a missing mandatory FOCUS field (BilledCost)", () => {
    const { BilledCost: _billedCost, ...withoutBilledCost } = validV10RowInsert;
    const result = Schema.decodeUnknownExit(FocusRowV10.insert)(withoutBilledCost);
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("rejects a wrong type on a mandatory numeric field", () => {
    const result = Schema.decodeUnknownExit(FocusRowV10.insert)({
      ...validV10RowInsert,
      BilledCost: "not-a-number",
    });
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("accepts Tags as a JSON string", () => {
    const result = Schema.decodeUnknownExit(FocusRowV10.insert)({
      ...validV10RowInsert,
      Tags: JSON.stringify({ environment: "prod", team: "platform" }),
    });
    expect(Exit.isSuccess(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FocusRowV11
// ---------------------------------------------------------------------------

// v1.1 adds ServiceSubcategory, CapacityReservationId/Status,
// CommitmentDiscountQuantity/Unit, SkuMeter, SkuPriceDetails — all optional.
// The mandatory base fields are identical to v1.0.
const validV11RowInsert = {
  ...validV10RowInsert,
};

describe("FocusRowV11.insert", () => {
  it("accepts a valid insert payload with mandatory FOCUS fields", () => {
    const result = Schema.decodeUnknownExit(FocusRowV11.insert)(validV11RowInsert);
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("rejects a missing datasetId", () => {
    const { datasetId: _datasetId, ...withoutDatasetId } = validV11RowInsert;
    const result = Schema.decodeUnknownExit(FocusRowV11.insert)(withoutDatasetId);
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("rejects a wrong type on a mandatory numeric field", () => {
    const result = Schema.decodeUnknownExit(FocusRowV11.insert)({
      ...validV11RowInsert,
      EffectiveCost: "not-a-number",
    });
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("accepts v1.1-specific optional fields (SkuMeter, ServiceSubcategory)", () => {
    const result = Schema.decodeUnknownExit(FocusRowV11.insert)({
      ...validV11RowInsert,
      SkuMeter: "Compute Hours",
      ServiceSubcategory: "Virtual Machines",
      CommitmentDiscountQuantity: 100,
      CommitmentDiscountUnit: "Hours",
    });
    expect(Exit.isSuccess(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FocusRowV12
// ---------------------------------------------------------------------------

// v1.2 adds InvoiceId, BillingAccountType, PricingCurrency,
// PricingCurrencyContractedUnitPrice/EffectiveCost/ListUnitPrice,
// SubAccountType — all optional. Mandatory base fields identical to v1.0/v1.1.
const validV12RowInsert = {
  ...validV10RowInsert,
};

describe("FocusRowV12.insert", () => {
  it("accepts a valid insert payload with mandatory FOCUS fields", () => {
    const result = Schema.decodeUnknownExit(FocusRowV12.insert)(validV12RowInsert);
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("rejects a missing datasetId", () => {
    const { datasetId: _datasetId, ...withoutDatasetId } = validV12RowInsert;
    const result = Schema.decodeUnknownExit(FocusRowV12.insert)(withoutDatasetId);
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("rejects a wrong type on a mandatory numeric field", () => {
    const result = Schema.decodeUnknownExit(FocusRowV12.insert)({
      ...validV12RowInsert,
      ListCost: "free",
    });
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("accepts v1.2-specific optional fields (InvoiceId, PricingCurrency)", () => {
    const result = Schema.decodeUnknownExit(FocusRowV12.insert)({
      ...validV12RowInsert,
      InvoiceId: "INV-2024-001",
      PricingCurrency: "EUR",
      PricingCurrencyEffectiveCost: 0.46,
      SubAccountType: "LinkedAccount",
    });
    expect(Exit.isSuccess(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FocusRowV13
// ---------------------------------------------------------------------------

// v1.3 has HostProviderName / ServiceProviderName (new mandatory fields)
// and JSON columns for AllocatedMethodDetails, AllocatedTags, ContractApplied,
// SkuPriceDetails, Tags — all overridden with Model.FieldOption(Model.JsonFromString).
const validV13RowInsert = {
  datasetId: "dataset-abc-123",
  BilledCost: 0.5,
  BillingAccountId: "1234567890123",
  BillingAccountName: null,
  BillingCurrency: "USD",
  BillingPeriodEnd: "2024-10-01 00:00:00",
  BillingPeriodStart: "2024-09-01 00:00:00",
  ChargeCategory: "Usage",
  ChargeClass: null,
  ChargeDescription: null,
  ChargePeriodEnd: "2024-09-18 23:00:00",
  ChargePeriodStart: "2024-09-18 22:00:00",
  ContractedCost: 0,
  EffectiveCost: 0.5,
  HostProviderName: null,
  InvoiceIssuerName: "Amazon Web Services, Inc.",
  ListCost: 0.5,
  PricingQuantity: null,
  PricingUnit: null,
  ServiceCategory: "Compute",
  ServiceName: "Amazon EC2",
  ServiceProviderName: "Amazon Web Services, Inc.",
  // JSON columns — null decodes to Option.none
  AllocatedMethodDetails: null,
  AllocatedTags: null,
  ContractApplied: null,
  SkuPriceDetails: null,
  Tags: null,
};

describe("FocusRowV13.insert", () => {
  it("accepts a valid insert with null JSON columns", () => {
    const result = Schema.decodeUnknownExit(FocusRowV13.insert)(validV13RowInsert);
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("accepts Tags as a JSON string (decoded to Option.some)", () => {
    const result = Schema.decodeUnknownExit(FocusRowV13.insert)({
      ...validV13RowInsert,
      Tags: JSON.stringify({ env: "prod" }),
    });
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("accepts AllocatedMethodDetails as a JSON string", () => {
    const allocatedMethodDetails = { Elements: [{ AllocatedRatio: 0.5 }] };
    const result = Schema.decodeUnknownExit(FocusRowV13.insert)({
      ...validV13RowInsert,
      AllocatedMethodDetails: JSON.stringify(allocatedMethodDetails),
    });
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("rejects a missing mandatory v1.3-specific field (ServiceProviderName)", () => {
    const { ServiceProviderName: _sp, ...withoutSP } = validV13RowInsert;
    const result = Schema.decodeUnknownExit(FocusRowV13.insert)(withoutSP);
    expect(Exit.isFailure(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FocusRowV13ContractCommitment
// ---------------------------------------------------------------------------

// ContractCommitmentRow uses NullOr for several fields — mandatory in inserts
// (key must be present, value can be null).
const validV13ContractCommitmentInsert = {
  datasetId: "dataset-abc-123",
  BillingCurrency: "USD",
  ContractCommitmentCategory: "Spend",
  ContractCommitmentCost: null,
  ContractCommitmentDescription: null,
  ContractCommitmentId: "commitment-001",
  ContractCommitmentPeriodEnd: "2025-01-01 00:00:00",
  ContractCommitmentPeriodStart: "2024-01-01 00:00:00",
  ContractCommitmentQuantity: null,
  ContractCommitmentType: "Reserved",
  ContractCommitmentUnit: null,
  ContractId: "contract-001",
  ContractPeriodEnd: "2025-01-01 00:00:00",
  ContractPeriodStart: "2024-01-01 00:00:00",
};

describe("FocusRowV13ContractCommitment.insert", () => {
  it("accepts a valid insert with NullOr fields set to null", () => {
    const result = Schema.decodeUnknownExit(FocusRowV13ContractCommitment.insert)(validV13ContractCommitmentInsert);
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("rejects a missing ContractCommitmentCategory", () => {
    const { ContractCommitmentCategory: _cat, ...withoutCat } = validV13ContractCommitmentInsert;
    const result = Schema.decodeUnknownExit(FocusRowV13ContractCommitment.insert)(withoutCat);
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("rejects an invalid ContractCommitmentCategory value", () => {
    const result = Schema.decodeUnknownExit(FocusRowV13ContractCommitment.insert)({
      ...validV13ContractCommitmentInsert,
      ContractCommitmentCategory: "Time",
    });
    expect(Exit.isFailure(result)).toBe(true);
  });
});
