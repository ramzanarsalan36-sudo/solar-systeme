'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Lead, FollowUp, UserRole, LeadStatus } from '@/types/crm';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  MessageSquare,
  Calculator,
  UserCheck,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Kanban,
  Table as TableIcon,
  ChevronRight,
  ChevronLeft,
  X,
  Send,
  Building,
  Zap,
  MapPin,
  ExternalLink,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { formatIndianCurrency } from '@/lib/solar-calc';

interface LeadsViewProps {
  role: UserRole;
  onOpenLeadModal: () => void;
  onOpenQuoteForLead: (lead: Lead) => void;
}

interface KanbanStage {
  id: string;
  label: string;
  color: string;
  bgLight: string;
  badgeBg: string;
  matchStatuses: LeadStatus[];
  nextStatus?: LeadStatus;
}

const KANBAN_STAGES: KanbanStage[] = [
  {
    id: 'new',
    label: 'New Inquiry',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50/70 border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800',
    matchStatuses: ['new'],
    nextStatus: 'survey_scheduled',
  },
  {
    id: 'survey_scheduled',
    label: 'Site Survey Scheduled',
    color: 'text-amber-700',
    bgLight: 'bg-amber-50/70 border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    matchStatuses: ['survey_scheduled', 'contacted'],
    nextStatus: 'quote_generated',
  },
  {
    id: 'quote_generated',
    label: 'Quote Sent',
    color: 'text-indigo-700',
    bgLight: 'bg-indigo-50/70 border-indigo-200',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    matchStatuses: ['quote_generated', 'proposal_sent'],
    nextStatus: 'negotiation',
  },
  {
    id: 'negotiation',
    label: 'Under Negotiation',
    color: 'text-purple-700',
    bgLight: 'bg-purple-50/70 border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-800',
    matchStatuses: ['negotiation'],
    nextStatus: 'won',
  },
  {
    id: 'won',
    label: 'Won / In Installation',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50/70 border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    matchStatuses: ['won', 'converted'],
  },
  {
    id: 'lost',
    label: 'Closed Lost',
    color: 'text-slate-600',
    bgLight: 'bg-slate-100/70 border-slate-200',
    badgeBg: 'bg-slate-200 text-slate-700',
    matchStatuses: ['lost', 'closed_lost'],
  },
];

