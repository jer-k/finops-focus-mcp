import { Schema } from "effect";

export const CostAndUsageRow = Schema.Struct({
  // Mandatory fields
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
  InvoiceIssuer: Schema.String,
  ListCost: Schema.Number,
  PricingQuantity: Schema.Number,
  PricingUnit: Schema.String,
  Provider: Schema.String,
  Publisher: Schema.String,
  ServiceCategory: Schema.String,
  ServiceName: Schema.String,

  // Recommended fields
  AvailabilityZone: Schema.optional(Schema.String),
  ChargeFrequency: Schema.optional(Schema.String),

  // Conditional fields
  CommitmentDiscountCategory: Schema.optional(Schema.String),
  CommitmentDiscountId: Schema.optional(Schema.String),
  CommitmentDiscountName: Schema.optional(Schema.String),
  CommitmentDiscountStatus: Schema.optional(Schema.String),
  CommitmentDiscountType: Schema.optional(Schema.String),
  ConsumedQuantity: Schema.optional(Schema.Number),
  ConsumedUnit: Schema.optional(Schema.String),
  ContractedUnitPrice: Schema.optional(Schema.Number),
  ListUnitPrice: Schema.optional(Schema.Number),
  PricingCategory: Schema.optional(Schema.String),
  RegionId: Schema.optional(Schema.String),
  RegionName: Schema.optional(Schema.String),
  ResourceId: Schema.optional(Schema.String),
  ResourceName: Schema.optional(Schema.String),
  ResourceType: Schema.optional(Schema.String),
  SkuId: Schema.optional(Schema.String),
  SkuPriceId: Schema.optional(Schema.String),
  SubAccountId: Schema.optional(Schema.String),
  SubAccountName: Schema.optional(Schema.String),
  Tags: Schema.optional(Schema.Record(Schema.String, Schema.String)),
});

export type CostAndUsageRow = typeof CostAndUsageRow.Type;
