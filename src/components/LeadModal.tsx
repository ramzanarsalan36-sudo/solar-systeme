'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { crmStorage } from '@/lib/storage';
import { soundManager } from '@/lib/sound';
import { Lead, LeadSource } from '@/types/crm';
import { calculateSolarSystem, formatIndianCurrency } from '@/lib/solar-calc';
import {
  X,
  UserPlus,
  Phone,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Zap,
  MapPin,
  Building,
  Sparkles,
  Info,
  ArrowLeft,
} from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (lead: Lead) => void;
}

export function LeadModal({ isOpen, onClose, onLeadCreated }: LeadModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [state] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('');
  const [discom, setDiscom] = useState('MSEDCL');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [sanctionLoadKw, setSanctionLoadKw] = useState<string>('5');
  const [monthlyBill, setMonthlyBill] = useState<string>('4000');
  const [connectionType, setConnectionType] = useState<'residential' | 'commercial' | 'industrial'>('residential');
  const [phase, setPhase] = useState<'single' | 'three'>('single');
  const [roofType, setRoofType] = useState<'rcc_flat' | 'tin_shed' | 'tile_roof' | 'elevated_required'>('rcc_flat');
  const [source, setSource] = useState<LeadSource>('call');
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  React.useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setNextFollowUpDate(d.toISOString().split('T')[0]);
  }, []);

  const billNumber = parseFloat(monthlyBill) || 0;
  const liveEstimate = useMemo(() => {
    if (billNumber <= 0) return null;
    return calculateSolarSystem({
      monthlyBill: billNumber,
      connectionType,
      roofType,
    });
  }, [billNumber, connectionType, roofType]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        soundManager.playSoftClick();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReturn = () => {
    soundManager.playSoftClick();
    onClose();
  };

  const existingLeads = crmStorage.getLeads();
  const cleanCurrentPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const duplicateLead =
    cleanCurrentPhone.length === 10
      ? existingLeads.find((l) => l.phone.replace(/[^0-9]/g, '').slice(-10) === cleanCurrentPhone)
      : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please fill in Customer Name and Contact Phone Number');
      return;
    }

    const currentUser = crmStorage.getCurrentUser();
    const bill = parseFloat(monthlyBill) || 3000;
    const monthlyUnits = Math.round(bill / 8.5);
    const estimatedKw = liveEstimate ? liveEstimate.recommendedKw : Math.max(1, Math.round((monthlyUnits / 120) * 10) / 10);

    const newLead = crmStorage.addLead({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || 'Address to be verified during site survey',
      city: city.trim() || 'Pune',
      state,
      pinCode: pinCode.trim() || undefined,
      discom,
      consumerNumber: consumerNumber.trim() || undefined,
      sanctionLoadKw: parseFloat(sanctionLoadKw) || 5,
      monthlyBill: bill,
      monthlyUnits,
      connectionType,
      phase,
      roofType,
      source,
      status: 'new',
      assignedTo: currentUser.id,
      assignedToName: currentUser.name,
      estimatedKw,
      notes: notes.trim(),
    });

    if (nextFollowUpDate) {
      crmStorage.addFollowUp({
        leadId: newLead.id,
        leadName: newLead.name,
        contactMethod: source === 'whatsapp' ? 'whatsapp' : 'call',
        interactionSummary: `Initial inquiry captured via ${source}. Customer interested in solar for ₹${bill.toLocaleString('en-IN')}/mo bill.`,
        outcome: 'interested',
        nextAction: 'Introductory phone call to explain solar sizing & PM Surya Ghar subsidy scheme',
        nextFollowUpDate: `${nextFollowUpDate}T10:00:00Z`,
        isDone: false,
        performedBy: currentUser.id,
        performedByName: currentUser.name,
      });
    }

    // Play pleasant Paytm confirmation tone
    soundManager.playSuccessTone();

    onLeadCreated(newLead);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleReturn();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#002E6E]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 no-print animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-[#E1EBF5] w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        {/* Standardized Modal Header with Back / Return option */}
        <div className="px-5 py-3.5 border-b border-[#E1EBF5] flex items-center justify-between shrink-0 bg-[#F4F7FC]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReturn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#002E6E] hover:text-[#00BAF2] bg-white hover:bg-[#E8F8FE] border border-[#E1EBF5] shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Cancel & Return (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00BAF2]" />
              <span>Back</span>
              <span className="text-[10px] text-[#5B6E88] font-mono hidden sm:inline">(Esc)</span>
            </button>

            <div className="h-5 w-px bg-[#E1EBF5] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E8F8FE] border border-[#BCE8FC] text-[#00BAF2] flex items-center justify-center font-bold shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#002E6E] tracking-tight leading-snug">
                  New Solar Lead Intake
                </h2>
                <p className="text-[11px] text-[#5B6E88] font-normal">
                  Capture customer details, bill &amp; schedule follow-up
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReturn}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5B6E88] hover:text-[#002E6E] hover:bg-white transition-colors cursor-pointer"
            title="Close (Esc)"
            aria-label="Close"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form id="new-lead-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Duplicate Phone Notice */}
          {duplicateLead && (
            <div className="p-3.5 bg-[#FFF8EA] border border-[#FFE1A8] rounded-xl text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#FFA400] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-amber-950">Duplicate Phone Number Detected</p>
                <p className="text-amber-800 mt-0.5">
                  A lead with phone <strong>{duplicateLead.phone}</strong> already exists ({duplicateLead.name} - {duplicateLead.status.toUpperCase()}). Please verify if this is a repeat inquiry.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Customer Identification */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#002E6E] flex items-center gap-1.5">
              <span>1. Customer &amp; Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">
                  Customer Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] placeholder:text-slate-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">
                  Phone Number (10-digit Mobile) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">+91</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98230 12345"
                    className="w-full pl-11 pr-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] placeholder:text-slate-400 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] placeholder:text-slate-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">
                  Lead Intake Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] transition-colors"
                >
                  <option value="call">Inbound Phone Call</option>
                  <option value="whatsapp">WhatsApp Inquiry</option>
                  <option value="website">Website Form Submission</option>
                  <option value="referral">Existing Customer Referral</option>
                  <option value="field_visit">Field Canvassing / Door Visit</option>
                  <option value="exhibition">Solar Expo / Event</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">
                  Installation Site Address &amp; Landmarks
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Bungalow 14, Green Valley Society, Baner Road"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] placeholder:text-slate-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">City / District</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Pune, Nashik, Kolhapur..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="411045"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Electricity & Solar Sizing */}
          <div className="space-y-3 pt-3 border-t border-[#E1EBF5]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#002E6E] flex items-center justify-between">
              <span>2. Electricity Bill &amp; Roof Parameters</span>
              <span className="text-[11px] text-[#00BAF2] font-semibold normal-case flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Auto-sizes kW &amp; PM Subsidy
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">
                  Average Monthly Bill (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#002E6E] font-semibold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">
                  Connection Type
                </label>
                <select
                  value={connectionType}
                  onChange={(e) => setConnectionType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] transition-colors"
                >
                  <option value="residential">Residential (Eligible for PM Subsidy)</option>
                  <option value="commercial">Commercial (C&amp;I)</option>
                  <option value="industrial">Industrial LT/HT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">
                  Roof Type
                </label>
                <select
                  value={roofType}
                  onChange={(e) => setRoofType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] transition-colors"
                >
                  <option value="rcc_flat">RCC Flat Roof</option>
                  <option value="tin_shed">Industrial Tin Shed</option>
                  <option value="elevated_required">Elevated Superstructure (&gt;8ft)</option>
                  <option value="tile_roof">Tiled / Sloped Roof</option>
                </select>
              </div>
            </div>

            {/* Live Instant Solar Recommendation Card (Paytm Style) */}
            {liveEstimate && (
              <div className="p-3.5 bg-[#E8F8FE] border border-[#BCE8FC] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00BAF2] animate-pulse" />
                    <span className="text-xs font-bold text-[#002E6E]">
                      Recommended System: ~{liveEstimate.recommendedKw} kWp Rooftop Plant
                    </span>
                  </div>
                  {liveEstimate.subsidyEligible && (
                    <span className="text-[11px] font-bold text-[#008A3F] bg-[#E7F9F0] px-2.5 py-0.5 rounded-full border border-[#B7ECCF]">
                      PM Surya Ghar Subsidy: {formatIndianCurrency(liveEstimate.subsidyAmount)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-[#BCE8FC]">
                  <div>
                    <span className="text-[11px] text-[#5B6E88] block">Est. Annual Generation</span>
                    <span className="font-semibold text-[#002E6E]">
                      {liveEstimate.annualGenerationUnits.toLocaleString('en-IN')} Units/yr
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5B6E88] block">Roof Area Needed</span>
                    <span className="font-semibold text-[#002E6E]">
                      ~{liveEstimate.roofAreaSqFt} sq. ft.
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5B6E88] block">Simple Payback</span>
                    <span className="font-semibold text-[#00AC4F]">
                      ~{liveEstimate.paybackPeriodYears} Years
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Pipeline & Follow-up Assignment */}
          <div className="space-y-3 pt-3 border-t border-[#E1EBF5]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#002E6E]">
              3. Sales Follow-Up Plan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">
                  Scheduled Next Follow-Up Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1E36] mb-1">
                  Initial Notes / Customer Remarks
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Interested in Tata 550Wp modules; wants WhatsApp quote"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36] placeholder:text-slate-400 transition-colors"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Standardized Modal Footer with Paytm Cyan Button */}
        <div className="px-5 py-3.5 bg-[#F4F7FC] border-t border-[#E1EBF5] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReturn}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#002E6E] hover:text-[#00BAF2] bg-white hover:bg-[#E8F8FE] border border-[#E1EBF5] rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00BAF2]" />
            <span>Cancel &amp; Return</span>
          </button>
          <button
            type="submit"
            form="new-lead-form"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#00BAF2] hover:bg-[#00A6DA] active:bg-[#0095C4] rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <span>Save Lead to Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
}
