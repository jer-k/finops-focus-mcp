import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { describe, expect, it } from "vitest";

import { RowValidationError } from "../../storage/errors";
import { serializeJsonFields, validateRows } from "../../storage/insert-rows";

// Minimal valid v1.0 cost_and_usage row (mandatory fields only)
const validV10Row = {
  BilledCost: 1.5,
  BillingAccountId: "123456789",
  BillingAccountName: "TestAccount",
  BillingCurrency: "USD",
  BillingPeriodEnd: "2024-10-01 00:00:00",
  BillingPeriodStart: "2024-09-01 00:00:00",
  ChargeCategory: "Usage",
  ChargeClass: null,
  ChargeDescription: "EC2 usage",
  ChargePeriodEnd: "2024-09-18 23:00:00",
  ChargePeriodStart: "2024-09-18 22:00:00",
  ContractedCost: 0,
  EffectiveCost: 1.5,
  InvoiceIssuerName: "AWS",
  ListCost: 1.5,
  PricingQuantity: 1,
  PricingUnit: "Hours",
  ProviderName: "AWS",
  PublisherName: "AWS",
  ServiceCategory: "Compute",
  ServiceName: "Amazon EC2",
};

// Valid v1.3 contract commitment row
const validV13ContractCommitmentRow = {
  BillingCurrency: "USD",
  ContractCommitmentCategory: "Spend",
  ContractCommitmentCost: 1000,
  ContractCommitmentDescription: null,
  ContractCommitmentId: null,
  ContractCommitmentPeriodEnd: "2025-01-01 00:00:00",
  ContractCommitmentPeriodStart: "2024-01-01 00:00:00",
  ContractCommitmentQuantity: null,
  ContractCommitmentType: "Reserved",
  ContractCommitmentUnit: null,
  ContractId: null,
  ContractPeriodEnd: "2025-01-01 00:00:00",
  ContractPeriodStart: "2024-01-01 00:00:00",
};

describe("validateRows — v1.0 cost_and_usage", () => {
  it("accepts a valid row", () => {
    const exit = Effect.runSyncExit(validateRows([validV10Row], "1.0", "cost_and_usage"));
    expect(Exit.isSuccess(exit)).toBe(true);
  });

  it("accepts a batch of multiple valid rows", () => {
    const exit = Effect.runSyncExit(validateRows([validV10Row, validV10Row], "1.0", "cost_and_usage"));
    expect(Exit.isSuccess(exit)).toBe(true);
    if (Exit.isSuccess(exit)) {
      expect(exit.value).toHaveLength(2);
    }
  });

  it("rejects an invalid row and reports the row index", () => {
    const badRow = { ...validV10Row, BilledCost: "not-a-number" };
    const exit = Effect.runSyncExit(validateRows([badRow], "1.0", "cost_and_usage"));
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const err = Cause.squash(exit.cause);
      expect(err).toBeInstanceOf(RowValidationError);
      expect((err as RowValidationError).rowIndex).toBe(0);
    }
  });

  it("fails fast on the first invalid row, reports its index", () => {
    const rows = [
      validV10Row,
      { ...validV10Row, BilledCost: "bad" }, // index 1
      validV10Row,
    ];
    const exit = Effect.runSyncExit(validateRows(rows, "1.0", "cost_and_usage"));
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const err = Cause.squash(exit.cause);
      expect(err).toBeInstanceOf(RowValidationError);
      expect((err as RowValidationError).rowIndex).toBe(1);
    }
  });

  it("rejects a row missing all mandatory fields", () => {
    const exit = Effect.runSyncExit(validateRows([{}], "1.0", "cost_and_usage"));
    expect(Exit.isFailure(exit)).toBe(true);
  });
});

describe("validateRows — v1.3 contract_commitment", () => {
  it("accepts a valid contract commitment row", () => {
    const exit = Effect.runSyncExit(validateRows([validV13ContractCommitmentRow], "1.3", "contract_commitment"));
    expect(Exit.isSuccess(exit)).toBe(true);
  });

  it("rejects a row with an invalid ContractCommitmentCategory value", () => {
    const bad = { ...validV13ContractCommitmentRow, ContractCommitmentCategory: "InvalidValue" };
    const exit = Effect.runSyncExit(validateRows([bad], "1.3", "contract_commitment"));
    expect(Exit.isFailure(exit)).toBe(true);
  });
});

describe("serializeJsonFields — v1.0 cost_and_usage", () => {
  it("stringifies Tags object when present", () => {
    const row = { ...validV10Row, Tags: { env: "prod", team: "platform" } };
    const result = serializeJsonFields(row, "1.0", "cost_and_usage");
    expect(result["Tags"]).toBe('{"env":"prod","team":"platform"}');
  });

  it("leaves Tags as null when null", () => {
    const row = { ...validV10Row, Tags: null };
    const result = serializeJsonFields(row, "1.0", "cost_and_usage");
    expect(result["Tags"]).toBeNull();
  });

  it("leaves non-JSON fields untouched", () => {
    const result = serializeJsonFields(validV10Row, "1.0", "cost_and_usage");
    expect(result["BilledCost"]).toBe(1.5);
    expect(result["ServiceName"]).toBe("Amazon EC2");
  });
});

describe("serializeJsonFields — v1.3 cost_and_usage", () => {
  it("stringifies Tags and AllocatedTags when present", () => {
    const row = {
      Tags: { env: "prod" },
      AllocatedTags: { owner: "team-a" },
      BilledCost: 10,
    };
    const result = serializeJsonFields(row, "1.3", "cost_and_usage");
    expect(result["Tags"]).toBe('{"env":"prod"}');
    expect(result["AllocatedTags"]).toBe('{"owner":"team-a"}');
    expect(result["BilledCost"]).toBe(10);
  });

  it("does not stringify contract_commitment fields (no JSON fields)", () => {
    const row = { ContractCommitmentCategory: "Spend", BillingCurrency: "USD" };
    const result = serializeJsonFields(row, "1.3", "contract_commitment");
    expect(result["ContractCommitmentCategory"]).toBe("Spend");
    expect(result["BillingCurrency"]).toBe("USD");
  });
});
