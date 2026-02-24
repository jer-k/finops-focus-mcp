import { Exit, Schema } from "effect";
import { describe, expect, it } from "vitest";
import { CostAndUsageRow } from "../../../focus/v1-2/schema";

// Fixtures adapted from tmp/focus-sample-data/FOCUS-1.0/focus_sample.csv
// v1.2 uses `ProviderName`, `PublisherName`, `InvoiceIssuerName` (v1.1 renames carried into v1.2).
// ContractedCost, EffectiveCost, ListCost, PricingQuantity, PricingUnit are Mandatory in v1.2.
// SubAccountId and SubAccountName are Conditional (optional) in v1.2.
// NULL values in the CSV are omitted. Numeric fields are cast from strings to numbers.

const sqsUsageRow = {
  // Mandatory
  BilledCost: 0.0000008,
  BillingAccountId: "1234567890123",
  BillingAccountName: "SunBird",
  BillingCurrency: "USD",
  BillingPeriodEnd: "2024-10-01 00:00:00",
  BillingPeriodStart: "2024-09-01 00:00:00",
  ChargeCategory: "Usage",
  ChargeClass: null, // NULL in sample data; only "Correction" for correction rows
  ChargeDescription: "$0.40 per million Amazon SQS standard requests in Tier1 in US West (Oregon)",
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
  // Recommended (optional)
  ChargeFrequency: "Usage-Based",
  ContractedUnitPrice: 0,
  ListUnitPrice: 0.0000004,
  PricingCategory: "Standard",
  RegionId: "us-west-2",
  RegionName: "US West (Oregon)",
  ResourceId: "arn:ats:sqs:us-test-2:347410479675:mibelllmel-i-032l64f2065481b12",
  SkuId: "G95FST5FTYV3JSRX",
  SkuPriceId: "G95FST5FTYV3JSRX.JRTCKXETXF.VXGXCWQKTY",
  // Conditional (optional)
  ConsumedQuantity: 2,
  ConsumedUnit: "Requests",
  SubAccountId: "51738928782",
  SubAccountName: "Atlas Nimbus",
};

const albUsageRow = {
  // Mandatory
  BilledCost: 0.0000160599,
  BillingAccountId: "1234567890123",
  BillingAccountName: "SunBird",
  BillingCurrency: "USD",
  BillingPeriodEnd: "2024-10-01 00:00:00",
  BillingPeriodStart: "2024-09-01 00:00:00",
  ChargeCategory: "Usage",
  ChargeClass: null, // NULL in sample data; only "Correction" for correction rows
  ChargeDescription: "$0.008 per used Application load balancer capacity unit-hour (or partial hour)",
  ChargePeriodEnd: "2024-09-30 23:00:00",
  ChargePeriodStart: "2024-09-30 22:00:00",
  ContractedCost: 0,
  EffectiveCost: 0,
  InvoiceIssuerName: "Amazon Web Services, Inc.",
  ListCost: 0.0000160599,
  PricingQuantity: 0.00200749,
  PricingUnit: "LCU-Hours",
  ProviderName: "AWS",
  PublisherName: "Amazon Web Services, Inc.",
  ServiceCategory: "Networking",
  ServiceName: "Elastic Load Balancing",
  // Recommended (optional)
  ChargeFrequency: "Usage-Based",
  ContractedUnitPrice: 0,
  ListUnitPrice: 0.008,
  PricingCategory: "Standard",
  RegionId: "us-west-2",
  RegionName: "US West (Oregon)",
  ResourceId:
    "arn:ats:emastilmoalfamanling:us-test-2:586597448978:moalfamanler/app/tungsten-lonbmuenle-amf/l365455f461l4e4a",
  SkuId: "2ETY8Y426S4237JU",
  SkuPriceId: "2ETY8Y426S4237JU.JRTCKXETXF.6YS6EN2CT7",
  Tags: {
    application: "BrightLensMatrix",
    environment: "dev",
    business_unit: "ViennaAI",
  },
  // Conditional (optional)
  ConsumedQuantity: 0.00200749,
  ConsumedUnit: "LCU-Hours",
  SubAccountId: "43883916739",
  SubAccountName: "Zenith Eclipse",
};

describe("CostAndUsageRow v1.2", () => {
  it("parses an SQS usage row adapted from the official FOCUS 1.0 sample data", () => {
    const result = Schema.decodeUnknownExit(CostAndUsageRow)(sqsUsageRow);
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("parses an ALB usage row with tags adapted from the official FOCUS 1.0 sample data", () => {
    const result = Schema.decodeUnknownExit(CostAndUsageRow)(albUsageRow);
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("rejects a row missing all mandatory fields", () => {
    const result = Schema.decodeUnknownExit(CostAndUsageRow)({});
    expect(Exit.isFailure(result)).toBe(true);
  });

  it("rejects a row where a mandatory numeric field is a string", () => {
    const result = Schema.decodeUnknownExit(CostAndUsageRow)({
      ...sqsUsageRow,
      BilledCost: "not-a-number",
    });
    expect(Exit.isFailure(result)).toBe(true);
  });
});
