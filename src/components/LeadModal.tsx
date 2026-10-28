'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Lead, LeadSource } from '@/types/crm';
import { X, UserPlus, Phone, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';

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
  const [sanctionLoadKw, setSanctionLoadKw] = useState<number>(5);
  const [monthlyBill, setMonthlyBill] = useState<number>(4000);
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

  if (!isOpen) return null;

  // Duplicate phone check
  const existingLeads = crmStorage.getLeads();
  const cleanCurrentPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const duplicateLead = cleanCurrentPhone.length === 10
    ? existingLeads.find((l) => l.phone.replace(/[^0-9]/g, '').slice(-10) === cleanCurrentPhone)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please fill in Customer Name and Contact Phone');
      return;
    }

    const currentUser = crmStorage.getCurrentUser();
    const monthlyUnits = Math.round(Number(monthlyBill) / 8.5);
    const estimatedKw = Math.max(1, Math.round((monthlyUnits / 120) * 10) / 10);

    const newLead = crmStorage.addLead({
      name,
      phone,
      email: email || undefined,
      address: address || 'Address to be verified during survey',
      city,
      state,
      pinCode: pinCode || undefined,
      discom,
      consumerNumber: consumerNumber || undefined,
      sanctionLoadKw: Number(sanctionLoadKw),
      monthlyBill: Number(monthlyBill),
      monthlyUnits,
      connectionType,
      phase,
      roofType,
      source,
      status: 'new',
      assignedTo: currentUser.id,
      assignedToName: currentUser.name,
      estimatedKw,
      notes,
    });

    // Schedule initial follow-up if date selected
    if (nextFollowUpDate) {
      crmStorage.addFollowUp({
        leadId: newLead.id,
        leadName: newLead.name,
        contactMethod: source === 'whatsapp' ? 'whatsapp' : 'call',
        interactionSummary: `Initial inquiry captured via ${source}. Follow-up scheduled.`,
        outcome: 'interested',
        nextAction: 'Introductory phone call to explain system sizing & PM Surya Ghar scheme',
        nextFollowUpDate: `${nextFollowUpDate}T10:00:00Z`,
        isDone: false,
        performedBy: currentUser.id,
        performedByName: currentUser.name,
      });
    }

    onLeadCreated(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        <div className="px-6 py-4 bg-[#10233F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F4B740] text-[#10233F] flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Capture Solar Inquiry / Lead</h2>
              <p className="text-xs text-slate-300">New lead intake with duplicate detection &amp; follow-up scheduler</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1b355d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {duplicateLead && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Possible Duplicate Lead Detected!</p>
                <p className="text-[11px] text-amber-800">
                  A lead with this phone number already exists: <strong>{duplicateLead.name}</strong> ({duplicateLead.leadNumber}), assigned to {duplicateLead.assignedToName}.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Customer Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dnyaneshwar Patil"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone / WhatsApp Number *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98220 54321"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="call">Phone Call (Inbound)</option>
                <option value="whatsapp">WhatsApp Enquiry</option>
                <option value="website">Website Form</option>
                <option value="referral">Existing Customer Referral</option>
                <option value="walk_in">Office Walk-In</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">City / District</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@email.com"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Electricity Discom</label>
              <select
                value={discom}
                onChange={(e) => setDiscom(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="MSEDCL">MSEDCL (Maharashtra State)</option>
                <option value="Tata Power">Tata Power (Mumbai)</option>
                <option value="Adani Electricity">Adani Electricity</option>
                <option value="Torrent Power">Torrent Power</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Consumer No. (Optional)</label>
              <input
                type="text"
                value={consumerNumber}
                onChange={(e) => setConsumerNumber(e.target.value)}
                placeholder="e.g. 028549102934"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Sanctioned Load (kW)</label>
              <input
                type="number"
                value={sanctionLoadKw}
                onChange={(e) => setSanctionLoadKw(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Monthly Bill (₹ Approx)</label>
              <input
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Connection Type</label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Rooftop Type</label>
              <select
                value={roofType}
                onChange={(e) => setRoofType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="rcc_flat">RCC Flat Concrete</option>
                <option value="elevated_required">Elevated Structure</option>
                <option value="tin_shed">Tin Industrial Shed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Site Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Plot No, Colony, Landmark..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Schedule Next Follow-Up Call
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Enquiry Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Wants PM Surya Ghar subsidy details on WhatsApp"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-[#10233F] bg-[#F4B740] hover:bg-[#D99B26] rounded-xl transition-colors shadow-sm"
            >
              Save Lead &amp; Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
