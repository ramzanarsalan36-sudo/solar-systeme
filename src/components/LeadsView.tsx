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
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Kanban,
  Table as TableIcon,
  ChevronRight,
  X,
  Send,
  Zap,
  MapPin,
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
    pillStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    matchStatuses: ['new'],
    nextStatus: 'survey_scheduled',
  },
  {
    id: 'survey_scheduled',
    label: 'Survey Scheduled',
    dotColor: 'bg-amber-500',
    pillStyle: 'bg-amber-50 text-amber-800 border-amber-200',
    matchStatuses: ['survey_scheduled', 'contacted'],
    nextStatus: 'quote_generated',
  },
  {
    id: 'quote_generated',
    label: 'Quote Sent',
    dotColor: 'bg-indigo-500',
    pillStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    matchStatuses: ['quote_generated', 'proposal_sent'],
    nextStatus: 'negotiation',
  },
  {
    id: 'negotiation',
    label: 'Under Negotiation',
    dotColor: 'bg-purple-500',
    pillStyle: 'bg-purple-50 text-purple-700 border-purple-200',
    matchStatuses: ['negotiation'],
    nextStatus: 'won',
  },
  {
    id: 'won',
    label: 'Won / Installation',
    dotColor: 'bg-emerald-500',
    pillStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    matchStatuses: ['won', 'converted'],
  },
  {
    id: 'lost',
    label: 'Closed Lost',
    dotColor: 'bg-slate-400',
    pillStyle: 'bg-slate-100 text-slate-700 border-slate-200',
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
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-amber-50 text-amber-800 border-amber-200',
  'bg-emerald-50 text-emerald-800 border-emerald-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-rose-50 text-rose-800 border-rose-200',
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
  const [mobileActiveStage, setMobileActiveStage] = useState<string>('all');
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
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-medium">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Leads &amp; Pipeline
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Customer inquiry intake, status tracker &amp; solar sizing conversion
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLeadModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Lead Intake</span>
        </button>
      </div>

      {/* Toolbar: Search & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:outline-hidden text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Stage Selector Tabs (Phone / Field view) */}
      {viewMode === 'kanban' && (
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setMobileActiveStage('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              mobileActiveStage === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Leads ({filteredLeads.length})
          </button>
          {KANBAN_STAGES.map((st) => {
            const count = filteredLeads.filter((l) => st.matchStatuses.includes(l.status)).length;
            const isSelected = mobileActiveStage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setMobileActiveStage(st.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${st.dotColor}`} />
                <span>{st.label}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <>
          {/* Desktop Multi-column Kanban (Fixed-width horizontal scroll) */}
          <div className="hidden lg:flex gap-4 overflow-x-auto pb-4 items-start">
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
                  className="w-80 shrink-0 bg-slate-50/70 rounded-xl border border-slate-200/90 p-3 flex flex-col max-h-[calc(100vh-250px)]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                      <h3 className="font-semibold text-xs text-slate-800">{stage.label}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${stage.pillStyle}`}>
                        {stageLeads.length}
                      </span>
                      <button
                        onClick={onOpenLeadModal}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                        title="Add lead"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sub-metric */}
                  <div className="text-[11px] text-slate-500 mb-2 flex items-center justify-between px-0.5">
                    <span>Capacity: <span className="font-medium text-slate-700">{totalKw.toFixed(1)} kW</span></span>
                    <span className="text-slate-400">~₹{((totalKw * 58000) / 100000).toFixed(1)}L</span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                    {stageLeads.map((lead) => {
                      const leadFups = followups.filter((f) => f.leadId === lead.id);
                      const nextFup = leadFups.find((f) => !f.isDone);

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', lead.id);
                          }}
                          onClick={() => setSelectedDrawerLead(lead)}
                          className="bg-white rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all p-3 cursor-pointer space-y-2 group"
                        >
                          {/* Card Header: Avatar & Name */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-[11px] shrink-0 border ${getAvatarColor(
                                  lead.name
                                )}`}
                              >
                                {getInitials(lead.name)}
                              </div>
                              <div className="truncate">
                                <h4 className="font-semibold text-xs text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                                  {lead.name}
                                </h4>
                                <span className="font-mono text-[10px] text-slate-400 font-normal">
                                  {lead.leadNumber}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenQuoteForLead(lead);
                              }}
                              className="p-1 rounded text-amber-700 bg-amber-50 hover:bg-amber-500 hover:text-white transition-colors"
                              title="Generate Solar Quote"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-0.5 text-[11px] text-slate-500">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{lead.city} &bull; {lead.discom}</span>
                            </div>
                          </div>

                          {/* Sizing Info Strip */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <div>
                              <span className="text-slate-400">Bill: </span>
                              <span className="font-medium text-slate-800">
                                ₹{lead.monthlyBill?.toLocaleString('en-IN') || '4,000'}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-medium text-[10px] border border-amber-200/60">
                              ~{lead.estimatedKw || 3} kW
                            </span>
                          </div>

                          {/* Follow-up Note */}
                          {nextFup && (
                            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                              <span className="truncate max-w-[140px] text-slate-600">{nextFup.nextAction}</span>
                              <span className="text-amber-700 font-medium shrink-0">
                                {new Date(nextFup.nextFollowUpDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {stageLeads.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                        Drag lead here or intake new
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile / Tablet Single Stage / All View (Touch-optimized) */}
          <div className="lg:hidden space-y-3">
            {filteredLeads
              .filter((l) => {
                if (mobileActiveStage === 'all') return true;
                const stage = KANBAN_STAGES.find((s) => s.id === mobileActiveStage);
                return stage ? stage.matchStatuses.includes(l.status) : true;
              })
              .map((lead) => {
                const leadFups = followups.filter((f) => f.leadId === lead.id);
                const nextFup = leadFups.find((f) => !f.isDone);
                const currentStageObj = KANBAN_STAGES.find((s) => s.matchStatuses.includes(lead.status)) || KANBAN_STAGES[0];

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedDrawerLead(lead)}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 space-y-3 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-xs shrink-0 border ${getAvatarColor(
                            lead.name
                          )}`}
                        >
                          {getInitials(lead.name)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900 leading-tight">
                            {lead.name}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {lead.city} &bull; <span className="font-mono">{lead.leadNumber}</span>
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${currentStageObj.pillStyle}`}>
                        {currentStageObj.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Monthly Bill</span>
                        <span className="font-medium text-slate-800">₹{lead.monthlyBill?.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Estimated Solar</span>
                        <span className="font-medium text-amber-700">~{lead.estimatedKw || 3} kW System</span>
                      </div>
                    </div>

                    {/* Mobile Quick Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQuoteForLead(lead);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Quote</span>
                      </button>
                    </div>
                  </div>
                );
              })}

            {filteredLeads.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                No leads match search criteria.
              </div>
            )}
          </div>
        </>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  <th className="p-3">Lead Ref</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">City / Discom</th>
                  <th className="p-3 text-right">Monthly Bill</th>
                  <th className="p-3 text-center">System Size</th>
                  <th className="p-3">Pipeline Stage</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setSelectedDrawerLead(l)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-mono text-slate-500 font-normal">{l.leadNumber}</td>
                    <td className="p-3 font-medium text-slate-900">{l.name}</td>
                    <td className="p-3 font-mono text-slate-600">{l.phone}</td>
                    <td className="p-3 text-slate-600">{l.city} &bull; {l.discom}</td>
                    <td className="p-3 text-right font-medium text-slate-900">
                      ₹{l.monthlyBill?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-medium text-[10px]">
                        ~{l.estimatedKw || 3} kW
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="capitalize text-[11px] font-medium text-slate-700">
                        {l.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQuoteForLead(l);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 text-xs font-medium transition-colors"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Quote</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTION DRAWER ON CARD CLICK */}
      {selectedDrawerLead && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-150">
            {/* Top Bar */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Leads</span>
                <span>/</span>
                <span className="font-mono font-medium text-slate-900">{selectedDrawerLead.leadNumber}</span>
              </div>
              <button
                onClick={() => setSelectedDrawerLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Identity Bar */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm shrink-0 border ${getAvatarColor(
                    selectedDrawerLead.name
                  )}`}
                >
                  {getInitials(selectedDrawerLead.name)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 leading-snug">
                    {selectedDrawerLead.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{selectedDrawerLead.city} &bull; {selectedDrawerLead.discom}</span>
                  </p>
                </div>
              </div>

              {/* Stage Dropdown */}
              <select
                value={selectedDrawerLead.status}
                onChange={(e) => handleStageMove(selectedDrawerLead.id, e.target.value as LeadStatus)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white focus:border-amber-500 focus:outline-hidden"
              >
                <option value="new">1. New Inquiry</option>
                <option value="survey_scheduled">2. Site Survey</option>
                <option value="quote_generated">3. Quote Sent</option>
                <option value="negotiation">4. Negotiation</option>
                <option value="won">5. Won / Install</option>
                <option value="lost">6. Closed Lost</option>
              </select>
            </div>

            {/* Quick Contact Bar */}
            <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedDrawerLead.phone}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{selectedDrawerLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${selectedDrawerLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-800"
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
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Solar Quote</span>
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="px-5 bg-white border-b border-slate-200 flex items-center gap-4 text-xs shrink-0">
              <button
                onClick={() => setDrawerTab('overview')}
                className={`py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
                  drawerTab === 'overview'
                    ? 'border-amber-500 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDrawerTab('activity')}
                className={`py-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  drawerTab === 'activity'
                    ? 'border-amber-500 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Activity &amp; Notes</span>
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center">
                  {followups.filter((f) => f.leadId === selectedDrawerLead.id).length}
                </span>
              </button>
              <button
                onClick={() => setDrawerTab('sizing')}
                className={`py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
                  drawerTab === 'sizing'
                    ? 'border-amber-500 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Solar Sizing
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {drawerTab === 'overview' && (
                <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-500">Contact Person</span>
                    <span className="font-medium text-slate-900">{selectedDrawerLead.name}</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-500">Phone Number</span>
                    <span className="font-mono text-slate-900">{selectedDrawerLead.phone}</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-500">City / Discom</span>
                    <span className="text-slate-800">{selectedDrawerLead.city} &bull; {selectedDrawerLead.discom}</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-500">Site Address</span>
                    <span className="text-slate-800 text-right truncate max-w-[200px]">{selectedDrawerLead.address}</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-500">Roof Surface</span>
                    <span className="text-slate-800 capitalize">{selectedDrawerLead.roofType.replace('_', ' ')}</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-500">Inquiry Source</span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {selectedDrawerLead.source}
                    </span>
                  </div>
                </div>
              )}

              {drawerTab === 'activity' && (
                <div className="space-y-4">
                  <form onSubmit={handleSaveFollowup} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <h4 className="font-semibold text-slate-900 text-xs">Log Call or Follow-up</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={fupMethod}
                        onChange={(e) => setFupMethod(e.target.value as any)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="call">Phone Call</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="site_visit">Site Visit</option>
                      </select>
                      <select
                        value={fupOutcome}
                        onChange={(e) => setFupOutcome(e.target.value as any)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="interested">Interested</option>
                        <option value="quoted">Quoted</option>
                        <option value="bargaining">Under Negotiation</option>
                        <option value="callback_requested">Callback</option>
                        <option value="rejected">Not Interested</option>
                      </select>
                    </div>

                    <textarea
                      rows={2}
                      value={fupSummary}
                      onChange={(e) => setFupSummary(e.target.value)}
                      placeholder="Notes from customer conversation..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      required
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={fupNextAction}
                        onChange={(e) => setFupNextAction(e.target.value)}
                        placeholder="Next action..."
                        className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        required
                      />
                      <input
                        type="date"
                        value={fupDate}
                        onChange={(e) => setFupDate(e.target.value)}
                        className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition-colors"
                    >
                      Save Activity Note
                    </button>
                  </form>

                  {/* History */}
                  <div className="space-y-2">
                    {followups
                      .filter((f) => f.leadId === selectedDrawerLead.id)
                      .map((f) => (
                        <div key={f.id} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="font-medium text-amber-800 uppercase">{f.contactMethod}</span>
                            <span>{new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <p className="text-slate-800 text-xs">{f.interactionSummary}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {drawerTab === 'sizing' && (
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">Estimated System Size</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-semibold text-xs">
                      ~{selectedDrawerLead.estimatedKw || 3} kW
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-amber-200/80">
                      <span className="text-[10px] text-slate-400 block">Monthly Bill</span>
                      <span className="font-medium text-slate-900">₹{selectedDrawerLead.monthlyBill?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-amber-200/80">
                      <span className="text-[10px] text-slate-400 block">PM Surya Ghar Subsidy</span>
                      <span className="font-medium text-emerald-700">₹78,000</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const target = selectedDrawerLead;
                      setSelectedDrawerLead(null);
                      onOpenQuoteForLead(target);
                    }}
                    className="w-full py-2 rounded-lg font-medium text-xs bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                  >
                    Generate Official Quotation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}