import { Exit, Schema } from "effect";
import { describe, expect, it } from "vitest";
import { CostAndUsageRow } from "../../../focus/v1-1/schema";

// Fixtures derived from tmp/focus-sample-data/FOCUS-1.0/focus_sample.csv
// The CSV column names (InvoiceIssuerName, ProviderName, PublisherName) match
// the v1.1 schema directly — no remapping needed.
// NULL values in the CSV are omitted. Numeric fields are cast from strings to numbers.

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
  InvoiceIssuerName: "Amazon Web Services, Inc.",
  PricingQuantity: 0.00200749,
  PricingUnit: "LCU-Hours",
  ProviderName: "AWS",
  PublisherName: "Amazon Web Services, Inc.",
  // Recommended (optional in schema)
  ChargeFrequency: "Usage-Based",
  ContractedCost: 0,
  ContractedUnitPrice: 0,
  EffectiveCost: 0,
  ListCost: 0.0000160599,
  ListUnitPrice: 0.008,
  PricingCategory: "Standard",
  RegionId: "us-west-2",
  RegionName: "US West (Oregon)",
  ResourceId:
    "arn:ats:emastilmoalfamanling:us-test-2:586597448978:moalfamanler/app/tungsten-lonbmuenle-amf/l365455f461l4e4a",
  ServiceCategory: "Networking",
  ServiceName: "Elastic Load Balancing",
  SkuId: "2ETY8Y426S4237JU",
  SkuPriceId: "2ETY8Y426S4237JU.JRTCKXETXF.6YS6EN2CT7",
  SubAccountId: "43883916739",
  SubAccountName: "Zenith Eclipse",
  Tags: { application: "BrightLensMatrix", environment: "dev", business_unit: "ViennaAI" },
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
  InvoiceIssuerName: "Amazon Web Services, Inc.",
  PricingQuantity: 0.0002355203,
  PricingUnit: "GB",
  ProviderName: "AWS",
  PublisherName: "Amazon Web Services, Inc.",
  // Optional
  ChargeFrequency: "Usage-Based",
  ContractedCost: 0,
  ContractedUnitPrice: 0,
  EffectiveCost: 0,
  ListCost: 0,
  ListUnitPrice: 0,
  PricingCategory: "Standard",
  RegionId: "us-west-2",
  RegionName: "US West (Oregon)",
  ResourceId: "arn:ats:emastilmoalfamanling:us-test-2:115386644665:moalfamanler/onap-gerrit-emf",
  ServiceCategory: "Networking",
  ServiceName: "Elastic Load Balancing",
  SkuId: "9DEJHBACUYEYMVN8",
  SkuPriceId: "9DEJHBACUYEYMVN8.JRTCKXETXF.6YS6EN2CT7",
  SubAccountId: "66362635077",
  SubAccountName: "Zenith Apollo",
  Tags: { application: "BrightSourceCore", environment: "dev", business_unit: "MarseilleSRE" },
};

describe("CostAndUsageRow v1.1", () => {
  it("parses an ALB usage row with tags from the official FOCUS 1.0 sample data", () => {
    const result = Schema.decodeUnknownExit(CostAndUsageRow)(albUsageRow);
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
      ...albUsageRow,
      BilledCost: "not-a-number",
    });
    expect(Exit.isFailure(result)).toBe(true);
  });
});
