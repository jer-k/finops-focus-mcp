import type { FocusQuery } from "../types";

export const v10BaseQueries: FocusQuery[] = [
  {
    id: "allocate_multi_currency_charges_per_application",
    name: "Allocate multi-currency charges per application",
    sql: `SELECT
  Tags["ApplicationId"],
  ProviderName,
  BillingAccountId,
  BillingAccountName,
  BillingCurrency,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE
  BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  Tags["ApplicationId"],
  ProviderName,
  BillingAccountId,
  BillingAccountName,
  BillingCurrency`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "analyze_costs_by_availability_zone_for_a_subaccount",
    name: "Analyze costs by availability zone for a subaccount",
    sql: `SELECT
  ProviderName,
  RegionName,
  AvailabilityZone,
  BillingPeriodStart,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE SubAccountId = ?
  AND ChargePeriodStart >= ? AND ChargePeriodEnd < ?
GROUP BY
  ProviderName,
  RegionName,
  AvailabilityZone,
  BillingPeriodStart
ORDER BY ProviderName, RegionName, AvailabilityZone, BillingPeriodStart`,
    params: [
      { name: "sub_account_id", type: "String", description: "The sub account identifier" },
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_costs_by_service_name",
    name: "Analyze costs by service name",
    sql: `SELECT
  BillingPeriodStart,
  ProviderName,
  SubAccountId,
  SubAccountName,
  ServiceName,
  SUM(BilledCost) AS TotalBilledCost,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ServiceName = ?
  AND BillingPeriodStart >= ? AND BillingPeriodStart < ?
GROUP BY
  BillingPeriodStart,
  ProviderName,
  SubAccountId,
  SubAccountName,
  ServiceName`,
    params: [
      { name: "service_name", type: "String", description: "The service name to filter by" },
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "analyze_costs_of_components_of_a_resource",
    name: "Analyze costs of components of a resource",
    sql: `SELECT
  ResourceId,
  ResourceName,
  ResourceType,
  ChargeDescription,
  SkuId,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND ResourceId = ?
GROUP BY
  ResourceId,
  ResourceName,
  ResourceType,
  ChargeDescription,
  SkuId`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
      { name: "resource_id", type: "String", description: "The resource identifier" },
    ],
  },
  {
    id: "analyze_cost_per_compute_service_for_a_subaccount",
    name: "Analyze cost per compute service for a subaccount",
    sql: `SELECT
  Min(ChargePeriodStart),
  Max(ChargePeriodEnd),
  ServiceName,
  ResourceId,
  ResourceName,
  SUM(PricingQuantity),
  SUM(EffectiveCost) AS MonthlyEffectiveCost
FROM focus_data_table
WHERE SubAccountId = ?
  AND ServiceCategory = 'Compute'
  AND ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  ServiceName,
  ResourceId,
  ResourceName
ORDER BY MonthlyEffectiveCost DESC`,
    params: [
      { name: "sub_account_id", type: "String", description: "The sub account identifier" },
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_marketplace_vendors_costs",
    name: "Analyze marketplace vendors costs",
    sql: `SELECT
  ChargePeriodStart,
  ChargePeriodEnd,
  ProviderName,
  PublisherName,
  InvoiceIssuerName,
  ROUND(SUM(EffectiveCost),2) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND InvoiceIssuerName != PublisherName
GROUP BY
  ChargePeriodStart,
  ChargePeriodEnd,
  ProviderName,
  PublisherName,
  InvoiceIssuerName
ORDER BY TotalEffectiveCost ASC`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_resource_costs_by_sku",
    name: "Analyze resource costs by SKU",
    sql: `SELECT
  ProviderName,
  ChargePeriodStart,
  ChargePeriodEnd,
  SkuId,
  SkuPriceId,
  PricingUnit,
  ListUnitPrice,
  SUM(PricingQuantity) AS TotalPricingQuantity,
  SUM(ListCost) AS TotalListCost,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  ProviderName,
  ChargePeriodStart,
  ChargePeriodEnd,
  SkuId,
  SkuPriceId,
  PricingUnit,
  ListUnitPrice
ORDER BY ChargePeriodStart ASC
LIMIT 100`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_service_costs_by_region",
    name: "Analyze service costs by region",
    sql: `SELECT
  ChargePeriodStart,
  ProviderName,
  RegionId,
  ServiceName,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  ChargePeriodStart,
  ProviderName,
  RegionId,
  ServiceName
ORDER BY ChargePeriodStart, SUM(EffectiveCost) DESC`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_service_costs_by_subaccount",
    name: "Analyze service costs by subaccount",
    sql: `SELECT
  ChargePeriodStart,
  SubAccountId,
  SubAccountName,
  ServiceName,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE SubAccountID = ?
  AND ChargePeriodStart >= ? AND ChargePeriodEnd < ?
GROUP BY
  ChargePeriodStart,
  SubAccountId,
  SubAccountName,
  ServiceName
ORDER BY SUM(EffectiveCost) DESC
LIMIT 10`,
    params: [
      { name: "sub_account_id", type: "String", description: "The sub account identifier" },
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_service_costs_month_over_month",
    name: "Analyze service costs month over month",
    sql: `SELECT
  MONTH(ChargePeriodStart),
  ProviderName,
  ServiceName,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodStart < ?
GROUP BY
  MONTH(ChargePeriodStart),
  ProviderName,
  ServiceName
ORDER BY MONTH(ChargePeriodStart), SUM(EffectiveCost) DESC`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_tag_coverage",
    name: "Analyze tag coverage",
    sql: `SELECT
    SUM(CASE
        WHEN JSON_CONTAINS_PATH(tags, 'one', '$.?')
        THEN EffectiveCost
        ELSE 0
    END) / SUM(EffectiveCost) * 100 AS TaggedPercentage
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND EffectiveCost > 0
  AND ProviderName = ?`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
      { name: "provider_name", type: "String", description: "The provider name to filter by" },
    ],
  },
  {
    id: "compare_billed_cost_per_subaccount_to_budget",
    name: "Compare billed cost per subaccount to budget",
    sql: `SELECT
  ProviderName,
  SubAccountId,
  SubAccountName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargeCategory = 'Usage'
  AND ChargePeriodStart >= ? and ChargePeriodEnd <= ?
  AND ProviderName = ?
  AND SubAccountId = ?
GROUP BY
  ProviderName,
  SubAccountId,
  SubAccountName`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (inclusive)" },
      { name: "provider_name", type: "String", description: "The provider name to filter by" },
      { name: "sub_account_id", type: "String", description: "The sub account identifier" },
    ],
  },
  {
    id: "compare_resource_usage_month_over_month",
    name: "Compare resource usage month over month",
    sql: `SELECT
  MONTH(ChargePeriodStart),
  ProviderName,
  ServiceName,
  ResourceId,
  SkuId,
  ConsumedUnit,
  SUM(ConsumedQuantity) AS TotalConsumedQuantity
FROM focus_data_table
WHERE ChargeCategory = 'Usage'
  AND ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  MONTH(ChargePeriodStart),
  ProviderName,
  ServiceName,
  ResourceId,
  SkuId,
  ConsumedUnit`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "determine_effective_savings_rate",
    name: "Determine Effective Savings Rate",
    sql: `SELECT
  ProviderName,
  EffectiveCost,
  ((ListCost - EffectiveCost)/ListCost) AS ESROverList,
  ((ContractedCost - EffectiveCost)/ContractedUnitPrice) AS ESROverContract
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "determine_effective_savings_rate_by_service",
    name: "Determine Effective Savings Rate by Service",
    sql: `SELECT
  ProviderName,
  ServiceName,
  SUM(ContractedCost) AS TotalContractedCost,
  SUM(EffectiveCost) AS TotalEffectiveCost,
  ((SUM(ContractedCost) - SUM(EffectiveCost))/SUM(ContractedCost)) AS EffectiveSavingsRate
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  ProviderName,
  ServiceName`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "forecast_amortized_costs_month_over_month",
    name: "Forecast amortized costs month over month",
    sql: `SELECT
  MONTH(BillingPeriodStart),
  ProviderName,
  ServiceCategory,
  ServiceName,
  ChargeCategory,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  MONTH(BillingPeriodStart),
  ProviderName,
  ServiceCategory,
  ServiceName,
  ChargeCategory`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "forecast_cashflow_month_over_month_by_service",
    name: "Forecast cashflow month over month by service",
    sql: `SELECT
  MONTH(BillingPeriodStart),
  ProviderName,
  ServiceCategory,
  ServiceName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  MONTH(BillingPeriodStart),
  ProviderName,
  ServiceCategory,
  ServiceName`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "get_historical_usage_and_rates_for_cost_forecasting",
    name: "Get historical usage and rates for cost forecasting",
    sql: `SELECT
  ProviderName,
  BillingPeriodStart,
  BillingPeriodEnd,
  ServiceCategory,
  ServiceName,
  RegionId,
  RegionName,
  PricingUnit,
  SUM(EffectiveCost) AS TotalEffectiveCost,
  SUM(PricingQuantity) AS TotalPricingQuantity
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd <= ?
GROUP BY
  ProviderName,
  BillingPeriodStart,
  BillingPeriodEnd,
  ServiceCategory,
  ServiceName,
  RegionId,
  RegionName,
  PricingUnit`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (inclusive)" },
    ],
  },
  {
    id: "identify_anomalous_daily_spending_by_subaccount",
    name: "Identify anomalous daily spending by subaccount",
    sql: `SELECT
  DATE(ChargePeriodStart) AS Day,
  ProviderName,
  SubAccountId,
  SUM(EffectiveCost) AS DailyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  DATE(ChargePeriodStart) AS StartDay,
  ProviderName,
  SubAccountId`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "identify_anomalous_daily_spending_by_subaccount_and_region",
    name: "Identify anomalous daily spending by subaccount and region",
    sql: `SELECT
  DATE(ChargePeriodStart) AS Day,
  ProviderName,
  SubAccountId,
  RegionId,
  RegionName,
  SUM(EffectiveCost) AS DailyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  DATE(ChargePeriodStart) AS StartDay,
  ProviderName,
  SubAccountId,
  RegionId,
  RegionName`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "identify_anomalous_daily_spending_by_subaccount_region_and_service",
    name: "Identify anomalous daily spending by subaccount, region, and service",
    sql: `SELECT
  DATE(ChargePeriodStart) AS Day,
  ProviderName,
  SubAccountId,
  RegionId,
  RegionName,
  ServiceName,
  SUM(EffectiveCost) AS DailyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  DATE(ChargePeriodStart) AS StartDay,
  ProviderName,
  SubAccountId,
  RegionId,
  RegionName,
  ServiceName`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "identify_unused_commitments",
    name: "Identify unused commitments",
    sql: `SELECT
  MIN(ChargePeriodStart) AS ChargePeriodStart,
  MAX(ChargePeriodEnd) AS ChargePeriodEnd,
  ProviderName,
  BillingAccountId,
  CommitmentDiscountId,
  CommitmentDiscountType,
  CommitmentDiscountStatus,
  SUM(BilledCost) AS TotalBilledCost,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND CommitmentDiscountStatus = 'Unused'
GROUP BY
  ProviderName,
  BillingAccountId,
  CommitmentDiscountId,
  CommitmentDiscountType`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "report_application_cost_month_over_month",
    name: "Report application cost month over month",
    sql: `SELECT
  MONTH(BillingPeriodStart),
  ServiceName,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE Tags["Application"] = ?
  AND ChargePeriodStart >= ? AND ChargePeriodEnd < ?
GROUP BY
  MONTH(BillingPeriodStart),
  ServiceName`,
    params: [
      { name: "application", type: "String", description: "The application tag value to filter by" },
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "report_commitment_discount_purchases",
    name: "Report commitment discount purchases",
    sql: `SELECT
  MIN(ChargePeriodStart) AS ChargePeriodStart,
  MAX(ChargePeriodEnd) AS ChargePeriodEnd,
  ProviderName,
  BillingAccountId,
  CommitmentDiscountId,
  CommitmentDiscountType,
  CommitmentDiscountUnit,
  CommitmentDiscountQuantity,
  ChargeFrequency,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND ChargeCategory = 'Purchase'
  AND CommitmentDiscountId IS NOT NULL
GROUP BY
  ProviderName,
  BillingAccountId,
  CommitmentDiscountId,
  CommitmentDiscountType,
  CommitmentDiscountUnit,
  CommitmentDiscountQuantity,
  ChargeFrequency`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "report_corrections_by_subaccount_for_a_previously_invoiced_billing_period",
    name: "Report corrections by subaccount for a previously invoiced billing period",
    sql: `SELECT
  ProviderName,
  BillingAccountId,
  ServiceCategory,
  SubAccountId,
  SubAccountName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
  AND ChargeClass = 'Correction'
GROUP BY
  ProviderName,
  BillingAccountId,
  SubAccountId,
  SubAccountName,
  ServiceCategory`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "report_corrections_for_a_previously_invoiced_billing_period",
    name: "Report corrections for a previously invoiced billing period",
    sql: `SELECT
  ProviderName,
  BillingAccountId,
  ChargeCategory,
  ServiceCategory,
  ServiceName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
  AND ChargeClass = 'Correction'
GROUP BY
  ProviderName,
  BillingAccountId,
  ChargeCategory,
  ServiceCategory,
  ServiceName`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "report_costs_by_service_category",
    name: "Report costs by service category",
    sql: `SELECT
  ProviderName,
  BillingCurrency,
  BillingPeriodStart,
  ServiceCategory,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? and BillingPeriodEnd <= ?
GROUP BY
  ProviderName,
  BillingCurrency,
  BillingPeriodStart,
  ServiceCategory
ORDER BY TotalBilledCost DESC`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (inclusive)" },
    ],
  },
  {
    id: "report_effective_cost_of_compute",
    name: "Report effective cost of compute",
    sql: `SELECT
  CommitmentDiscountType,
  ProviderName,
  ServiceName,
  SubAccountId,
  SubAccountName,
  BillingPeriodStart,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd <= ?
  AND ServiceCategory = 'Compute'
GROUP BY
  CommitmentDiscountType,
  ServiceName,
  ProviderName,
  SubAccountId,
  SubAccountName,
  BillingPeriodStart`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (inclusive)" },
    ],
  },
  {
    id: "report_service_costs_by_providers_subaccount",
    name: "Report service costs by providers subaccount",
    sql: `SELECT
  ProviderName,
  ServiceName,
  SubAccountId,
  ChargePeriodStart,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
  AND SubAccountId = ?
  AND ProviderName = ?
GROUP BY
  ProviderName,
  ServiceName,
  SubAccountId,
  ChargePeriodStart
ORDER BY SUM(EffectiveCost), BillingPeriodStart DESC`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
      { name: "sub_account_id", type: "String", description: "The sub account identifier" },
      { name: "provider_name", type: "String", description: "The provider name to filter by" },
    ],
  },
  {
    id: "report_spending_across_billing_periods_by_service_category",
    name: "Report spending across billing periods by service category",
    sql: `SELECT
  ProviderName,
  BillingAccountName,
  BillingAccountId,
  BillingCurrency,
  BillingPeriodStart,
  ServiceCategory,
  ServiceName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND ProviderName = ?
GROUP BY
  ProviderName,
  BillingAccountName,
  BillingAccountId,
  BillingCurrency,
  BillingPeriodStart,
  ServiceCategory,
  ServiceName
ORDER BY TotalBilledCost DESC`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
      { name: "provider_name", type: "String", description: "The provider name to filter by" },
    ],
  },
  {
    id: "report_subaccounts_by_region",
    name: "Report subaccounts by region",
    sql: `SELECT
  ProviderName,
  SubAccountId,
  RegionId,
  RegionName,
  COUNT(1)
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
GROUP BY
  ProviderName,
  SubAccountId,
  RegionId,
  RegionName`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "update_budgets_for_each_application",
    name: "Update budgets for each application",
    sql: `SELECT
  ProviderName,
  BillingPeriodStart,
  BillingPeriodEnd,
  Tags["Application"] AS Application,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  ProviderName,
  BillingPeriodStart,
  BillingPeriodEnd,
  Tags["Application"]`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "update_budgets_with_billed_costs",
    name: "Update budgets with billed costs",
    sql: `SELECT
  ProviderName,
  BillingPeriodStart,
  BillingPeriodEnd,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  ProviderName,
  BillingPeriodStart,
  BillingPeriodEnd`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "verify_accuracy_of_service_provider_invoices",
    name: "Verify accuracy of service provider invoices",
    sql: `SELECT
  ProviderName,
  BillingAccountId,
  BillingAccountName,
  BillingCurrency,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  ProviderName,
  BillingAccountId,
  BillingAccountName,
  BillingCurrency`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "verify_accuracy_of_services_charges_across_service_providers",
    name: "Verify accuracy of services charges across service providers",
    sql: `SELECT
  ProviderName,
  BillingAccountId,
  BillingAccountName,
  BillingCurrency,
  ServiceName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  ProviderName,
  BillingAccountName,
  BillingAccountId,
  BillingCurrency,
  ServiceName`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "verify_discount_accuracy_for_a_previously_invoiced_billing_period",
    name: "Verify discount accuracy for a previously invoiced billing period",
    sql: `SELECT
  ProviderName,
  BillingAccountId,
  BillingAccountName,
  BillingCurrency,
  ServiceName,
  SUM(EffectiveCost) AS TotalEffectiveCost,
  SUM(ListCost) AS TotalListCost,
  SUM(BilledCost) AS TotalBilledCost,
  (SUM(EffectiveCost)/SUM(BilledCost))*100 AS EffectiveDiscount
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
  AND ChargeClass != 'Correction'
GROUP BY
  ProviderName,
  BillingAccountId,
  BillingAccountName,
  BillingCurrency,
  ServiceName`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
];
