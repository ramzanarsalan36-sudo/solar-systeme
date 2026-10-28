/**
 * SYSTOMECH ENGINEERS — Authoritative Solar Calculation Engine
 * 
 * Sizing rules, equipment matching, PM Surya Ghar subsidy slabs,
 * and transparent decimal-safe financial calculations.
 */

export interface SizingInput {
  monthlyUnits?: number;
  monthlyBill?: number;
  connectionType: 'residential' | 'commercial' | 'industrial';
  tariffPerUnit?: number; // default ₹8.5/unit
  sanctionLoadKw?: number;
  roofType: 'rcc_flat' | 'tin_shed' | 'tile_roof' | 'elevated_required';
  phase?: 'single' | 'three';
  customKw?: number;
  panelWattage?: number; // e.g. 545Wp
  includeElevatedStructure?: boolean;
}

export interface SolarSystemCalculation {
  systemKw: number;
  recommendedKw: number;
  monthlyUnits: number;
  monthlyBillEstimated: number;
  roofAreaSqFt: number;
  panelCount: number;
  panelWattage: number;
  actualDcCw: number;
  inverterKw: number;
  inverterPhase: 'single' | 'three';
  structureType: string;
  
  // Cost breakdown (₹)
  baseSystemCost: number;
  structureCharge: number;
  netMeteringCharge: number;
  installationCharge: number;
  subTotal: number;
  discount: number;
  taxableAmount: number;
  gstRate: number; // e.g. 13.8% composite
  gstAmount: number;
  totalGrossPrice: number;

  // Subsidy breakdown
  subsidyEligible: boolean;
  subsidyEligibilityStatus: 'verified' | 'unverified' | 'ineligible';
  subsidySchemeName: string;
  subsidyAmount: number;
  netPayableCustomer: number;

  // Performance & ROI
  dailyAverageUnits: number;
  monthlyAverageUnits: number;
  annualGenerationUnits: number;
  annualElectricitySavings: number;
  paybackPeriodYears: number;
  twentyFiveYearSavings: number;
  co2SavedTonsPerYear: number;
  treesEquivalent: number;
}

// PM Surya Ghar: Muft Bijli Yojana Central Government Subsidy Matrix
export function calculateSubsidy(
  systemKw: number,
  connectionType: 'residential' | 'commercial' | 'industrial',
  status: 'verified' | 'unverified' | 'ineligible' = 'unverified'
): {
  eligible: boolean;
  amount: number;
  scheme: string;
  status: 'verified' | 'unverified' | 'ineligible';
  disclaimer: string;
} {
  if (connectionType !== 'residential') {
    return {
      eligible: false,
      amount: 0,
      scheme: 'PM Surya Ghar (Residential Only)',
      status: 'ineligible',
      disclaimer: 'Central Government rooftop subsidy is not applicable for Commercial or Industrial connections.'
    };
  }

  // Official MNRE / PM Surya Ghar guidelines:
  // 1 kW: ₹30,000
  // 2 kW: ₹60,000
  // 3 kW and above: ₹78,000 maximum cap for individual residential households
  let amount = 0;
  if (systemKw >= 3) {
    amount = 78000;
  } else if (systemKw >= 2) {
    amount = 60000;
  } else if (systemKw >= 1) {
    amount = 30000;
  } else {
    amount = Math.round(systemKw * 30000);
  }

  return {
    eligible: true,
    amount,
    scheme: 'PM Surya Ghar: Muft Bijli Yojana',
    status,
    disclaimer: status === 'verified'
      ? 'Subsidy eligible under PM Surya Ghar DBT portal subject to Discom net-metering approval.'
      : 'Estimated subsidy amount. Final eligibility requires verification on National PM Surya Ghar Portal.'
  };
}

