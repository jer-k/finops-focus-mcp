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

// AllocatedTags values can be string or boolean (boolean true for tag keys that don't support values)
const AllocatedTags = Schema.Record(Schema.String, Schema.Union([Schema.String, Schema.Boolean]));

const ContractAppliedElement = Schema.Struct({
  ContractCommitmentId: Schema.String,
  ContractCommitmentAppliedCost: Schema.Number,
});

const ContractApplied = Schema.Struct({
  Elements: Schema.Array(ContractAppliedElement),
});

export const CostAndUsageRow = Schema.Struct({
  // Mandatory
  BilledCost: Schema.Number,
  BillingAccountId: Schema.String,
  BillingAccountName: Schema.String,
  BillingCurrency: Schema.String,
  BillingPeriodEnd: Schema.String,
  BillingPeriodStart: Schema.String,
  ChargeCategory: Schema.String,
  ChargeClass: Schema.String,
  ChargeDescription: Schema.String,
  ChargePeriodEnd: Schema.String,
  ChargePeriodStart: Schema.String,
  ContractedCost: Schema.Number,
  EffectiveCost: Schema.Number,
  HostProviderName: Schema.String,
  InvoiceIssuerName: Schema.String,
  ListCost: Schema.Number,
  ServiceCategory: Schema.String,
  ServiceName: Schema.String,
  ServiceProviderName: Schema.String,
  SubAccountId: Schema.String,
  SubAccountName: Schema.String,

  // Recommended (optional in schema, should be present)
  AvailabilityZone: Schema.optional(Schema.String),
  ChargeFrequency: Schema.optional(Schema.String),
  ContractedUnitPrice: Schema.optional(Schema.Number),
  InvoiceId: Schema.optional(Schema.String),
  ListUnitPrice: Schema.optional(Schema.Number),
  PricingCategory: Schema.optional(Schema.String),
  PricingCurrency: Schema.optional(Schema.String),
  PricingCurrencyContractedUnitPrice: Schema.optional(Schema.Number),
  PricingCurrencyEffectiveCost: Schema.optional(Schema.Number),
  PricingCurrencyListUnitPrice: Schema.optional(Schema.Number),
  RegionName: Schema.optional(Schema.String),
  ResourceName: Schema.optional(Schema.String),
  ResourceType: Schema.optional(Schema.String),
  ServiceSubcategory: Schema.optional(Schema.String),
  SkuId: Schema.optional(Schema.String),
  SkuMeter: Schema.optional(Schema.String),
  SkuPriceDetails: Schema.optional(Schema.String),
  SkuPriceId: Schema.optional(Schema.String),
  Tags: Schema.optional(Schema.Record(Schema.String, Schema.String)),

  // Conditional (optional)
  AllocatedMethodDetails: Schema.optional(AllocatedMethodDetails),
  AllocatedMethodId: Schema.optional(Schema.String),
  AllocatedResourceId: Schema.optional(Schema.String),
  AllocatedResourceName: Schema.optional(Schema.String),
  AllocatedTags: Schema.optional(AllocatedTags),
  BillingAccountType: Schema.optional(Schema.String),
  CapacityReservationId: Schema.optional(Schema.String),
  CapacityReservationStatus: Schema.optional(Schema.String),
  CommitmentDiscountCategory: Schema.optional(Schema.String),
  CommitmentDiscountId: Schema.optional(Schema.String),
  CommitmentDiscountName: Schema.optional(Schema.String),
  CommitmentDiscountQuantity: Schema.optional(Schema.Number),
  CommitmentDiscountStatus: Schema.optional(Schema.String),
  CommitmentDiscountType: Schema.optional(Schema.String),
  CommitmentDiscountUnit: Schema.optional(Schema.String),
  ConsumedQuantity: Schema.optional(Schema.Number),
  ConsumedUnit: Schema.optional(Schema.String),
  ContractApplied: Schema.optional(ContractApplied),
  InvoiceIssuer: Schema.optional(Schema.String),
  PricingQuantity: Schema.optional(Schema.Number),
  PricingUnit: Schema.optional(Schema.String),
  RegionId: Schema.optional(Schema.String),
  ResourceId: Schema.optional(Schema.String),
  SubAccountType: Schema.optional(Schema.String),

  // Deprecated (still present but replaced by newer columns)
  Provider: Schema.optional(Schema.String),
  Publisher: Schema.optional(Schema.String),
});

export type CostAndUsageRow = typeof CostAndUsageRow.Type;

export const ContractCommitmentRow = Schema.Struct({
  BillingCurrency: Schema.String,
  ContractCommitmentCost: Schema.Number,
  ContractCommitmentId: Schema.String,
  ContractCommitmentCategory: Schema.String,
  ContractCommitmentDescription: Schema.String,
  ContractCommitmentPeriodEnd: Schema.String,
  ContractCommitmentPeriodStart: Schema.String,
  ContractCommitmentQuantity: Schema.Number,
  ContractCommitmentType: Schema.String,
  ContractCommitmentUnit: Schema.String,
  ContractId: Schema.String,
  ContractPeriodEnd: Schema.String,
  ContractPeriodStart: Schema.String,
});

export type ContractCommitmentRow = typeof ContractCommitmentRow.Type;
