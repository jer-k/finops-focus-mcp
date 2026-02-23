export type FocusColumn = {
  name: string;
  dataType: "String" | "Decimal" | "DateTime" | "KeyValue" | "JSON";
  status: "Mandatory" | "Conditional" | "Recommended" | "Optional";
  description: string;
  deprecated?: boolean;
};

export const costAndUsageColumns: FocusColumn[] = [
  {
    name: "AllocatedMethodDetails",
    dataType: "JSON",
    status: "Recommended",
    description:
      "A set of properties describing how resources are allocated in data generator-defined split cost allocation.",
  },
  {
    name: "AllocatedMethodId",
    dataType: "String",
    status: "Conditional",
    description: "The identifier of the allocation method used to split costs.",
  },
  {
    name: "AllocatedResourceId",
    dataType: "String",
    status: "Conditional",
    description: "The identifier of the resource the cost was allocated to.",
  },
  {
    name: "AllocatedResourceName",
    dataType: "String",
    status: "Conditional",
    description: "The name of the resource the cost was allocated to.",
  },
  {
    name: "AllocatedTags",
    dataType: "JSON",
    status: "Conditional",
    description:
      "A set of tags assigned to tag sources that are applicable to allocated charges in data generator-calculated split cost allocation.",
  },
  {
    name: "AvailabilityZone",
    dataType: "String",
    status: "Recommended",
    description: "The availability zone in which a resource is running or a service is provided.",
  },
  {
    name: "BilledCost",
    dataType: "Decimal",
    status: "Mandatory",
    description: "The amount charged to the buyer, net of any discounts applied, after any applicable credits.",
  },
  {
    name: "BillingAccountId",
    dataType: "String",
    status: "Mandatory",
    description: "The identifier of the billing account responsible for the costs.",
  },
  {
    name: "BillingAccountName",
    dataType: "String",
    status: "Mandatory",
    description: "The name of the billing account responsible for the costs.",
  },
  {
    name: "BillingAccountType",
    dataType: "String",
    status: "Conditional",
    description: "The type of the billing account responsible for the costs.",
  },
  {
    name: "BillingCurrency",
    dataType: "String",
    status: "Mandatory",
    description: "The currency used for the billing of the cost.",
  },
  {
    name: "BillingPeriodEnd",
    dataType: "DateTime",
    status: "Mandatory",
    description: "The end date and time of the billing period.",
  },
  {
    name: "BillingPeriodStart",
    dataType: "DateTime",
    status: "Mandatory",
    description: "The start date and time of the billing period.",
  },
  {
    name: "CapacityReservationId",
    dataType: "String",
    status: "Conditional",
    description: "The identifier assigned to a capacity reservation by the provider.",
  },
  {
    name: "CapacityReservationStatus",
    dataType: "String",
    status: "Conditional",
    description: "Indicates whether a charge represents consumption or the unused portion of a capacity reservation.",
  },
  {
    name: "ChargeCategory",
    dataType: "String",
    status: "Mandatory",
    description: "The category of the charge. Allowed values: Usage, Purchase, Tax, Credit, Adjustment.",
  },
  {
    name: "ChargeClass",
    dataType: "String",
    status: "Mandatory",
    description: "Indicates whether the row represents a correction to a previously invoiced billing period.",
  },
  {
    name: "ChargeDescription",
    dataType: "String",
    status: "Mandatory",
    description: "A description of the charge.",
  },
  {
    name: "ChargeFrequency",
    dataType: "String",
    status: "Recommended",
    description: "The frequency of the charge. Allowed values: One-Time, Recurring, Usage-Based.",
  },
  {
    name: "ChargePeriodEnd",
    dataType: "DateTime",
    status: "Mandatory",
    description: "The end date and time of the charge period.",
  },
  {
    name: "ChargePeriodStart",
    dataType: "DateTime",
    status: "Mandatory",
    description: "The start date and time of the charge period.",
  },
  {
    name: "CommitmentDiscountCategory",
    dataType: "String",
    status: "Conditional",
    description: "The category of commitment discount applied. Allowed values: Spend, Usage.",
  },
  {
    name: "CommitmentDiscountId",
    dataType: "String",
    status: "Conditional",
    description: "The identifier of the commitment discount applied.",
  },
  {
    name: "CommitmentDiscountName",
    dataType: "String",
    status: "Conditional",
    description: "The name of the commitment discount applied.",
  },
  {
    name: "CommitmentDiscountQuantity",
    dataType: "Decimal",
    status: "Conditional",
    description: "The amount of a commitment discount purchased or accounted for in a given row.",
  },
  {
    name: "CommitmentDiscountStatus",
    dataType: "String",
    status: "Conditional",
    description:
      "Indicates whether the charge corresponds to the used or unused portion of a commitment discount. Allowed values: Used, Unused.",
  },
  {
    name: "CommitmentDiscountType",
    dataType: "String",
    status: "Conditional",
    description: "The type of commitment discount applied.",
  },
  {
    name: "CommitmentDiscountUnit",
    dataType: "String",
    status: "Conditional",
    description:
      "The provider-specified measurement unit indicating how a provider measures the CommitmentDiscountQuantity.",
  },
  {
    name: "ConsumedQuantity",
    dataType: "Decimal",
    status: "Conditional",
    description: "The quantity of a resource or service consumed.",
  },
  {
    name: "ConsumedUnit",
    dataType: "String",
    status: "Conditional",
    description: "The unit of measure for the consumed quantity.",
  },
  {
    name: "ContractApplied",
    dataType: "JSON",
    status: "Conditional",
    description: "A set of properties that associate a charge with one or more contract commitments.",
  },
  {
    name: "ContractedCost",
    dataType: "Decimal",
    status: "Mandatory",
    description: "The cost calculated by multiplying contracted unit price by the pricing quantity.",
  },
  {
    name: "ContractedUnitPrice",
    dataType: "Decimal",
    status: "Conditional",
    description: "The contracted unit price for the pricing unit.",
  },
  {
    name: "EffectiveCost",
    dataType: "Decimal",
    status: "Mandatory",
    description: "The amortized cost inclusive of the impact of commitment-based discounts.",
  },
  {
    name: "HostProviderName",
    dataType: "String",
    status: "Mandatory",
    description: "The name of the provider hosting the resource or service.",
  },
  {
    name: "InvoiceId",
    dataType: "String",
    status: "Recommended",
    description: "The identifier of the invoice associated with the charge.",
  },
  {
    name: "InvoiceIssuerName",
    dataType: "String",
    status: "Mandatory",
    description: "The name of the entity responsible for invoicing the customer.",
  },
  {
    name: "ListCost",
    dataType: "Decimal",
    status: "Mandatory",
    description: "The cost calculated by multiplying the list unit price by the pricing quantity.",
  },
  {
    name: "ListUnitPrice",
    dataType: "Decimal",
    status: "Conditional",
    description: "The list unit price for the pricing unit, before any discounts.",
  },
  {
    name: "PricingCategory",
    dataType: "String",
    status: "Conditional",
    description: "The pricing model used. Allowed values: Standard, Dynamic, Committed, Other.",
  },
  {
    name: "PricingCurrency",
    dataType: "String",
    status: "Conditional",
    description: "The currency used for pricing prior to conversion to the billing currency.",
  },
  {
    name: "PricingCurrencyContractedUnitPrice",
    dataType: "Decimal",
    status: "Conditional",
    description: "The contracted unit price expressed in the pricing currency.",
  },
  {
    name: "PricingCurrencyEffectiveCost",
    dataType: "Decimal",
    status: "Conditional",
    description: "The effective cost expressed in the pricing currency.",
  },
  {
    name: "PricingCurrencyListUnitPrice",
    dataType: "Decimal",
    status: "Conditional",
    description: "The list unit price expressed in the pricing currency.",
  },
  {
    name: "PricingQuantity",
    dataType: "Decimal",
    status: "Mandatory",
    description: "The quantity used for pricing calculations.",
  },
  {
    name: "PricingUnit",
    dataType: "String",
    status: "Mandatory",
    description: "Service-provider-specified measurement unit for determining unit prices.",
  },
  {
    name: "ProviderName",
    dataType: "String",
    status: "Mandatory",
    description:
      "The name of the entity that made the resources or services available for purchase. Deprecated in 1.3 — use ServiceProviderName instead.",
    deprecated: true,
  },
  {
    name: "PublisherName",
    dataType: "String",
    status: "Mandatory",
    description:
      "The name of the entity that produced the resources or services that were purchased. Deprecated in 1.3.",
    deprecated: true,
  },
  {
    name: "RegionId",
    dataType: "String",
    status: "Conditional",
    description: "The identifier of the geographic area where the resource is located.",
  },
  {
    name: "RegionName",
    dataType: "String",
    status: "Conditional",
    description: "The name of the geographic area where the resource is located.",
  },
  {
    name: "ResourceId",
    dataType: "String",
    status: "Conditional",
    description: "The identifier of the resource.",
  },
  {
    name: "ResourceName",
    dataType: "String",
    status: "Conditional",
    description: "The name of the resource.",
  },
  {
    name: "ResourceType",
    dataType: "String",
    status: "Conditional",
    description: "The type or category of the resource.",
  },
  {
    name: "ServiceCategory",
    dataType: "String",
    status: "Mandatory",
    description: "The highest-level classification of a service based on its core function.",
  },
  {
    name: "ServiceName",
    dataType: "String",
    status: "Mandatory",
    description: "An offering that can be purchased from a provider.",
  },
  {
    name: "ServiceProviderName",
    dataType: "String",
    status: "Mandatory",
    description:
      "The name of the entity that made the resources or services available for purchase. Replaces deprecated ProviderName.",
  },
  {
    name: "ServiceSubcategory",
    dataType: "String",
    status: "Recommended",
    description: "A secondary classification of a service that provides additional detail within a ServiceCategory.",
  },
  {
    name: "SkuId",
    dataType: "String",
    status: "Conditional",
    description: "The identifier of the cloud product in the provider's catalog.",
  },
  {
    name: "SkuMeter",
    dataType: "String",
    status: "Conditional",
    description: "The name of the measurement type used to identify the unit of measure for a specific SKU resource.",
  },
  {
    name: "SkuPriceDetails",
    dataType: "JSON",
    status: "Conditional",
    description:
      "A set of properties of a SKU Price ID which are meaningful and common to all instances of that SKU Price ID.",
  },
  {
    name: "SkuPriceId",
    dataType: "String",
    status: "Conditional",
    description: "The identifier for the price of a given SKU.",
  },
  {
    name: "SubAccountId",
    dataType: "String",
    status: "Conditional",
    description: "An ID assigned to a grouping of resources or services, often used to manage access and/or cost.",
  },
  {
    name: "SubAccountName",
    dataType: "String",
    status: "Conditional",
    description: "The name of the sub-account or project responsible for the costs.",
  },
  {
    name: "SubAccountType",
    dataType: "String",
    status: "Conditional",
    description: "The type of the sub-account or project responsible for the costs.",
  },
  {
    name: "Tags",
    dataType: "JSON",
    status: "Conditional",
    description:
      "The set of tags assigned to tag sources that account for potential provider-defined or user-defined tag evaluations.",
  },
];

