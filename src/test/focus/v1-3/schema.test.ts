import { Exit, Schema } from "effect";
import { describe, expect, it } from "vitest";
import { CostAndUsageRow } from "../../../focus/v1-3/schema";

// Fixtures adapted from tmp/focus-sample-data/FOCUS-1.0/focus_sample.csv
// v1.3 renames the provider fields:
//   ServiceProviderName ← CSV PublisherName ("Amazon Web Services, Inc." — the company)
//   HostProviderName    ← CSV ProviderName  ("AWS" — the infrastructure brand)
//   InvoiceIssuerName   matches CSV InvoiceIssuerName directly
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
  HostProviderName: "AWS", // CSV: ProviderName (infrastructure host)
  InvoiceIssuerName: "Amazon Web Services, Inc.", // CSV: InvoiceIssuerName
  ListCost: 0.0000008,
  ServiceCategory: "Integration",
  ServiceName: "Amazon Simple Queue Service",
  ServiceProviderName: "Amazon Web Services, Inc.", // CSV: PublisherName (cloud service provider)
  SubAccountId: "51738928782",
  SubAccountName: "Atlas Nimbus",
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
  // Deprecated (still accepted by schema)
  Provider: "AWS",
  Publisher: "Amazon Web Services, Inc.",
  // Conditional (optional)
  ConsumedQuantity: 2,
  ConsumedUnit: "Requests",
  PricingQuantity: 2,
  PricingUnit: "Requests",
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
  HostProviderName: "AWS",
  InvoiceIssuerName: "Amazon Web Services, Inc.",
  ListCost: 0.0000160599,
  ServiceCategory: "Networking",
  ServiceName: "Elastic Load Balancing",
  ServiceProviderName: "Amazon Web Services, Inc.",
  SubAccountId: "43883916739",
  SubAccountName: "Zenith Eclipse",
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
  Tags: { application: "BrightLensMatrix", environment: "dev", business_unit: "ViennaAI" },
  // Deprecated (still accepted by schema)
  Provider: "AWS",
  Publisher: "Amazon Web Services, Inc.",
  // Conditional (optional)
  ConsumedQuantity: 0.00200749,
  ConsumedUnit: "LCU-Hours",
  PricingQuantity: 0.00200749,
  PricingUnit: "LCU-Hours",
};

describe("CostAndUsageRow v1.3", () => {
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
