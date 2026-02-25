import { v10BaseQueries, v12AdditionQueries } from "./shared";
import type { FocusQuery } from "./types";

function requireQuery(queries: FocusQuery[], id: string): FocusQuery {
  const q = queries.find((query) => query.id === id);
  if (q === undefined) throw new Error(`Query not found in catalog: ${id}`);
  return q;
}

const equalQueries: FocusQuery[] = [
  requireQuery(v10BaseQueries, "analyze_costs_of_components_of_a_resource"),
  requireQuery(v10BaseQueries, "analyze_cost_per_compute_service_for_a_subaccount"),
  requireQuery(v10BaseQueries, "analyze_service_costs_by_subaccount"),
  requireQuery(v10BaseQueries, "analyze_tag_coverage"),
  requireQuery(v10BaseQueries, "report_application_cost_month_over_month"),
  requireQuery(v12AdditionQueries, "calculate_unit_economics"),
  requireQuery(v12AdditionQueries, "determine_contracted_savings_by_virtual_currency"),
  requireQuery(v12AdditionQueries, "verify_accuracy_of_provider_invoices_invoice_reconciliation"),
];

const updatedQueries: FocusQuery[] = [
  {
    id: "allocate_multi_currency_charges_per_application",
    name: "Allocate multi-currency charges per application",
    sql: `SELECT
  Tags["ApplicationId"],
  ServiceProviderName,
  BillingAccountId,
  BillingAccountName,
  BillingCurrency,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE
  BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  Tags["ApplicationId"],
  ServiceProviderName,
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
  ServiceProviderName,
  RegionName,
  AvailabilityZone,
  BillingPeriodStart,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE SubAccountId = ?
  AND ChargePeriodStart >= ? AND ChargePeriodEnd < ?
GROUP BY
  ServiceProviderName,
  RegionName,
  AvailabilityZone,
  BillingPeriodStart
ORDER BY ServiceProviderName, RegionName, AvailabilityZone, BillingPeriodStart`,
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
  ServiceProviderName,
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
  ServiceProviderName,
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
    id: "analyze_capacity_reservations_on_compute_costs",
    name: "Analyze capacity reservations on compute costs",
    sql: `SELECT
  CASE
    WHEN CapacityReservationId IS NOT NULL AND CapacityReservationStatus = 'Unused' THEN 'Unused Capacity Reservation'
    WHEN CapacityReservationId IS NOT NULL AND CapacityReservationStatus = 'Used' THEN 'Compute using Capacity Reservation'
    ELSE 'Compute without Capacity Reservation'
  END AS Status,
  ServiceProviderName,
  BillingAccountId,
  SUM(BilledCost) AS TotalBilledCost,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND ServiceCategory = 'Compute'
GROUP BY
  ServiceProviderName,
  BillingAccountId,
  CapacityReservationId,
  CapacityReservationStatus`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_credit_memos",
    name: "Analyze credit memos",
    sql: `SELECT
    ServiceProviderName,
    InvoiceID,
    SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND ChargeCategory = 'Credit'
GROUP BY
    ServiceProviderName,
    InvoiceID`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_effective_cost_by_pricing_currency",
    name: "Analyze effective cost by pricing currency",
    sql: `SELECT
    ServiceProviderName,
    HostProviderName,
    ServiceName,
    PricingCurrency,
    SUM(PricingCurrencyEffectiveCost) AS TotalPricingCurrencyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
    ServiceProviderName,
    HostProviderName,
    ServiceName,
    PricingCurrency`,
    params: [
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
  ServiceProviderName,
  HostProviderName,
  InvoiceIssuerName,
  ROUND(SUM(EffectiveCost),2) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND InvoiceIssuerName != ServiceProviderName
GROUP BY
  ChargePeriodStart,
  ChargePeriodEnd,
  ServiceProviderName,
  HostProviderName,
  InvoiceIssuerName
ORDER BY TotalEffectiveCost ASC`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_purchase_of_virtual_currency",
    name: "Analyze purchase of virtual currency",
    sql: `SELECT
    ServiceProviderName,
    PublisherName,
    ChargeDescription,
    PricingUnit,
    BillingCurrency,
    SUM(PricingQuantity) AS TotalPricingQuantity,
    SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
    AND ChargeCategory = 'Purchase'
    AND PricingUnit = ?
GROUP BY
    ServiceProviderName,
    PublisherName,
    ChargeDescription,
    PricingUnit,
    BillingCurrency`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
      { name: "pricing_unit", type: "String", description: "The pricing unit representing virtual currency" },
    ],
  },
  {
    id: "analyze_resource_costs_by_sku",
    name: "Analyze resource costs by SKU",
    sql: `SELECT
  ServiceProviderName,
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
  ServiceProviderName,
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
  ServiceProviderName,
  RegionId,
  ServiceName,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  ChargePeriodStart,
  ServiceProviderName,
  RegionId,
  ServiceName
ORDER BY ChargePeriodStart, SUM(EffectiveCost) DESC`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_service_costs_month_over_month",
    name: "Analyze service costs month over month",
    sql: `SELECT
  MONTH(ChargePeriodStart),
  ServiceProviderName,
  ServiceName,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodStart < ?
GROUP BY
  MONTH(ChargePeriodStart),
  ServiceProviderName,
  ServiceName
ORDER BY MONTH(ChargePeriodStart), SUM(EffectiveCost) DESC`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_the_different_metered_costs_for_a_particular_sku",
    name: "Analyze the different metered costs for a particular SKU",
    sql: `SELECT
  ServiceProviderName,
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
  ServiceProviderName,
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
    id: "calculate_average_rate_of_a_component_resource",
    name: "Calculate average rate of a component resource",
    sql: `SELECT
    ServiceProviderName,
    ServiceName,
    PricingUnit,
    RegionName,
    JSON_UNQUOTE(JSON_EXTRACT(SkuPriceDetails, '$.InstanceSeries')) AS InstanceSeries,
    SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(SkuPriceDetails, '$.CoreCount')) AS UNSIGNED)) AS TotalCoreCount,
    CASE
        WHEN SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(SkuPriceDetails, '$.CoreCount')) AS UNSIGNED)) > 0
        THEN SUM(EffectiveCost) / SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(SkuPriceDetails, '$.CoreCount')) AS UNSIGNED))
        ELSE NULL
    END AS AverageEffectiveCoreCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND JSON_CONTAINS_PATH(SkuPriceDetails, 'all', '$.CoreCount', '$.InstanceSeries')
GROUP BY
    ServiceProviderName,
    ServiceName,
    PricingUnit,
    RegionName,
    InstanceSeries`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "calculate_consumption_of_virtual_currency_within_a_billing_period",
    name: "Calculate consumption of virtual currency within a billing period",
    sql: `SELECT
    ServiceProviderName,
    SUM(PricingCurrencyEffectiveCost) AS TotalPricingCurrencyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND PricingCurrency = ?
  AND ChargeCategory = 'Usage'
GROUP BY
    ServiceProviderName
ORDER BY TotalPricingCurrencyEffectiveCost DESC
LIMIT 10`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
      { name: "pricing_currency", type: "String", description: "The pricing currency (virtual currency code)" },
    ],
  },
  {
    id: "compare_billed_cost_per_subaccount_to_budget",
    name: "Compare billed cost per subaccount to budget",
    sql: `SELECT
  ServiceProviderName,
  SubAccountId,
  SubAccountName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargeCategory = 'Usage'
  AND ChargePeriodStart >= ? and ChargePeriodEnd <= ?
  AND ServiceProviderName = ?
  AND SubAccountId = ?
GROUP BY
  ServiceProviderName,
  SubAccountId,
  SubAccountName`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (inclusive)" },
      { name: "service_provider_name", type: "String", description: "The service provider name to filter by" },
      { name: "sub_account_id", type: "String", description: "The sub account identifier" },
    ],
  },
  {
    id: "compare_resource_usage_month_over_month",
    name: "Compare resource usage month over month",
    sql: `SELECT
  MONTH(ChargePeriodStart),
  ServiceProviderName,
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
  ServiceProviderName,
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
  ServiceProviderName,
  ContractedUnitPrice,
  PricingQuantity,
  EffectiveCost,
  ((ListCost - EffectiveCost)/ListCost) AS ESROverList,
  ((ContractedUnitPrice - EffectiveCost)/ContractedUnitPrice) AS ESROverContract
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
  ServiceProviderName,
  ServiceName,
  ContractedUnitPrice,
  PricingQuantity,
  EffectiveCost,
  ((ListCost - EffectiveCost)/ListCost) AS ESROverList,
  ((ContractedUnitPrice - EffectiveCost)/ContractedUnitPrice) AS ESROverContract
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "determine_target_of_virtual_currency_usage",
    name: "Determine target of virtual currency usage",
    sql: `SELECT
    ServiceProviderName,
    HostProviderName,
    ServiceName,
    ChargeDescription,
    SUM(PricingCurrencyEffectiveCost) AS TotalPricingCurrencyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND PricingCurrency = ?
GROUP BY
    ServiceProviderName,
    HostProviderName,
    ServiceName,
    ChargeDescription
ORDER BY TotalPricingCurrencyEffectiveCost DESC
LIMIT 10`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
      { name: "pricing_currency", type: "String", description: "The pricing currency (virtual currency code)" },
    ],
  },
  {
    id: "forecast_amortized_costs_month_over_month",
    name: "Forecast amortized costs month over month",
    sql: `SELECT
  MONTH(BillingPeriodStart),
  ServiceProviderName,
  ServiceCategory,
  ServiceName,
  ChargeCategory,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  MONTH(BillingPeriodStart),
  ServiceProviderName,
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
  ServiceProviderName,
  ServiceCategory,
  ServiceName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  MONTH(BillingPeriodStart),
  ServiceProviderName,
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
  ServiceProviderName,
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
  ServiceProviderName,
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
  ServiceProviderName,
  SubAccountId,
  SUM(EffectiveCost) AS DailyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  DATE(ChargePeriodStart) AS StartDay,
  ServiceProviderName,
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
  ServiceProviderName,
  SubAccountId,
  RegionId,
  RegionName,
  SUM(EffectiveCost) AS DailyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  DATE(ChargePeriodStart) AS StartDay,
  ServiceProviderName,
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
  ServiceProviderName,
  SubAccountId,
  RegionId,
  RegionName,
  ServiceName,
  SUM(EffectiveCost) AS DailyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
  DATE(ChargePeriodStart) AS StartDay,
  ServiceProviderName,
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
    id: "identify_sources_of_billed_cost",
    name: "Identify sources of billed cost",
    sql: `SELECT
    ServiceProviderName,
    HostProviderName,
    InvoiceIssuer,
    InvoiceID,
    SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
    ServiceProviderName,
    HostProviderName,
    InvoiceIssuer,
    InvoiceID`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "identify_unused_capacity_reservations",
    name: "Identify unused capacity reservations",
    sql: `SELECT
  ServiceProviderName,
  BillingAccountId,
  CapacityReservationId,
  CapacityReservationStatus,
  SUM(BilledCost) AS TotalBilledCost,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND CapacityReservationStatus = 'Unused'
GROUP BY
  ServiceProviderName,
  BillingAccountId,
  CapacityReservationId,
  CapacityReservationStatus`,
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
  ServiceProviderName,
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
  ServiceProviderName,
  BillingAccountId,
  CommitmentDiscountId,
  CommitmentDiscountType`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "quantify_usage_of_a_component_resource",
    name: "Quantify usage of a component resource",
    sql: `SELECT
    ServiceProviderName,
    ServiceName,
    PricingUnit,
    RegionName,
    JSON_UNQUOTE(JSON_EXTRACT(SkuPriceDetails, '$.InstanceSeries')) AS InstanceSeries,
    SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(SkuPriceDetails, '$.CoreCount')) AS UNSIGNED)) AS TotalCoreCount
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND JSON_CONTAINS_PATH(SkuPriceDetails, 'all', '$.CoreCount', '$.InstanceSeries')
GROUP BY
    ServiceProviderName,
    ServiceName,
    PricingUnit,
    RegionName,
    InstanceSeries`,
    params: [
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
  ServiceProviderName,
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
  ServiceProviderName,
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
  ServiceProviderName,
  BillingAccountId,
  ServiceCategory,
  SubAccountId,
  SubAccountName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
  AND ChargeClass = 'Correction'
GROUP BY
  ServiceProviderName,
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
  ServiceProviderName,
  BillingAccountId,
  ChargeCategory,
  ServiceCategory,
  ServiceName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
  AND ChargeClass = 'Correction'
GROUP BY
  ServiceProviderName,
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
  ServiceProviderName,
  BillingCurrency,
  BillingPeriodStart,
  ServiceCategory,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? and BillingPeriodEnd <= ?
GROUP BY
  ServiceProviderName,
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
    id: "report_costs_by_service_category_and_subcategory",
    name: "Report costs by service category and subcategory",
    sql: `SELECT
  ServiceProviderName,
  BillingCurrency,
  BillingPeriodStart,
  ServiceCategory,
  ServiceSubcategory,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? and BillingPeriodEnd < ?