export const contractCommitmentColumns: FocusColumn[] = [
  {
    name: "BillingCurrency",
    dataType: "String",
    status: "Mandatory",
    description: "The currency used for the billing of the contract commitment.",
  },
  {
    name: "ContractCommitmentCategory",
    dataType: "String",
    status: "Mandatory",
    description: "The category of the contract commitment. Allowed values: Spend, Usage.",
  },
  {
    name: "ContractCommitmentCost",
    dataType: "Decimal",
    status: "Mandatory",
    description: "The cost associated with the contract commitment.",
  },
  {
    name: "ContractCommitmentDescription",
    dataType: "String",
    status: "Mandatory",
    description: "A description of the contract commitment.",
  },
  {
    name: "ContractCommitmentId",
    dataType: "String",
    status: "Mandatory",
    description: "The identifier of the contract commitment.",
  },
  {
    name: "ContractCommitmentPeriodEnd",
    dataType: "DateTime",
    status: "Mandatory",
    description: "The end date and time of the contract commitment period.",
  },
  {
    name: "ContractCommitmentPeriodStart",
    dataType: "DateTime",
    status: "Mandatory",
    description: "The start date and time of the contract commitment period.",
  },
  {
    name: "ContractCommitmentQuantity",
    dataType: "Decimal",
    status: "Mandatory",
    description: "The quantity associated with the contract commitment.",
  },
  {
    name: "ContractCommitmentType",
    dataType: "String",
    status: "Mandatory",
    description: "The type of the contract commitment.",
  },
  {
    name: "ContractCommitmentUnit",
    dataType: "String",
    status: "Mandatory",
    description: "The unit of measure for the contract commitment quantity.",
  },
  {
    name: "ContractId",
    dataType: "String",
    status: "Mandatory",
    description: "The identifier of the contract associated with the commitment.",
  },
  {
    name: "ContractPeriodEnd",
    dataType: "DateTime",
    status: "Mandatory",
    description: "The end date and time of the contract period.",
  },
  {
    name: "ContractPeriodStart",
    dataType: "DateTime",
    status: "Mandatory",
    description: "The start date and time of the contract period.",
  },
];
