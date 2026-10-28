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
  dotColor: string;
  pillStyle: string;
  matchStatuses: LeadStatus[];
  nextStatus?: LeadStatus;
}

const KANBAN_STAGES: KanbanStage[] = [
  {
    id: 'new',
    label: 'New Inquiry',
    dotColor: 'bg-blue-500',
    pillStyle: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    matchStatuses: ['new'],
    nextStatus: 'survey_scheduled',
  },
  {
    id: 'survey_scheduled',
    label: 'Site Survey Scheduled',
    dotColor: 'bg-amber-500',
    pillStyle: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    matchStatuses: ['survey_scheduled', 'contacted'],
    nextStatus: 'quote_generated',
  },
  {
    id: 'quote_generated',
    label: 'Quote Sent',
    dotColor: 'bg-indigo-500',
    pillStyle: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    matchStatuses: ['quote_generated', 'proposal_sent'],
    nextStatus: 'negotiation',
  },
  {
    id: 'negotiation',
    label: 'Under Negotiation',
    dotColor: 'bg-purple-500',
    pillStyle: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    matchStatuses: ['negotiation'],
    nextStatus: 'won',
  },
  {
    id: 'won',
    label: 'Won / In Installation',
    dotColor: 'bg-emerald-500',
    pillStyle: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    matchStatuses: ['won', 'converted'],
  },
  {
    id: 'lost',
    label: 'Closed Lost',
    dotColor: 'bg-slate-400',
    pillStyle: 'bg-slate-100 text-slate-700 border border-slate-200',
    matchStatuses: ['lost', 'closed_lost'],
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-rose-100 text-rose-800 border-rose-200',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function LeadsView({ role, onOpenLeadModal, onOpenQuoteForLead }: LeadsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedDrawerLead, setSelectedDrawerLead] = useState<Lead | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'activity' | 'sizing'>('overview');

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
            const totalEstValue = stageLeads.reduce((acc, l) => acc + (l.estimatedKw || 3) * 58000, 0);

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
                className="flex flex-col bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] p-3 min-w-[275px] h-[calc(100vh-280px)] min-h-[520px] transition-colors"
              >
                {/* Twenty Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor} shadow-2xs`} />
                    <h3 className="font-bold text-xs text-slate-800 tracking-tight">{stage.label}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stage.pillStyle}`}>
                      {stageLeads.length}
                    </span>
                    <button
                      onClick={onOpenLeadModal}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                      title="Add lead to this stage"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-metric */}
                <div className="text-[10px] text-slate-500 mb-2.5 flex items-center justify-between px-1">
                  <span>Capacity: <strong className="text-slate-700">{totalKw.toFixed(1)} kW</strong></span>
                  <span className="text-slate-400 font-mono font-medium">~₹{(totalEstValue / 100000).toFixed(1)}L</span>
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
                        className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-150 p-3.5 cursor-pointer space-y-2.5 group relative"
                      >
                        {/* Top: Avatar, Name & Quick Stage Move */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${getAvatarColor(lead.name)}`}>
                              {getInitials(lead.name)}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-800 transition-colors leading-tight">
                                {lead.name}
                              </h4>
                              <span className="font-mono text-[9px] text-slate-400 font-semibold block">
                                {lead.leadNumber}
                              </span>
                            </div>
                          </div>

                          {/* Quick Convert Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenQuoteForLead(lead);
                            }}
                            className="p-1 rounded-md text-amber-700 bg-amber-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all shadow-2xs"
                            title="Generate 2-Min Quotation"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Phone & City */}
                        <div className="space-y-0.5 text-[11px] text-slate-600">
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
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-medium">Monthly Bill</span>
                            <span className="font-bold text-slate-900">
                              ₹{(lead.monthlyBill || 4500).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block font-medium">System Size</span>
                            <span className="font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded text-[10px]">
                              ~{lead.estimatedKw || 3} kW
                            </span>
                          </div>
                        </div>

                        {/* Source Tag & Next Follow-up Badge */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                          <span className="font-semibold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">
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
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-amber-800 hover:bg-amber-50 px-2 py-0.5 rounded-lg transition-colors"
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
          <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Top Breadcrumbs & Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>Pipeline</span>
                <span>/</span>
                <span className="text-slate-700">Leads</span>
                <span>/</span>
                <span className="font-mono font-bold text-slate-900">{selectedDrawerLead.leadNumber}</span>
              </div>
              <button
                onClick={() => setSelectedDrawerLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Twenty Record Identity Bar */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${getAvatarColor(selectedDrawerLead.name)}`}>
                  {getInitials(selectedDrawerLead.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {selectedDrawerLead.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{selectedDrawerLead.city} &bull; {selectedDrawerLead.discom}</span>
                  </p>
                </div>
              </div>

              {/* Twenty Stage Dropdown Pill */}
              <div className="relative">
                <select
                  value={selectedDrawerLead.status}
                  onChange={(e) => handleStageMove(selectedDrawerLead.id, e.target.value as LeadStatus)}
                  className="px-3 py-1.5 text-xs font-bold rounded-full border border-slate-300 bg-white shadow-2xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="new">🔵 1. New Inquiry</option>
                  <option value="survey_scheduled">🟡 2. Site Survey Scheduled</option>
                  <option value="quote_generated">🟣 3. Quote Sent</option>
                  <option value="negotiation">🟣 4. Under Negotiation</option>
                  <option value="won">🟢 5. Won / In Installation</option>
                  <option value="lost">⚪ 6. Closed Lost</option>
                </select>
              </div>
            </div>

            {/* Twenty Quick Action Strip */}
            <div className="px-6 py-2.5 bg-[#FBFBFC] border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedDrawerLead.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{selectedDrawerLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${selectedDrawerLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                onClick={() => {
                  const target = selectedDrawerLead;
                  setSelectedDrawerLead(null);
                  onOpenQuoteForLead(target);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>2-Min Quotation</span>
              </button>
            </div>

            {/* Twenty Tabs Navigation */}
            <div className="px-6 bg-white border-b border-slate-200 flex items-center gap-6 text-xs shrink-0">
              <button
                onClick={() => setDrawerTab('overview')}
                className={`py-3 font-bold border-b-2 transition-colors cursor-pointer ${
                  drawerTab === 'overview'
                    ? 'border-amber-500 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview &amp; Properties
              </button>
              <button
                onClick={() => setDrawerTab('activity')}
                className={`py-3 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  drawerTab === 'activity'
                    ? 'border-amber-500 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Activity Timeline</span>
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-bold">
                  {followups.filter((f) => f.leadId === selectedDrawerLead.id).length}
                </span>
              </button>
              <button
                onClick={() => setDrawerTab('sizing')}
                className={`py-3 font-bold border-b-2 transition-colors cursor-pointer ${
                  drawerTab === 'sizing'
                    ? 'border-amber-500 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Solar Sizing &amp; Subsidy
              </button>
            </div>

            {/* Drawer Body per Tab */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {drawerTab === 'overview' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 shadow-2xs">
                    <div className="p-3 bg-slate-50/80 font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                      Core Solar Lead Attributes
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-slate-500">Contact Person</span>
                      <span className="font-bold text-slate-900">{selectedDrawerLead.name}</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-slate-500">Phone Number</span>
                      <span className="font-mono font-bold text-slate-900">{selectedDrawerLead.phone}</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-slate-500">City / Region</span>
                      <span className="font-semibold text-slate-800">{selectedDrawerLead.city}</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-slate-500">Site Address</span>
                      <span className="font-medium text-slate-800 max-w-[280px] text-right truncate">
                        {selectedDrawerLead.address}
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-slate-500">DISCOM Provider</span>
                      <span className="font-bold text-slate-900">{selectedDrawerLead.discom}</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-slate-500">Consumer Number</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {selectedDrawerLead.consumerNumber || 'Pending Bill Copy'}
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-slate-500">Connection Category</span>
                      <span className="font-semibold text-slate-800 capitalize">{selectedDrawerLead.connectionType}</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-slate-500">Roof Surface Type</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {selectedDrawerLead.roofType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-slate-500">Inquiry Source</span>
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {selectedDrawerLead.source}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'activity' && (
                <div className="space-y-4">
                  {/* Activity Logger Box */}
                  <form onSubmit={handleSaveFollowup} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs">Log Call Note / Next Interaction</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Interaction Method</label>
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
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Lead Outcome</label>
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
                        placeholder="e.g. Spoke to client. Roof area is ~400 sq.ft. Wants 3.3 kW bifacial system with PM Surya Ghar subsidy."
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
                          placeholder="e.g. Share quotation PDF on WhatsApp"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Target Follow-up Date</label>
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
                      className="w-full py-2 bg-[#0B1120] hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Record Activity &amp; Set Reminder</span>
                    </button>
                  </form>

                  {/* Twenty Timeline */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-slate-800 text-xs">Timeline History</h4>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {followups
                        .filter((f) => f.leadId === selectedDrawerLead.id)
                        .map((f) => (
                          <div key={f.id} className="relative group">
                            <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white" />
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  {f.contactMethod}
                                </span>
                                <span className="text-slate-400">
                                  {new Date(f.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-800 text-xs font-medium leading-relaxed">{f.interactionSummary}</p>
                              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                                <span>Next: <strong>{f.nextAction}</strong></span>
                                <span>By: {f.performedByName}</span>
                              </div>
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
              )}

              {drawerTab === 'sizing' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950">Recommended Sizing</span>
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-amber-500 text-white">
                        ~{selectedDrawerLead.estimatedKw || 3} kW System
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                        <span className="text-[10px] text-slate-400 block">Monthly Electricity Bill</span>
                        <span className="font-bold text-slate-900">₹{selectedDrawerLead.monthlyBill?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                        <span className="text-[10px] text-slate-400 block">Monthly Units (kWh)</span>
                        <span className="font-bold text-slate-900">~{selectedDrawerLead.monthlyUnits || 360} Units</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                        <span className="text-[10px] text-slate-400 block">PM Surya Ghar Subsidy</span>
                        <span className="font-bold text-emerald-700">
                          -₹{(selectedDrawerLead.estimatedKw || 3) >= 3 ? '78,000' : '60,000'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                        <span className="text-[10px] text-slate-400 block">Est. Payback</span>
                        <span className="font-bold text-amber-800">~2.8 Years</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const target = selectedDrawerLead;
                        setSelectedDrawerLead(null);
                        onOpenQuoteForLead(target);
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Launch 2-Minute Quotation Wizard</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <a
                href={`tel:${selectedDrawerLead.phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Client</span>
              </a>
              <a
                href={`https://wa.me/${selectedDrawerLead.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
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