export function LeadsView({ role, onOpenLeadModal, onOpenQuoteForLead }: LeadsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedDrawerLead, setSelectedDrawerLead] = useState<Lead | null>(null);

  // Follow-up interaction form inside drawer
  const [fupSummary, setFupSummary] = useState('');
  const [fupNextAction, setFupNextAction] = useState('');
  const [fupDate, setFupDate] = useState('');
  const [fupMethod, setFupMethod] = useState<'call' | 'whatsapp' | 'site_visit' | 'email'>('call');
  const [fupOutcome, setFupOutcome] = useState<FollowUp['outcome']>('interested');

  React.useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setFupDate(d.toISOString().split('T')[0]);
  }, []);

  const leads = crmStorage.getLeads();
  const followups = crmStorage.getFollowUps();

  const filteredLeads = leads.filter((l) => {
    return (
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      l.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leadNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleStageMove = (leadId: string, nextStatus: LeadStatus) => {
    crmStorage.updateLeadStatus(leadId, nextStatus);
    if (selectedDrawerLead && selectedDrawerLead.id === leadId) {
      setSelectedDrawerLead({ ...selectedDrawerLead, status: nextStatus });
    }
  };

  const handleSaveFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrawerLead) return;
    const currentUser = crmStorage.getCurrentUser();

    crmStorage.addFollowUp({
      leadId: selectedDrawerLead.id,
      leadName: selectedDrawerLead.name,
      contactMethod: fupMethod,
      interactionSummary: fupSummary || 'Customer interaction logged.',
      outcome: fupOutcome,
      nextAction: fupNextAction || 'Follow up with customer',
      nextFollowUpDate: `${fupDate}T10:00:00Z`,
      isDone: false,
      performedBy: currentUser.id,
      performedByName: currentUser.name,
    });

    setFupSummary('');
    setFupNextAction('');
    alert('Follow-up activity recorded in CRM timeline!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-amber-400 flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Lead-to-Customer Pipeline
              </h1>
              <p className="text-xs text-slate-500">
                Twenty CRM Workflows &bull; Live Kanban Pipeline &bull; Bill-to-Quote Sizing Conversion
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenLeadModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0A1128] hover:bg-[#15234A] text-white transition-all shadow-sm shadow-slate-900/10 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>New Lead Intake</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, city, or Lead #..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW (Twenty CRM Style) */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {KANBAN_STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => stage.matchStatuses.includes(l.status));
            const totalKw = stageLeads.reduce((acc, l) => acc + (l.estimatedKw || 3), 0);

            return (
              <div
                key={stage.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedLeadId = e.dataTransfer.getData('text/plain');
                  if (droppedLeadId) {
                    handleStageMove(droppedLeadId, stage.matchStatuses[0]);
                  }
                }}
                className="flex flex-col bg-slate-50/70 rounded-2xl border border-slate-200 p-3 min-w-[270px] h-[calc(100vh-280px)] min-h-[520px] transition-colors"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.color.replace('text-', 'bg-')}`} />
                    <h3 className="font-bold text-xs text-slate-800 tracking-tight">{stage.label}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stage.badgeBg}`}>
                    {stageLeads.length}
                  </span>
                </div>

                {/* Sub-metric */}
                <div className="text-[10px] text-slate-500 mb-2.5 flex items-center justify-between px-1">
                  <span>Capacity Pipeline:</span>
                  <strong className="text-slate-700">{totalKw.toFixed(1)} kW</strong>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {stageLeads.map((lead) => {
                    const leadFups = followups.filter((f) => f.leadId === lead.id);
                    const nextFup = leadFups.find((f) => !f.isDone);
                    const isDueToday =
                      nextFup &&
                      nextFup.nextFollowUpDate.split('T')[0] <= new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', lead.id);
                        }}
                        onClick={() => setSelectedDrawerLead(lead)}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:border-amber-400/50 hover:shadow-lg transition-all duration-200 p-4 cursor-pointer space-y-3 group relative"
                      >
                        {/* Top: Name & Quick Stage Move */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <span className="font-mono text-[10px] text-slate-400 font-semibold block">
                              {lead.leadNumber}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-800 transition-colors">
                              {lead.name}
                            </h4>
                          </div>

                          {/* Quick Convert Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenQuoteForLead(lead);
                            }}
                            className="p-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all shadow-xs"
                            title="Generate 2-Min Quotation"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Phone & City */}
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <p className="flex items-center gap-1.5 font-mono text-[10px] text-slate-700">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{lead.phone}</span>
                          </p>
                          <p className="flex items-center gap-1 text-[10px] text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.city}</span>
                          </p>
                        </div>

                        {/* Bill & Estimated kW */}
                        <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-medium">Monthly Bill</span>
                            <span className="font-bold text-slate-900">
                              ₹{(lead.monthlyBill || 4500).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block font-medium">System Size</span>
                            <span className="font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md text-[10px]">
                              ~{lead.estimatedKw || 3} kW
                            </span>
                          </div>
                        </div>

                        {/* Source Tag & Next Follow-up Badge */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                          <span className="font-semibold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[9px]">
                            {lead.source}
                          </span>

                          {nextFup ? (
                            <span
                              className={`inline-flex items-center gap-1 font-semibold text-[9px] px-2 py-0.5 rounded-full ${
                                isDueToday
                                  ? 'bg-rose-100 text-rose-800 font-bold animate-pulse'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold'
                              }`}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(nextFup.nextFollowUpDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[9px]">No F-up scheduled</span>
                          )}
                        </div>

                        {/* Stage Progression Buttons on Hover */}
                        {stage.nextStatus && (
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStageMove(lead.id, stage.nextStatus!);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded-lg transition-colors"
                            >
                              <span>Next Stage</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200/80 rounded-xl">
                      Drag lead here or intake new inquiry
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3.5">Lead #</th>
                  <th className="p-3.5">Customer &amp; Contact</th>
                  <th className="p-3.5">Location &amp; Discom</th>
                  <th className="p-3.5">Monthly Bill &amp; Sizing</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Stage Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedDrawerLead(lead)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 align-top font-mono font-bold text-slate-900">
                      {lead.leadNumber}
                    </td>
                    <td className="p-3.5 align-top space-y-0.5">
                      <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                      <p className="text-slate-600 font-mono text-xs flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {lead.phone}
                      </p>
                    </td>
                    <td className="p-3.5 align-top space-y-0.5">
                      <p className="font-medium text-slate-800">{lead.city}</p>
                      <p className="text-[11px] text-slate-500">{lead.discom}</p>
                    </td>
                    <td className="p-3.5 align-top space-y-0.5">
                      <p className="font-bold text-slate-900">
                        ₹{(lead.monthlyBill || 0).toLocaleString('en-IN')}/mo
                      </p>
                      <p className="text-amber-800 font-semibold text-[11px]">
                        Recommended: ~{lead.estimatedKw || 3} kW
                      </p>
                    </td>
                    <td className="p-3.5 align-top">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {lead.source}
                      </span>
                    </td>
                    <td className="p-3.5 align-top">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize bg-amber-100 text-amber-900">
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 align-top text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQuoteForLead(lead);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#0A1128] hover:bg-[#15234A] text-white rounded-lg transition-colors shadow-2xs"
                      >
                        <Calculator className="w-3.5 h-3.5 text-amber-400" />
                        <span>Convert to Quote</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TWENTY CRM STYLE ACTION DRAWER ON CARD CLICK */}
      {selectedDrawerLead && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-2xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 bg-[#0A1128] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#0A1128] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">{selectedDrawerLead.name}</h3>
                  <p className="text-xs text-slate-300 font-mono">{selectedDrawerLead.leadNumber} &bull; {selectedDrawerLead.city}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDrawerLead(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1-Click Convert to Quotation CTA Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-b border-amber-200/80 flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Ready to Size Rooftop Solar?</span>
                <span className="text-[11px] text-slate-600">
                  Est. {selectedDrawerLead.estimatedKw || 3} kW based on ₹{selectedDrawerLead.monthlyBill} bill.
                </span>
              </div>
              <button
                onClick={() => {
                  const target = selectedDrawerLead;
                  setSelectedDrawerLead(null);
                  onOpenQuoteForLead(target);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate 2-Min Quotation</span>
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Stage Switcher Dropdown */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Current Pipeline Stage
                </label>
                <select
                  value={selectedDrawerLead.status}
                  onChange={(e) => handleStageMove(selectedDrawerLead.id, e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="new">1. New Inquiry</option>
                  <option value="survey_scheduled">2. Site Survey Scheduled</option>
                  <option value="quote_generated">3. Quote Sent</option>
                  <option value="negotiation">4. Under Negotiation</option>
                  <option value="won">5. Won / In Installation</option>
                  <option value="lost">6. Closed Lost</option>
                </select>
              </div>

              {/* Customer Contact & Electricity Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  Customer &amp; Site Details
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Direct Phone</span>
                    <a
                      href={`tel:${selectedDrawerLead.phone}`}
                      className="font-bold text-slate-900 font-mono text-xs flex items-center gap-1 hover:text-amber-700"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {selectedDrawerLead.phone}
                    </a>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">WhatsApp</span>
                    <a
                      href={`https://wa.me/${selectedDrawerLead.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-700 font-mono text-xs flex items-center gap-1 hover:underline"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="font-semibold text-slate-800">{selectedDrawerLead.address}, {selectedDrawerLead.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Discom Provider:</span>
                    <span className="font-semibold text-slate-800">{selectedDrawerLead.discom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consumer Number:</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedDrawerLead.consumerNumber || 'Pending Bill Upload'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Consumption:</span>
                    <span className="font-bold text-slate-900">
                      ₹{selectedDrawerLead.monthlyBill?.toLocaleString('en-IN')} (~{selectedDrawerLead.monthlyUnits || 0} Units)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Connection &amp; Roof:</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {selectedDrawerLead.connectionType} &bull; {selectedDrawerLead.roofType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Call Notes & Activity Logger */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  Log Call Notes &amp; Scheduled Follow-Up
                </h4>

                <form onSubmit={handleSaveFollowup} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Contact Method</label>
                      <select
                        value={fupMethod}
                        onChange={(e) => setFupMethod(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        <option value="call">Phone Call</option>
                        <option value="whatsapp">WhatsApp Message</option>
                        <option value="site_visit">Site Visit / Survey</option>
                        <option value="email">Email</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Outcome</label>
                      <select
                        value={fupOutcome}
                        onChange={(e) => setFupOutcome(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        <option value="interested">Interested &bull; Wants Quote</option>
                        <option value="quoted">Quoted &bull; Reviewing Sizing</option>
                        <option value="bargaining">Under Price Discussion</option>
                        <option value="callback_requested">Callback Requested</option>
                        <option value="not_reachable">Not Reachable</option>
                        <option value="rejected">Not Interested</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Call Notes / Summary</label>
                    <textarea
                      rows={2}
                      value={fupSummary}
                      onChange={(e) => setFupSummary(e.target.value)}
                      placeholder="e.g. Spoke to client. Roof area is 450 sq ft RCC. Wants 3.3 kW bifacial system with PM Surya Ghar subsidy."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Next Action</label>
                      <input
                        type="text"
                        value={fupNextAction}
                        onChange={(e) => setFupNextAction(e.target.value)}
                        placeholder="e.g. Send PDF quote on WhatsApp"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Next Follow-up Date</label>
                      <input
                        type="date"
                        value={fupDate}
                        onChange={(e) => setFupDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0A1128] hover:bg-[#15234A] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Save Call Note &amp; Schedule Task</span>
                  </button>
                </form>
              </div>

              {/* Historical Interaction Log */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  Interaction History &amp; Activity Log
                </h4>

                <div className="space-y-2.5">
                  {followups
                    .filter((f) => f.leadId === selectedDrawerLead.id)
                    .map((f) => (
                      <div key={f.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-amber-800 uppercase tracking-wider">{f.contactMethod}</span>
                          <span className="text-slate-400">
                            {new Date(f.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-800 text-xs font-medium">{f.interactionSummary}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                          <span>Next: <strong>{f.nextAction}</strong></span>
                          <span>By: {f.performedByName}</span>
                        </div>
                      </div>
                    ))}

                  {followups.filter((f) => f.leadId === selectedDrawerLead.id).length === 0 && (
                    <p className="text-slate-400 text-xs italic text-center py-4">
                      No previous interactions logged yet. Log the first call above!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <a
                href={`tel:${selectedDrawerLead.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Client</span>
              </a>
              <button
                onClick={() => {
                  const target = selectedDrawerLead;
                  setSelectedDrawerLead(null);
                  onOpenQuoteForLead(target);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Generate 2-Min Quotation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
