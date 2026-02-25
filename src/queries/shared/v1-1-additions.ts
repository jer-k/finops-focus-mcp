import type { FocusQuery } from "../types";

export const v11AdditionQueries: FocusQuery[] = [
  {
    id: "analyze_capacity_reservations_on_compute_costs",
    name: "Analyze capacity reservations on compute costs",
    sql: `SELECT
  CASE
    WHEN CapacityReservationId IS NOT NULL AND CapacityReservationStatus = 'Unused' THEN 'Unused Capacity Reservation'
    WHEN CapacityReservationId IS NOT NULL AND CapacityReservationStatus = 'Used' THEN 'Compute using Capacity Reservation'
    ELSE 'Compute without Capacity Reservation'
  END AS Status,
  ProviderName,
  BillingAccountId,
  SUM(BilledCost) AS TotalBilledCost,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND ServiceCategory = 'Compute'
GROUP BY
  ProviderName,
  BillingAccountId,
  CapacityReservationId,
  CapacityReservationStatus`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "analyze_the_different_metered_costs_for_a_particular_sku",
    name: "Analyze the different metered costs for a particular SKU",
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
    id: "identify_unused_capacity_reservations",
    name: "Identify unused capacity reservations",
    sql: `SELECT
  ProviderName,
  BillingAccountId,
  CapacityReservationId,
  CapacityReservationStatus,
  SUM(BilledCost) AS TotalBilledCost,
  SUM(EffectiveCost) AS TotalEffectiveCost
FROM focus_data_table
WHERE ChargePeriodStart >= ? AND ChargePeriodEnd < ?
  AND CapacityReservationStatus = 'Unused'
GROUP BY
  ProviderName,
  BillingAccountId,
  CapacityReservationId,
  CapacityReservationStatus`,
    params: [
      { name: "charge_period_start", type: "DateTime", description: "Start of the charge period (inclusive)" },
      { name: "charge_period_end", type: "DateTime", description: "End of the charge period (exclusive)" },
    ],
  },
  {
    id: "report_costs_by_service_category_and_subcategory",
    name: "Report costs by service category and subcategory",
    sql: `SELECT
  ProviderName,
  BillingCurrency,
  BillingPeriodStart,
  ServiceCategory,
  ServiceSubcategory,
  SUM(BilledCost) AS TotalBilledCost
FROM focus_data_table
WHERE BillingPeriodStart >= ? and BillingPeriodEnd < ?
GROUP BY
  ProviderName,
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
];