export function calculateSolarSystem(input: SizingInput): SolarSystemCalculation {
  const tariff = input.tariffPerUnit && input.tariffPerUnit > 0 ? input.tariffPerUnit : 8.5;
  
  // 1. Determine monthly units consumed
  let units = input.monthlyUnits || 0;
  if (!units && input.monthlyBill && input.monthlyBill > 0) {
    units = Math.round(input.monthlyBill / tariff);
  }
  if (!units || units <= 0) {
    units = 360; // default benchmark ~3kW
  }

  // 2. Sizing calculation: In India, 1 kW solar generates ~120 units/month (~4 kWh/day)
  let recommendedKw = Math.round((units / 120) * 10) / 10;
  if (recommendedKw < 1) recommendedKw = 1;
  // If custom capacity requested
  const systemKw = input.customKw && input.customKw > 0 ? input.customKw : recommendedKw;

  // 3. Panel details
  const panelWattage = input.panelWattage || 545; // 545Wp Mono PERC Bifacial
  const panelCount = Math.ceil((systemKw * 1000) / panelWattage);
  const actualDcCw = Math.round(((panelCount * panelWattage) / 1000) * 100) / 100;

  // 4. Inverter details
  const inverterKw = systemKw <= 3.5 ? 3.3 : systemKw <= 6 ? 5 : systemKw <= 11 ? 10 : Math.ceil(systemKw);
  const inverterPhase: 'single' | 'three' = input.phase ? input.phase : systemKw > 3.5 ? 'three' : 'single';

  // 5. Roof Area (~85 sq.ft per kW)
  const roofAreaSqFt = Math.round(systemKw * 85);

  // 6. Pricing Rules
  // Base EPC Rate per kW (Includes panels, inverter, DCDB, ACDB, cables, earthing, lightning arrestor)
  // Scale rate: smaller systems have slightly higher cost per kW
  let baseRatePerKw = 49000;
  if (systemKw <= 2) baseRatePerKw = 53000;
  else if (systemKw <= 4) baseRatePerKw = 49000;
  else if (systemKw <= 10) baseRatePerKw = 46000;
  else baseRatePerKw = 43000;

  const baseSystemCost = Math.round(systemKw * baseRatePerKw);
  const structureCharge = input.roofType === 'elevated_required' || input.includeElevatedStructure
    ? Math.round(systemKw * 7500)
    : 0;
  const netMeteringCharge = 7500; // Discom liaison & testing fee
  const installationCharge = Math.round(systemKw * 4000); // Skilled labor, civil grouting, electrical commissioning

  const subTotal = baseSystemCost + structureCharge + netMeteringCharge + installationCharge;
  const discount = 0; // Configurable discount
  const taxableAmount = subTotal - discount;

  // Composite GST for Solar Power Systems in India: 13.8% (effective rate)
  const gstRate = 13.8;
  const gstAmount = Math.round((taxableAmount * gstRate) / 100);
  const totalGrossPrice = taxableAmount + gstAmount;

  // 7. Subsidy calculation
  const subsidyData = calculateSubsidy(systemKw, input.connectionType, 'unverified');
  const subsidyAmount = subsidyData.amount;
  const netPayableCustomer = Math.max(0, totalGrossPrice - subsidyAmount);

  // 8. Financial Return & Generation
  const dailyAverageUnits = Math.round(systemKw * 4.2 * 10) / 10;
  const monthlyAverageUnits = Math.round(dailyAverageUnits * 30);
  const annualGenerationUnits = Math.round(systemKw * 1480);
  const annualElectricitySavings = Math.round(annualGenerationUnits * tariff);
  const paybackPeriodYears = annualElectricitySavings > 0
    ? Math.round((netPayableCustomer / annualElectricitySavings) * 10) / 10
    : 0;

  // 25 Years Lifetime savings (factoring 0.5% yearly degradation & 3% tariff increase)
  let lifetimeSavings = 0;
  let currentYearGen = annualGenerationUnits;
  let currentTariff = tariff;
  for (let year = 1; year <= 25; year++) {
    lifetimeSavings += currentYearGen * currentTariff;
    currentYearGen *= 0.995;
    currentTariff *= 1.03;
  }
  const twentyFiveYearSavings = Math.round(lifetimeSavings);

  // Environmental
  const co2SavedTonsPerYear = Math.round((annualGenerationUnits * 0.82) / 1000 * 10) / 10;
  const treesEquivalent = Math.round(systemKw * 42);

  const structureType = input.roofType === 'elevated_required'
    ? 'Super Elevated GI Structure (8-10 ft clearance)'
    : input.roofType === 'tin_shed'
    ? 'Mini-Rail / Profile Sheet Clamping Kit'
    : 'Standard Pre-Galvanized HDG RCC High-Tilt Leg Structure';

  return {
    systemKw,
    recommendedKw,
    monthlyUnits: units,
    monthlyBillEstimated: Math.round(units * tariff),
    roofAreaSqFt,
    panelCount,
    panelWattage,
    actualDcCw,
    inverterKw,
    inverterPhase,
    structureType,
    baseSystemCost,
    structureCharge,
    netMeteringCharge,
    installationCharge,
    subTotal,
    discount,
    taxableAmount,
    gstRate,
    gstAmount,
    totalGrossPrice,
    subsidyEligible: subsidyData.eligible,
    subsidyEligibilityStatus: subsidyData.status,
    subsidySchemeName: subsidyData.scheme,
    subsidyAmount,
    netPayableCustomer,
    dailyAverageUnits,
    monthlyAverageUnits,
    annualGenerationUnits,
    annualElectricitySavings,
    paybackPeriodYears,
    twentyFiveYearSavings,
    co2SavedTonsPerYear,
    treesEquivalent,
  };
}

export function formatIndianCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
