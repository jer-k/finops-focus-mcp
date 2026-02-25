import type { FocusQuery } from "../types";

export const v12AdditionQueries: FocusQuery[] = [
  {
    id: "analyze_credit_memos",
    name: "Analyze credit memos",
    sql: `SELECT
    ProviderName,
    InvoiceID,
    SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND ChargeCategory = 'Credit'
GROUP BY
    ProviderName,
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
    ProviderName,
    PublisherName,
    ServiceName,
    PricingCurrency,
    SUM(PricingCurrencyEffectiveCost) AS TotalPricingCurrencyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
    ProviderName,
    PublisherName,
    ServiceName,
    PricingCurrency`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_purchase_of_virtual_currency",
    name: "Analyze purchase of virtual currency",
    sql: `SELECT
    ProviderName,
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
    ProviderName,
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
    id: "calculate_average_rate_of_a_component_resource",
    name: "Calculate average rate of a component resource",
    sql: `SELECT
    ProviderName,
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
    ProviderName,
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
    ProviderName,
    SUM(PricingCurrencyEffectiveCost) AS TotalPricingCurrencyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND PricingCurrency = ?
  AND ChargeCategory = 'Usage'
GROUP BY
    ProviderName
ORDER BY TotalPricingCurrencyEffectiveCost DESC
LIMIT 10`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
      { name: "pricing_currency", type: "String", description: "The pricing currency (virtual currency code)" },
    ],
  },
  {
    id: "calculate_unit_economics",
    name: "Calculate unit economics",
    sql: `SELECT
    CAST(ChargePeriodStart AS DATE) AS ChargePeriodDate,
    SUM(BilledCost) / NULLIF(SUM(CAST(ConsumedQuantity AS DECIMAL(10, 2))), 0) AS CostPerGB
FROM focus_data_table
WHERE
    ChargeDescription LIKE '%transfer%'
    AND ConsumedUnit = 'GB'
GROUP BY
    CAST(ChargePeriodStart AS DATE)
ORDER BY
    ChargePeriodDate ASC;`,
    params: [],
  },
  {
    id: "determine_contracted_savings_by_virtual_currency",
    name: "Determine contracted savings by virtual currency",
    sql: `SELECT
    ServiceName,
    ServiceSubcategory,
    ChargeDescription,
    BillingCurrency,
    PricingCurrency,
    SUM(PricingCurrencyListUnitPrice - PricingCurrencyContractedUnitPrice) AS ContractedSavingsInPricingCurrency,
    SUM(ListUnitPrice - ContractedUnitPrice) AS ContractedSavingsInBillingCurrency
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND PricingCurrencyListUnitPrice > PricingCurrencyContractedUnitPrice
GROUP BY
    ServiceName,
    ServiceSubcategory,
    ChargeDescription,
    BillingCurrency,
    PricingCurrency`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "determine_target_of_virtual_currency_usage",
    name: "Determine target of virtual currency usage",
    sql: `SELECT
    ProviderName,
    PublisherName,
    ServiceName,
    ChargeDescription,
    SUM(PricingCurrencyEffectiveCost) AS TotalPricingCurrencyEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND PricingCurrency = ?
GROUP BY
    ProviderName,
    PublisherName,
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
    id: "identify_sources_of_billed_cost",
    name: "Identify sources of billed cost",
    sql: `SELECT
    ProviderName,
    PublisherName,
    InvoiceIssuer,
    InvoiceID,
    SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
    ProviderName,
    PublisherName,
    InvoiceIssuer,
    InvoiceID`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "quantify_usage_of_a_component_resource",
    name: "Quantify usage of a component resource",
    sql: `SELECT
    ProviderName,
    ServiceName,
    PricingUnit,
    RegionName,
    JSON_UNQUOTE(JSON_EXTRACT(SkuPriceDetails, '$.InstanceSeries')) AS InstanceSeries,
    SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(SkuPriceDetails, '$.CoreCount')) AS UNSIGNED)) AS TotalCoreCount
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
  AND JSON_CONTAINS_PATH(SkuPriceDetails, 'all', '$.CoreCount', '$.InstanceSeries')
GROUP BY
    ProviderName,
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
    id: "understand_the_billing_account_or_sub_account_entity",
    name: "Understand the billing account or sub account entity",
    sql: `SELECT DISTINCT
    ProviderName,
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
    id: "verify_accuracy_of_provider_invoices_invoice_reconciliation",
    name: "Verify accuracy of provider invoices (invoice reconciliation)",
    sql: `SELECT
    InvoiceIssuer,
    InvoiceID,
    SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? and ChargePeriodEnd < ?
GROUP BY
    InvoiceIssuer,
    InvoiceID`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
];
