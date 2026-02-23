import { Schema } from "effect";

// Nested schemas for JSON columns

const AllocatedMethodDetailsElement = Schema.Struct({
  AllocatedRatio: Schema.Number,
  UsageUnit: Schema.optional(Schema.String),
  UsageQuantity: Schema.optional(Schema.Number),
});

const AllocatedMethodDetails = Schema.Struct({
  Elements: Schema.Array(AllocatedMethodDetailsElement),
});

// Tags and AllocatedTags values can be string or boolean (boolean true for valueless tag keys)
const TagValue = Schema.Union([Schema.String, Schema.Boolean] as const);

const ContractAppliedElement = Schema.Struct({
  ContractID: Schema.String,
  ContractCommitmentID: Schema.String,
  ContractCommitmentAppliedCost: Schema.optional(Schema.NullOr(Schema.Number)),
  ContractCommitmentAppliedQuantity: Schema.optional(Schema.NullOr(Schema.Number)),
  ContractCommitmentAppliedUnit: Schema.optional(Schema.NullOr(Schema.String)),
});

const ContractApplied = Schema.Struct({
  Elements: Schema.Array(ContractAppliedElement),
});

export const CostAndUsageRow = Schema.Struct({
  // Mandatory
  BilledCost: Schema.Number,
  BillingAccountId: Schema.String,
  BillingAccountName: Schema.NullOr(Schema.String),
  BillingCurrency: Schema.String,
  BillingPeriodEnd: Schema.String,
  BillingPeriodStart: Schema.String,
  ChargeCategory: Schema.Literals(["Usage", "Purchase", "Tax", "Credit", "Adjustment"]),
  ChargeClass: Schema.NullOr(Schema.Literal("Correction")),
  ChargeDescription: Schema.NullOr(Schema.String),
  ChargePeriodEnd: Schema.String,
  ChargePeriodStart: Schema.String,
  ContractedCost: Schema.Number,
  EffectiveCost: Schema.Number,
  HostProviderName: Schema.NullOr(Schema.String),
  InvoiceIssuerName: Schema.String,
  ListCost: Schema.Number,
  PricingQuantity: Schema.NullOr(Schema.Number),
  PricingUnit: Schema.NullOr(Schema.String),
  ServiceCategory: Schema.Literals([
    "AI and Machine Learning",
    "Analytics",
    "Business Applications",
    "Compute",
    "Databases",
    "Developer Tools",
    "Multicloud",
    "Identity",
    "Integration",
    "Internet of Things",
    "Management and Governance",
    "Media",
    "Migration",
    "Mobile",
    "Networking",
    "Security",
    "Storage",
    "Web",
    "Other",
  ]),
  ServiceName: Schema.String,
  ServiceProviderName: Schema.String,

  // Recommended (optional in schema, should be present)
  AvailabilityZone: Schema.optional(Schema.NullOr(Schema.String)),
  ChargeFrequency: Schema.optional(Schema.Literals(["One-Time", "Recurring", "Usage-Based"])),
  InvoiceId: Schema.optional(Schema.NullOr(Schema.String)),
  ServiceSubcategory: Schema.optional(Schema.String),

  // Conditional (optional)
  AllocatedMethodDetails: Schema.optional(Schema.NullOr(AllocatedMethodDetails)),
  AllocatedMethodId: Schema.optional(Schema.NullOr(Schema.String)),
  AllocatedResourceId: Schema.optional(Schema.NullOr(Schema.String)),
  AllocatedResourceName: Schema.optional(Schema.NullOr(Schema.String)),
  AllocatedTags: Schema.optional(Schema.NullOr(Schema.Record(Schema.String, TagValue))),
  BillingAccountType: Schema.optional(Schema.String),
  CapacityReservationId: Schema.optional(Schema.NullOr(Schema.String)),
  CapacityReservationStatus: Schema.optional(Schema.NullOr(Schema.Literals(["Used", "Unused"]))),
  CommitmentDiscountCategory: Schema.optional(Schema.NullOr(Schema.Literals(["Spend", "Usage"]))),
  CommitmentDiscountId: Schema.optional(Schema.NullOr(Schema.String)),
  CommitmentDiscountName: Schema.optional(Schema.NullOr(Schema.String)),
  CommitmentDiscountQuantity: Schema.optional(Schema.NullOr(Schema.Number)),
  CommitmentDiscountStatus: Schema.optional(Schema.NullOr(Schema.Literals(["Used", "Unused"]))),
  CommitmentDiscountType: Schema.optional(Schema.NullOr(Schema.String)),
  CommitmentDiscountUnit: Schema.optional(Schema.NullOr(Schema.String)),
  ConsumedQuantity: Schema.optional(Schema.NullOr(Schema.Number)),
  ConsumedUnit: Schema.optional(Schema.NullOr(Schema.String)),
  ContractApplied: Schema.optional(Schema.NullOr(ContractApplied)),
  ContractedUnitPrice: Schema.optional(Schema.NullOr(Schema.Number)),
  ListUnitPrice: Schema.optional(Schema.NullOr(Schema.Number)),
  PricingCategory: Schema.optional(Schema.NullOr(Schema.Literals(["Standard", "Dynamic", "Committed", "Other"]))),
  PricingCurrency: Schema.optional(Schema.NullOr(Schema.String)),
  PricingCurrencyContractedUnitPrice: Schema.optional(Schema.NullOr(Schema.Number)),
  PricingCurrencyEffectiveCost: Schema.optional(Schema.NullOr(Schema.Number)),
  PricingCurrencyListUnitPrice: Schema.optional(Schema.NullOr(Schema.Number)),
  RegionId: Schema.optional(Schema.NullOr(Schema.String)),
  RegionName: Schema.optional(Schema.NullOr(Schema.String)),
  ResourceId: Schema.optional(Schema.NullOr(Schema.String)),
  ResourceName: Schema.optional(Schema.NullOr(Schema.String)),
  ResourceType: Schema.optional(Schema.NullOr(Schema.String)),
  SkuId: Schema.optional(Schema.NullOr(Schema.String)),
  SkuMeter: Schema.optional(Schema.NullOr(Schema.String)),
  SkuPriceDetails: Schema.optional(Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown))),
  SkuPriceId: Schema.optional(Schema.NullOr(Schema.String)),
  SubAccountId: Schema.optional(Schema.NullOr(Schema.String)),
  SubAccountName: Schema.optional(Schema.NullOr(Schema.String)),
  SubAccountType: Schema.optional(Schema.NullOr(Schema.String)),
  Tags: Schema.optional(Schema.NullOr(Schema.Record(Schema.String, TagValue))),

  // Deprecated (still present in v1.3 but replaced by newer columns)
  ProviderName: Schema.optional(Schema.String),
  PublisherName: Schema.optional(Schema.String),
});

export type CostAndUsageRow = typeof CostAndUsageRow.Type;

export const ContractCommitmentRow = Schema.Struct({
  BillingCurrency: Schema.NullOr(Schema.String),
  ContractCommitmentCategory: Schema.Literals(["Spend", "Usage"]),
  ContractCommitmentCost: Schema.NullOr(Schema.Number),
  ContractCommitmentDescription: Schema.NullOr(Schema.String),
  ContractCommitmentId: Schema.NullOr(Schema.String),
  ContractCommitmentPeriodEnd: Schema.String,
  ContractCommitmentPeriodStart: Schema.String,
  ContractCommitmentQuantity: Schema.NullOr(Schema.Number),
  ContractCommitmentType: Schema.String,
  ContractCommitmentUnit: Schema.NullOr(Schema.String),
  ContractId: Schema.NullOr(Schema.String),
  ContractPeriodEnd: Schema.String,
  ContractPeriodStart: Schema.String,
});

export type ContractCommitmentRow = typeof ContractCommitmentRow.Type;
