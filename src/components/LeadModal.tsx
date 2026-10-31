'use client';

import React, { useState, useMemo } from 'react';
import { crmStorage } from '@/lib/storage';
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

  // Live real-time solar estimate for the sales rep while capturing the lead
  const billNumber = parseFloat(monthlyBill) || 0;
  const liveEstimate = useMemo(() => {
    if (billNumber <= 0) return null;
    return calculateSolarSystem({
      monthlyBill: billNumber,
      connectionType,
      roofType,
    });
  }, [billNumber, connectionType, roofType]);

  if (!isOpen) return null;

  // Duplicate phone check
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

    // Schedule initial follow-up if date selected
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

    onLeadCreated(newLead);
    onClose();
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-medium">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                New Solar Lead Intake
              </h2>
              <p className="text-xs text-slate-500">
                Capture rooftop customer details, electricity bill &amp; schedule follow-up
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form id="new-lead-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Duplicate Phone Notice */}
          {duplicateLead && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-amber-900">Duplicate Phone Number Detected</p>
                <p className="text-amber-800 mt-0.5">
                  A lead with this number already exists:{' '}
                  <strong>{duplicateLead.name}</strong> ({duplicateLead.leadNumber}), assigned to {duplicateLead.assignedToName}.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Customer Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>Customer Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Customer Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Deshmukh"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-slate-400 font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98220 54321"
                    className="w-full pl-11 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 placeholder:text-slate-400 font-mono transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City / District</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune, Nashik, Kolhapur"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Electricity & Rooftop Details */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>Electricity &amp; Sizing Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Avg. Monthly Bill (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-slate-400 font-medium">
                    ₹
                  </div>
                  <input
                    type="number"
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(e.target.value)}
                    placeholder="4000"
                    min="500"
                    step="100"
                    className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Power Discom</label>
                <select
                  value={discom}
                  onChange={(e) => setDiscom(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 transition-colors"
                >
                  <option value="MSEDCL">MSEDCL (Mahavitaran)</option>
                  <option value="Tata Power">Tata Power (Mumbai)</option>
                  <option value="Adani Electricity">Adani Electricity</option>
                  <option value="Torrent Power">Torrent Power</option>
                  <option value="Other">Other Discom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Sanctioned Load (kW)</label>
                <input
                  type="number"
                  value={sanctionLoadKw}
                  onChange={(e) => setSanctionLoadKw(e.target.value)}
                  placeholder="5"
                  min="1"
                  step="0.5"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Connection Category</label>
                <select
                  value={connectionType}
                  onChange={(e) => setConnectionType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 transition-colors"
                >
                  <option value="residential">Residential (Surya Ghar Eligible)</option>
                  <option value="commercial">Commercial / Institutional</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rooftop Structure Type</label>
                <select
                  value={roofType}
                  onChange={(e) => setRoofType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 transition-colors"
                >
                  <option value="rcc_flat">RCC Concrete Flat Slab</option>
                  <option value="tin_shed">Tin Industrial Shed</option>
                  <option value="elevated_required">Elevated Super-Structure (Balcony/Garden)</option>
                  <option value="tile_roof">Sloped Tiled Roof</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Power Supply Phase</label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 transition-colors"
                >
                  <option value="single">Single Phase (1-Ph 230V)</option>
                  <option value="three">Three Phase (3-Ph 415V)</option>
                </select>
              </div>
            </div>

            {/* Live Instant Sizing Preview Banner */}
            {liveEstimate && (
              <div className="mt-3.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">
                      Recommended System: {liveEstimate.recommendedKw} kW
                    </span>
                    <span className="text-slate-600 block sm:inline sm:ml-2">
                      (~{liveEstimate.annualGenerationUnits.toLocaleString('en-IN')} units/yr &bull; {liveEstimate.roofAreaSqFt} sq.ft roof)
                    </span>
                  </div>
                </div>
                {liveEstimate.subsidyEligible && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[11px] shrink-0 border border-emerald-200">
                    PM Surya Ghar Subsidy: {formatIndianCurrency(liveEstimate.subsidyAmount)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Source, Follow-up & Notes */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>Pipeline &amp; Follow-Up Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Inquiry Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 transition-colors"
                >
                  <option value="call">Inbound Phone Call</option>
                  <option value="whatsapp">WhatsApp Inquiry</option>
                  <option value="website">Website Lead Form</option>
                  <option value="referral">Customer Referral</option>
                  <option value="walk_in">Office Walk-In</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Schedule First Follow-Up Call</span>
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Site Address (Optional)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot/Flat number, Society, Street, Landmark..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Initial Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Customer requested quotation on WhatsApp; interested in Tata 550Wp modules"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-lead-form"
            className="px-5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Save Lead &amp; Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}