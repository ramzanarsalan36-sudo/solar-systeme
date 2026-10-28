'use client';

import React, { useState, useMemo } from 'react';
import { calculateSolarSystem, formatIndianCurrency } from '@/lib/solar-calc';
import { crmStorage } from '@/lib/storage';
import { Lead, Quotation } from '@/types/crm';
import confetti from 'canvas-confetti';
import {
  X,
  Zap,
  Calculator,
  Sun,
  ShieldCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Cpu,
  Layers,
  Sparkles,
  TreePine,
  DollarSign,
  Share2,
} from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLead?: Lead | null;
  onQuoteCreated: (quote: Quotation) => void;
}

export function QuoteModal({ isOpen, onClose, initialLead, onQuoteCreated }: QuoteModalProps) {
  // Wizard Step State (1: Customer & Bill, 2: Auto-Sizing, 3: Components, 4: PM Surya Ghar Financials)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Customer & Consumption
  const [customerName, setCustomerName] = useState(initialLead?.name || '');
  const [customerPhone, setCustomerPhone] = useState(initialLead?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(initialLead?.email || '');
  const [siteAddress, setSiteAddress] = useState(initialLead?.address || '');
  const [city, setCity] = useState(initialLead?.city || 'Pune');
  const [discom, setDiscom] = useState(initialLead?.discom || 'MSEDCL (Maharashtra)');
  const [consumerNumber, setConsumerNumber] = useState(initialLead?.consumerNumber || '');
  const [monthlyBill, setMonthlyBill] = useState(initialLead?.monthlyBill || 4500);
  const [monthlyUnits, setMonthlyUnits] = useState(initialLead?.monthlyUnits || 500);
  const [connectionType, setConnectionType] = useState<'residential' | 'commercial' | 'industrial'>(
    (initialLead?.connectionType === 'agricultural' ? 'commercial' : initialLead?.connectionType) || 'residential'
  );
  const [phase, setPhase] = useState<'single' | 'three'>(initialLead?.phase || 'single');
  const [roofType, setRoofType] = useState<'rcc_flat' | 'tin_shed' | 'tile_roof' | 'elevated_required'>(
    initialLead?.roofType || 'rcc_flat'
  );
  const [ocrSuccess, setOcrSuccess] = useState<boolean>(false);

  // Step 2: Sizing & Capacity Override
  const [customKw, setCustomKw] = useState<number | undefined>(undefined);

  // Step 3: Equipment Selection
  const [selectedPanelType, setSelectedPanelType] = useState<'mono_perc' | 'topcon'>('mono_perc');
  const [selectedInverterType, setSelectedInverterType] = useState<'on_grid' | 'hybrid'>('on_grid');

  // React to initialLead prop changes
  React.useEffect(() => {
    if (initialLead) {
      setCustomerName(initialLead.name || '');
      setCustomerPhone(initialLead.phone || '');
      setCustomerEmail(initialLead.email || '');
      setSiteAddress(initialLead.address || '');
      setCity(initialLead.city || 'Pune');
      setDiscom(initialLead.discom || 'MSEDCL (Maharashtra)');
      setConsumerNumber(initialLead.consumerNumber || '');
      setMonthlyBill(initialLead.monthlyBill || 4500);
      setMonthlyUnits(initialLead.monthlyUnits || Math.round((initialLead.monthlyBill || 4500) / 8.5));
      setCustomKw(initialLead.estimatedKw || undefined);
    }
  }, [initialLead]);

  // Bill OCR simulation helper
  const handleSimulateOcr = () => {
    setCustomerName('Mahesh Deshmukh');
    setCustomerPhone('+91 98230 45678');
    setCustomerEmail('mahesh.deshmukh@gmail.com');
    setSiteAddress('Plot 42, Baner-Pashan Link Road');
    setCity('Pune');
    setConsumerNumber('028549102934');
    setMonthlyBill(4850);
    setMonthlyUnits(520);
    setDiscom('MSEDCL (Maharashtra)');
    setConnectionType('residential');
    setPhase('single');
    setRoofType('rcc_flat');
    setOcrSuccess(true);
  };

  // Perform calculations reactively
  const calculation = useMemo(() => {
    return calculateSolarSystem({
      monthlyBill: Number(monthlyBill),
      monthlyUnits: Number(monthlyUnits),
      connectionType,
      phase,
      roofType,
      customKw: customKw ? Number(customKw) : undefined,
    });
  }, [monthlyBill, monthlyUnits, connectionType, phase, roofType, customKw]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setCurrentStep(1);
      alert('Please provide Customer Name and Phone Number');
      return;
    }

    const currentUser = crmStorage.getCurrentUser();
    const products = crmStorage.getProducts();

    // Line items based on selection
    const panelProduct =
      selectedPanelType === 'topcon'
        ? products.find((p) => p.sku === 'ADN-550-TOP') || products[0]
        : products.find((p) => p.sku === 'WAR-545-BIF') || products[0];

    const inverterProduct =
      selectedInverterType === 'hybrid'
        ? products.find((p) => p.brand === 'Havells') || products[3]
        : products.find((p) => p.category === 'inverter') || products[3];

    const structureProduct = products.find((p) => p.category === 'structure') || products[6];

    const newQuote = crmStorage.addQuotation({
      leadId: initialLead?.id,
      customerName,
      customerPhone,
      customerEmail,
      siteAddress: siteAddress || 'Site Address TBD',
      city: city || 'Pune',
      discom,
      consumerNumber,
      sanctionLoadKw: 5,
      monthlyUnits: calculation.monthlyUnits,
      systemKw: calculation.systemKw,
      phase: calculation.inverterPhase,
      roofType: calculation.structureType,
      panelModel: panelProduct.name,
      panelWattage: 545,
      panelQty: calculation.panelCount,
      inverterModel: inverterProduct.name,
      inverterQty: 1,
      structureType: calculation.structureType,
      lineItems: [
        {
          id: `li-1`,
          productId: panelProduct.id,
          productName: panelProduct.name,
          category: 'panel',
          spec: panelProduct.spec,
          quantity: calculation.panelCount,
          uom: panelProduct.uom,
          unitPrice: panelProduct.price,
          lineTotal: panelProduct.price * calculation.panelCount,
        },
        {
          id: `li-2`,
          productId: inverterProduct.id,
          productName: inverterProduct.name,
          category: 'inverter',
          spec: inverterProduct.spec,
          quantity: 1,
          uom: inverterProduct.uom,
          unitPrice: inverterProduct.price,
          lineTotal: inverterProduct.price,
        },
        {
          id: `li-3`,
          productId: structureProduct.id,
          productName: structureProduct.name,
          category: 'structure',
          spec: structureProduct.spec,
          quantity: 1,
          uom: structureProduct.uom,
          unitPrice: structureProduct.price,
          lineTotal: structureProduct.price,
        },
      ],
      baseSystemCost: calculation.baseSystemCost,
      structureElevatedCharge: calculation.structureCharge,
      netMeteringCharge: calculation.netMeteringCharge,
      installationCharge: calculation.installationCharge,
      discount: calculation.discount,
      taxableAmount: calculation.taxableAmount,
      gstRate: calculation.gstRate,
      gstAmount: calculation.gstAmount,
      totalGrossPrice: calculation.totalGrossPrice,
      subsidyEligible: calculation.subsidyEligible,
      subsidyEligibilityStatus: calculation.subsidyEligibilityStatus,
      subsidySchemeName: calculation.subsidySchemeName,
      subsidyAmount: calculation.subsidyAmount,
      netPayableCustomer: calculation.netPayableCustomer,
      annualGenerationUnits: calculation.annualGenerationUnits,
      annualElectricitySavings: calculation.annualElectricitySavings,
      paybackYears: calculation.paybackPeriodYears,
      twentyFiveYearSavings: calculation.twentyFiveYearSavings,
      status: 'draft',
      validityDays: 15,
      paymentTerms: '20% Advance Booking, 60% On Material Dispatch, 20% Post Net-Meter Commissioning',
      notes: 'Official Systomech Proposal & PM Surya Ghar Subsidy DBT Estimation.',
      createdBy: currentUser.id,
      createdByName: currentUser.name,
    });

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    onQuoteCreated(newQuote);
    onClose();
  };

  const stepsList = [
    { num: 1, title: 'Customer & Consumption', icon: FileText },
    { num: 2, title: 'Smart Auto-Sizing', icon: Zap },
    { num: 3, title: 'Component Selection', icon: Cpu },
    { num: 4, title: 'PM Surya Ghar Financials', icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6 flex flex-col">
        {/* Modal Topbar */}
        <div className="px-6 py-4 bg-[#0A1128] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-[#0A1128] flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Calculator className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">The 2-Minute Bill-to-Quote Wizard</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-400 text-[#0A1128]">
                  OpenSolar Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                PM Surya Ghar Muft Bijli Yojana &bull; Instant DISCOM Sizing &bull; Equipment Matching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Interactive Navigation Tabs */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[560px]">
            {stepsList.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <React.Fragment key={step.num}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.num)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#0A1128] text-white shadow-sm'
                        : isPast
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                        isActive
                          ? 'bg-amber-400 text-[#0A1128]'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPast ? '✓' : step.num}
                    </span>
                    <span>{step.title}</span>
                  </button>

                  {idx < stepsList.length - 1 && (
                    <div className="h-0.5 w-6 bg-slate-200 mx-1 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* STEP 1: CUSTOMER & CONSUMPTION */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Bill Upload & OCR Simulation Box */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-400/20 text-amber-800 rounded-xl">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">Electricity Bill Document Extraction (OCR)</p>
                    <p className="text-[11px] text-amber-800">
                      Upload an MSEDCL or Discom electricity bill, or simulate instant parsing to auto-populate units &amp; load.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateOcr}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0A1128] hover:bg-[#15234A] text-amber-400 transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate Bill OCR Extract</span>
                </button>
              </div>

              {ocrSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Bill OCR extracted successfully: Consumer #028549102934 &bull; 520 Units/mo &bull; Mahesh Deshmukh (Pune)
                  </span>
                </div>
              )}

              {/* Consumption Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Average Monthly Electricity Bill (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={monthlyBill}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMonthlyBill(val);
                        setMonthlyUnits(Math.round(val / 8.5));
                      }}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-semibold"
                      placeholder="e.g. 4500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Units Consumed (kWh) *
                  </label>
                  <input
                    type="number"
                    value={monthlyUnits}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMonthlyUnits(val);
                      setMonthlyBill(Math.round(val * 8.5));
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-semibold"
                    placeholder="e.g. 500"
                    required
                  />
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Rajesh Sharma"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-mono"
                    placeholder="+91 98201 12345"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Installation Site Address</label>
                  <input
                    type="text"
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Plot 14, Sunrise Enclave, Aundh"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / District</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Pune / Nashik"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SMART AUTO-SIZING ENGINE */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Formula & Engine Explainability Banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    OpenSolar Auto-Sizing Formula Applied
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    Recommended kW = Math.ceil(Monthly Units / 120) = {calculation.recommendedKw} kW
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Calculated based on standard Indian solar irradiance of ~4 kWh/kWp/day (~120 Units/kW/month).
                </p>
              </div>

              {/* The 4 Metrics Cards Required by Prompt */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border-2 border-amber-400 shadow-sm text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Recommended System
                  </span>
                  <span className="text-2xl font-black text-slate-900 block my-1">
                    {calculation.systemKw} kW
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                    {calculation.panelCount}x 545W Panels
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Monthly Generation
                  </span>
                  <span className="text-2xl font-black text-emerald-700 block my-1">
                    ~{calculation.monthlyAverageUnits}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Units (kWh) / Month</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Required Roof Area
                  </span>
                  <span className="text-2xl font-black text-slate-900 block my-1">
                    ~{calculation.roofAreaSqFt}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Square Feet</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Annual CO₂ Savings
                  </span>
                  <span className="text-2xl font-black text-emerald-600 block my-1">
                    {calculation.co2SavedTonsPerYear}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Tons / Year (~{calculation.treesEquivalent} Trees)</span>
                </div>
              </div>

              {/* Capacity Fine-tuning Slider / Input */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Fine-tune Capacity (kW) <span className="text-slate-400 font-normal">(Optional Override)</span>
                  </label>
                  <span className="text-sm font-extrabold text-[#0A1128] font-mono">
                    {calculation.systemKw} kW
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={customKw || calculation.recommendedKw}
                  onChange={(e) => setCustomKw(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 kW</span>
                  <span>3 kW (Optimal Surya Ghar)</span>
                  <span>5 kW</span>
                  <span>10 kW</span>
                  <span>15 kW</span>
                </div>
              </div>

              {/* Roof Mounting Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rooftop Mounting Type</label>
                  <select
                    value={roofType}
                    onChange={(e) => setRoofType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="rcc_flat">RCC Flat Concrete (Standard Tilt)</option>
                    <option value="elevated_required">Elevated Gazebo Structure (8-10 ft Clear)</option>
                    <option value="tin_shed">Industrial Tin Shed / Metal Purlin</option>
                    <option value="tile_roof">Mangalore / Clay Tile Roof</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Electrical Connection Phase</label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="single">Single Phase (1-Phase 230V)</option>
                    <option value="three">Three Phase (3-Phase 415V)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: COMPONENT SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Select Solar Panel Technology
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mono PERC */}
                  <div
                    onClick={() => setSelectedPanelType('mono_perc')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedPanelType === 'mono_perc'
                        ? 'border-[#0A1128] bg-slate-50/80 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=160&q=80"
                        alt="Mono PERC"
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">Mono PERC Bifacial</span>
                          <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-amber-100 text-amber-900">
                            Most Popular
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">Waaree / Tata Power Solar &bull; 545Wp</p>
                      </div>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1 mt-2 border-t border-slate-200/70 pt-2">
                      <li>&bull; 21.3% Module Efficiency, ALMM Tier-1</li>
                      <li>&bull; 25 Years Performance Guarantee</li>
                    </ul>
                  </div>

                  {/* N-Type TOPCon */}
                  <div
                    onClick={() => setSelectedPanelType('topcon')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedPanelType === 'topcon'
                        ? 'border-[#0A1128] bg-slate-50/80 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src="https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=160&q=80"
                        alt="N-Type TOPCon"
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">N-Type TOPCon</span>
                          <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-emerald-100 text-emerald-900">
                            Highest Yield
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">Adani Solar / Premier &bull; 550Wp</p>
                      </div>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1 mt-2 border-t border-slate-200/70 pt-2">
                      <li>&bull; 22.2% Module Efficiency, Low Light Performance</li>
                      <li>&bull; Minimal Temperature Coefficient Loss</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-500" />
                  Select Inverter Architecture
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* On-Grid Inverter */}
                  <div
                    onClick={() => setSelectedInverterType('on_grid')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedInverterType === 'on_grid'
                        ? 'border-[#0A1128] bg-slate-50/80 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src="https://images.unsplash.com/photo-1548611716-ad982b6b553e?auto=format&fit=crop&w=160&q=80"
                        alt="On-Grid Inverter"
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">Grid-Tied String Inverter</span>
                        <p className="text-[11px] text-slate-500">Growatt / Solis with WiFi Cloud Logger</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2 border-t border-slate-200/70 pt-2">
                      Direct Discom Net-Metering with 98.3% max conversion efficiency. 10 years standard warranty.
                    </p>
                  </div>

                  {/* Hybrid Inverter */}
                  <div
                    onClick={() => setSelectedInverterType('hybrid')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedInverterType === 'hybrid'
                        ? 'border-[#0A1128] bg-slate-50/80 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=160&q=80"
                        alt="Hybrid Inverter"
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">Smart Hybrid Inverter</span>
                        <p className="text-[11px] text-slate-500">Havells / Deye (Battery Ready)</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2 border-t border-slate-200/70 pt-2">
                      Zero power outage backup capability + Discom net metering sync.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PM SURYA GHAR MUFT BIJLI YOJANA FINANCIALS */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Subsidy Slab Rules Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    PM Surya Ghar Muft Bijli Yojana Central Subsidy
                  </span>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full">
                    Direct DBT Slabs
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                  <div className="p-2 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-500 block text-[10px]">1 kW</span>
                    <strong className="text-emerald-800">₹30,000</strong>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-500 block text-[10px]">2 kW</span>
                    <strong className="text-emerald-800">₹60,000</strong>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-500 block text-[10px]">3 kW and above</span>
                    <strong className="text-emerald-800">₹78,000 (Max Cap)</strong>
                  </div>
                </div>
              </div>

              {/* Live Cost Card */}
              <div className="p-5 bg-gradient-to-br from-[#0A1128] to-[#1E293B] text-white rounded-2xl shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                  <span className="text-slate-300">Total System Gross Cost ({calculation.systemKw} kW):</span>
                  <span className="font-bold text-base text-white">
                    {formatIndianCurrency(calculation.totalGrossPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span>Less: PM Surya Ghar Central Subsidy</span>
                  </span>
                  <span className="font-bold text-base text-emerald-400">
                    -{formatIndianCurrency(calculation.subsidyAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-amber-400 block">
                      NET CUSTOMER PAYABLE AMOUNT
                    </span>
                    <span className="text-[11px] text-slate-300">Turnkey EPC with Discom Net-Meter</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">
                    {formatIndianCurrency(calculation.netPayableCustomer)}
                  </span>
                </div>
              </div>

              {/* Payback & 5-Year Savings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Annual Electricity Savings
                  </span>
                  <span className="text-lg font-black text-emerald-700 block my-0.5">
                    {formatIndianCurrency(calculation.annualElectricitySavings)}
                  </span>
                  <span className="text-[10px] text-slate-500">Per Year</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Simple Payback Period
                  </span>
                  <span className="text-lg font-black text-slate-900 block my-0.5">
                    ~{calculation.paybackPeriodYears} Years
                  </span>
                  <span className="text-[10px] text-slate-500">100% Capital Recovered</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    5-Year Cumulative Savings
                  </span>
                  <span className="text-lg font-black text-emerald-700 block my-0.5">
                    {formatIndianCurrency(calculation.annualElectricitySavings * 5)}
                  </span>
                  <span className="text-[10px] text-slate-500">Pure Financial Return</span>
                </div>
              </div>

              {/* Legal Disclaimer Note */}
              <p className="text-[10px] text-slate-500 italic leading-relaxed bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                <strong>Mandatory Legal Disclaimer:</strong> Subsidy amounts shown are estimates calculated under PM Surya Ghar Muft Bijli Yojana guidelines. Final approval, net metering, and DBT disbursement are subject to DISCOM inspection and National Portal approval.
              </p>
            </div>
          )}

          {/* Wizard Footer Navigation Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#0A1128] hover:bg-[#15234A] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-[#0A1128] bg-amber-400 hover:bg-amber-500 rounded-xl transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Official Branded Proposal</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
