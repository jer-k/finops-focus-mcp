import { Exit, Schema } from "effect";
import { describe, expect, it } from "vitest";
import { CostAndUsageRow } from "../../../focus/v1-0/schema";

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
  // Optional
  ChargeFrequency: "Usage-Based",
  ConsumedQuantity: 2,
  ConsumedUnit: "Requests",
  ContractedUnitPrice: 0,
  ListUnitPrice: 0.0000004,
  PricingCategory: "Standard",
  RegionId: "us-west-2",
  RegionName: "US West (Oregon)",
  ResourceId: "arn:ats:sqs:us-test-2:347410479675:mibelllmel-i-032l64f2065481b12",
  SkuId: "G95FST5FTYV3JSRX",
  SkuPriceId: "G95FST5FTYV3JSRX.JRTCKXETXF.VXGXCWQKTY",
  SubAccountId: "51738928782",
  SubAccountName: "Atlas Nimbus",
};

const dataTransferRow = {
  // Mandatory
  BilledCost: 0,
  BillingAccountId: "1234567890123",
  BillingAccountName: "SunBird",
  BillingCurrency: "USD",
  BillingPeriodEnd: "2024-10-01 00:00:00",
  BillingPeriodStart: "2024-09-01 00:00:00",
  ChargeCategory: "Usage",
  ChargeClass: null, // NULL in sample data; only "Correction" for correction rows
  ChargeDescription: "$0.00 per GB - US West (Oregon) data transfer from Asia Pacific (Singapore)",
  ChargePeriodEnd: "2024-09-24 17:00:00",
  ChargePeriodStart: "2024-09-24 16:00:00",
  ContractedCost: 0,
  EffectiveCost: 0,
  InvoiceIssuerName: "Amazon Web Services, Inc.",
  ListCost: 0,
  PricingQuantity: 0.0002355203,
  PricingUnit: "GB",
  ProviderName: "AWS",
  PublisherName: "Amazon Web Services, Inc.",
  ServiceCategory: "Networking",
  ServiceName: "Elastic Load Balancing",
  // Optional
  ChargeFrequency: "Usage-Based",
  ConsumedQuantity: 0.0002355203,
  ConsumedUnit: "GB",
  ContractedUnitPrice: 0,
  ListUnitPrice: 0,
  PricingCategory: "Standard",
  RegionId: "us-west-2",
  RegionName: "US West (Oregon)",
  ResourceId: "arn:ats:emastilmoalfamanling:us-test-2:115386644665:moalfamanler/onap-gerrit-emf",
  SkuId: "9DEJHBACUYEYMVN8",
  SkuPriceId: "9DEJHBACUYEYMVN8.JRTCKXETXF.6YS6EN2CT7",
  SubAccountId: "66362635077",
  SubAccountName: "Zenith Apollo",
  Tags: {
    application: "BrightSourceCore",
    environment: "dev",
    business_unit: "MarseilleSRE",
  },
};

describe("CostAndUsageRow v1.0", () => {
  it("parses an SQS usage row from the official FOCUS 1.0 sample data", () => {
    const result = Schema.decodeUnknownExit(CostAndUsageRow)(sqsUsageRow);
    expect(Exit.isSuccess(result)).toBe(true);
  });

  it("parses a data-transfer row with tags from the official FOCUS 1.0 sample data", () => {
    const result = Schema.decodeUnknownExit(CostAndUsageRow)(dataTransferRow);
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