GROUP BY
  ServiceProviderName,
  BillingCurrency,
  BillingPeriodStart,
  ServiceCategory,
  ServiceSubcategory
ORDER BY TotalBilledCost DESC`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "report_effective_cost_of_compute",
    name: "Report effective cost of compute",
    sql: `SELECT
  CommitmentDiscountType,
  ServiceProviderName,
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
  ServiceProviderName,
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
  ServiceProviderName,
  ServiceName,
  SubAccountId,
  ChargePeriodStart,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
  AND SubAccountId = ?
  AND ProviderName = ?
GROUP BY
  ServiceProviderName,
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
  ServiceProviderName,
  BillingAccountName,
  BillingAccountId,
  BillingCurrency,
  BillingPeriodStart,
  ServiceCategory,
  ServiceName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND ServiceProviderName = ?
GROUP BY
  ServiceProviderName,
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
      { name: "service_provider_name", type: "String", description: "The service provider name to filter by" },
    ],
  },
  {
    id: "report_subaccounts_by_region",
    name: "Report subaccounts by region",
    sql: `SELECT
  ServiceProviderName,
  SubAccountId,
  RegionId,
  RegionName,
  COUNT(1)
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
GROUP BY
  ServiceProviderName,
  SubAccountId,
  RegionId,
  RegionName`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "understand_the_billing_account_or_sub_account_entity",
    name: "Understand the billing account or sub account entity",
    sql: `SELECT DISTINCT
    ServiceProviderName,
    BillingAccountID,
    BillingAccountName,
    BillingAccountType
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "update_budgets_for_each_application",
    name: "Update budgets for each application",
    sql: `SELECT
  ServiceProviderName,
  BillingPeriodStart,
  BillingPeriodEnd,
  Tags["Application"] AS Application,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  ServiceProviderName,
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
  ServiceProviderName,
  BillingPeriodStart,
  BillingPeriodEnd,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  ServiceProviderName,
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
  ServiceProviderName,
  BillingAccountId,
  BillingAccountName,
  BillingCurrency,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  ServiceProviderName,
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
  ServiceProviderName,
  BillingAccountId,
  BillingAccountName,
  BillingCurrency,
  ServiceName,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  ServiceProviderName,
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
  ServiceProviderName,
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
  ServiceProviderName,
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

// 7 new v1.3-only queries
const newQueries: FocusQuery[] = [
  {
    id: "analyze_cost_by_participating_entities",
    name: "Analyze cost by participating entities",
    sql: `SELECT
  BillingPeriodStart,
  BillingPeriodEnd,
  ServiceProviderName,
  InvoiceIssuerName,
  HostProviderName,
  ServiceName,
  BillingCurrency,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? AND BillingPeriodEnd < ?
GROUP BY
  BillingPeriodStart,
  BillingPeriodEnd,
  ServiceProviderName,
  InvoiceIssuerName,
  HostProviderName,
  ServiceName,
  BillingCurrency
ORDER BY TotalBilledCost DESC`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "analyze_total_cost_by_allocated_resource",
    name: "Analyze total cost by allocated resource",
    sql: `SELECT
  AllocatedResourceId,
  AllocatedResourceName,
  ResourceId AS OriginResourceId,
  SUM(EffectiveCost) AS TotalEffectiveCost,
  COUNT(*) AS ChargeCount
FROM focus_data_table
WHERE ChargeCategory = 'Usage'
  AND ChargePeriodStart >= ? AND ChargePeriodEnd <= ?
  AND AllocatedMethodId IS NOT NULL
  AND AllocatedResourceId IS NOT NULL
GROUP BY
  AllocatedResourceId,
  AllocatedResourceName,
  ResourceId
ORDER BY TotalEffectiveCost DESC`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (inclusive)" },
    ],
  },
  {
    id: "identify_resources_with_shared_cost_allocation",
    name: "Identify resources with shared cost allocation",
    sql: `SELECT DISTINCT
  ResourceId,
  ResourceName,
  AllocatedMethodId
FROM focus_data_table
WHERE ChargeCategory = 'Usage'
  AND ChargePeriodStart >= ? AND ChargePeriodEnd <= ?
  AND AllocatedMethodId IS NOT NULL
ORDER BY ResourceId`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (inclusive)" },
    ],
  },
  {
    id: "join_contract_commitment_details_with_usage_charges",
    name: "Join contract commitment details with usage charges",
    sql: `SELECT
  CU.ServiceProviderName,
  JSON_VALUE(CA, '$.ContractCommitmentID') AS ContractCommitmentId,
  CC.ContractCommitmentCategory,
  CC.ContractCommitmentPeriodStart,
  CC.ContractCommitmentPeriodEnd,
  CC.ContractCommitmentCost,
  SUM(CU.EffectiveCost) AS TotalUsageCost,
  SUM(CAST(JSON_VALUE(CA, '$.ContractCommitmentAppliedCost') AS FLOAT64)) AS AppliedCost
FROM focus_data_table CU
CROSS JOIN
  UNNEST(JSON_EXTRACT_ARRAY(CU.ContractApplied, '$.Elements')) AS CA
JOIN contract_commitment CC
  ON JSON_VALUE(CA, '$.ContractCommitmentID') = CC.ContractCommitmentId
WHERE CU.ChargePeriodStart >= ? AND CU.ChargePeriodEnd < ?
GROUP BY
  CU.ServiceProviderName,
  JSON_VALUE(CA, '$.ContractCommitmentID'),
  CC.ContractCommitmentCategory,
  CC.ContractCommitmentPeriodStart,
  CC.ContractCommitmentPeriodEnd,
  CC.ContractCommitmentCost`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "report_on_initial_contract_commitments",
    name: "Report on initial contract commitments",
    sql: `SELECT
  MIN(CU.ChargePeriodStart) AS ChargePeriodStart,
  MAX(CU.ChargePeriodEnd) AS ChargePeriodEnd,
  CU.ServiceProviderName,
  JSON_VALUE(CA, '$.ContractCommitmentID') AS ContractCommitmentId,
  SUM(CAST(JSON_VALUE(CA, '$.ContractCommitmentAppliedCost') AS FLOAT64)) AS ContractCommitmentAppliedCost
FROM focus_data_table CU
CROSS JOIN
  UNNEST(JSON_EXTRACT_ARRAY(CU.ContractApplied, '$.Elements')) AS CA
WHERE JSON_VALUE(CA, '$.ContractCommitmentAppliedCost') IS NOT NULL
  AND ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND ChargeCategory = 'Purchase'
GROUP BY
  CU.ServiceProviderName,
  JSON_VALUE(CA, '$.ContractCommitmentID')`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "track_contract_commitment_burn_down_over_time",
    name: "Track contract commitment burn-down over time",
    sql: `SELECT
  CU.BillingPeriodStart,
  CU.ServiceProviderName,
  CU.BillingAccountId,
  JSON_VALUE(CA, '$.ContractCommitmentID') AS ContractCommitmentId,
  SUM(CAST(JSON_VALUE(CA, '$.ContractCommitmentAppliedCost') AS FLOAT64)) AS AppliedCost,
  SUM(CU.EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table CU
CROSS JOIN
  UNNEST(JSON_EXTRACT_ARRAY(CU.ContractApplied, '$.Elements')) AS CA
WHERE JSON_VALUE(CA, '$.ContractCommitmentID') IS NOT NULL
  AND BillingPeriodStart >= ? AND BillingPeriodStart < ?
GROUP BY
  CU.BillingPeriodStart,
  CU.ServiceProviderName,
  CU.BillingAccountId,
  JSON_VALUE(CA, '$.ContractCommitmentID')
ORDER BY BillingPeriodStart, ContractCommitmentId`,
    params: [
      { name: "billing_period_start", type: "DateTime", description: "Start of the billing period (inclusive)" },
      { name: "billing_period_end", type: "DateTime", description: "End of the billing period (exclusive)" },
    ],
  },
  {
    id: "track_marketplace_purchases_across_providers",
    name: "Track marketplace purchases across providers",
    sql: `SELECT
  ServiceProviderName,
  HostProviderName,
  InvoiceIssuerName,
  ServiceName,
  ChargeCategory,
  SUM(BilledCost) AS TotalBilledCost,
  COUNT(DISTINCT ResourceId) AS ResourceCount
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND ServiceProviderName != HostProviderName
  AND ChargeCategory IN ('Purchase', 'Usage')
GROUP BY
  ServiceProviderName,
  HostProviderName,
  InvoiceIssuerName,
  ServiceName,
  ChargeCategory
ORDER BY TotalBilledCost DESC`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
];

export const v13Queries: FocusQuery[] = [...equalQueries, ...updatedQueries, ...newQueries];
