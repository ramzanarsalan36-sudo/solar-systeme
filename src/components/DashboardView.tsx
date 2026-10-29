'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UserRole } from '@/types/crm';
import { crmStorage } from '@/lib/storage';
import { calculateSolarSystem, formatIndianCurrency } from '@/lib/solar-calc';
import { INITIAL_USERS } from '@/lib/initial-data';
import {
  Users,
  FileSpreadsheet,
  PackageCheck,
  Warehouse,
  AlertTriangle,
  Clock,
  TrendingUp,
  Sun,
  Phone,
  CheckCircle2,
  Wrench,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Calculator,
  Zap,
  Sparkles,
  MapPin,
  Building2,
  FileText,
  Share2,
  Calendar,
  Check,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  role: UserRole;
  setActiveTab: (tab: string) => void;
  onOpenQuoteModal: () => void;
  onOpenLeadModal: () => void;
  onOpenStockModal: () => void;
}

export function DashboardView({
  role,
  setActiveTab,
  onOpenQuoteModal,
  onOpenLeadModal,
  onOpenStockModal,
}: DashboardViewProps) {
  const leads = crmStorage.getLeads();
  const quotations = crmStorage.getQuotations();
  const orders = crmStorage.getOrders();
  const products = crmStorage.getProducts();
  const followups = crmStorage.getFollowUps();
  const tasks = crmStorage.getTasks();
  const auditLogs = crmStorage.getAuditLogs().slice(0, 5);

  const activeLeads = leads.filter((l) => l.status !== 'converted' && l.status !== 'lost');
  const totalPipelineValue = quotations.reduce((acc, q) => acc + q.totalGrossPrice, 0);
  const totalOrderValue = orders.reduce((acc, o) => acc + o.totalOrderValue, 0);
  const totalPaidRevenue = orders.reduce((acc, o) => acc + o.totalPaid, 0);
  const totalBalanceDue = orders.reduce((acc, o) => acc + o.balanceDue, 0);

  const [today, setToday] = useState<string>('');
  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

  const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert);
  const pendingFollowups = followups.filter((f) => !f.isDone);
  const dueTodayFollowups = pendingFollowups.filter((f) => (today ? f.nextFollowUpDate.split('T')[0] <= today : false));
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');

  // Quick Solar Calculator Widget on Dashboard
  const [quickBill, setQuickBill] = useState<number>(3800);
  const quickCalc = useMemo(() => {
    return calculateSolarSystem({
      monthlyBill: quickBill,
      connectionType: 'residential',
      roofType: 'rcc_flat',
    });
  }, [quickBill]);

  // Quick Preset Bills
  const presets = [
    { label: '₹1,500/mo (Small 1.5kW)', value: 1500 },
    { label: '₹3,800/mo (Standard 3.3kW)', value: 3800 },
    { label: '₹7,500/mo (Large 6.6kW)', value: 7500 },
    { label: '₹15,000/mo (Commercial 12kW)', value: 15000 },
  ];

  const collectionPercentage = totalOrderValue > 0 ? Math.round((totalPaidRevenue / totalOrderValue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Infisparks Production Persona Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 tracking-tight">Role-Based Access Preview</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 uppercase">
                Active: {role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Switch role context to see tailored workflows, field checklists, and financial controls:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {INITIAL_USERS.map((u) => {
            const isCurrent = u.role === role;
            return (
              <button
                key={u.id}
                onClick={() => {
                  crmStorage.setCurrentUser(u);
                  window.location.reload();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0F172A] text-amber-400 shadow-sm border border-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>
                  {u.role === 'admin' ? 'Admin' : u.role === 'sales' ? 'Sales / Office' : 'Store & Field Tech'}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md ${
                  isCurrent ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-600'
                }`}>
                  {u.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Hero Cockpit Banner with Infisparks High-Tech Navy & Radiant Gold Rig */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0A1128] via-[#0F1E3D] to-[#142952] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800/90">
        {/* Subtle Architectural Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Radiant Ambient Solar Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/25 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-blue-600/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-amber-400 text-slate-950 shadow-sm">
                <Sun className="w-3.5 h-3.5 fill-slate-950" />
                SYSTOMECH ENGINEERS &bull; SOLAR EPC
              </span>
              <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-xs">
                ⚡ PM Surya Ghar 2026 Certified &bull; MSEDCL Net-Meter Approved
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {role === 'admin' && (
                <>
                  Maharashtra Solar EPC{' '}
                  <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                    Command Center
                  </span>
                </>
              )}
              {role === 'sales' && (
                <>
                  Customer Inquiries &amp;{' '}
                  <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                    2-Min Solar Proposals
                  </span>
                </>
              )}
              {role === 'store_field' && (
                <>
                  Rooftop Site Operations &amp;{' '}
                  <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                    Warehouse Stock
                  </span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {role === 'admin' &&
                'Track live Maharashtra rooftop projects, approved equipment pricing, milestone payment collections, and inventory levels in one integrated dashboard.'}
              {role === 'sales' &&
                'Manage customer inquiries from phone calls and WhatsApp, calculate exact rooftop sizing from electricity bills in seconds, and share instant PDF quotes.'}
              {role === 'store_field' &&
                'Execute assigned rooftop solar mounting jobs, complete safety checklist inspections on mobile, and record warehouse stock dispatches.'}
            </p>
          </div>

          {/* Action CTAs with High-Precision Infisparks Styling */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {role !== 'store_field' ? (
              <>
                <button
                  onClick={onOpenQuoteModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-102 active:scale-98"
                >
                  <Calculator className="w-4 h-4 stroke-[2.5]" />
                  <span>Bill to Quote (2 Mins)</span>
                </button>
                <button
                  onClick={onOpenLeadModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-md cursor-pointer hover:border-amber-400/50"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>+ New Lead</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenStockModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-102"
              >
                <Warehouse className="w-4 h-4 stroke-[2.5]" />
                <span>Record Stock GRN / Dispatch</span>
              </button>
            )}
          </div>
        </div>

        {/* Micro-KPI Live Status Cards in Hero */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Active Pipeline</span>
            <span className="text-base sm:text-lg font-black text-white">{quotations.length} Proposals</span>
            <span className="block text-[11px] text-amber-300 font-semibold">{formatIndianCurrency(totalPipelineValue)}</span>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Under Execution</span>
            <span className="text-base sm:text-lg font-black text-white">{orders.length} Rooftop Sites</span>
            <span className="block text-[11px] text-emerald-300 font-semibold">{formatIndianCurrency(totalOrderValue)}</span>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">PM Surya Ghar Subsidy</span>
            <span className="text-base sm:text-lg font-black text-amber-400">Direct DBT</span>
            <span className="block text-[11px] text-slate-300">Up to ₹78,000 / consumer</span>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Operating Discoms</span>
            <span className="text-base sm:text-lg font-black text-white">MSEDCL, Tata, Adani</span>
            <span className="block text-[11px] text-emerald-300 font-semibold">Net-metering active</span>
          </div>
        </div>
      </div>

      {/* 4 Interactive Primary KPI Cards (Infisparks Signature Pure White Elevation) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Leads */}
        <div
          onClick={() => setActiveTab(role === 'store_field' ? 'tasks' : 'leads')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {role === 'store_field' ? 'Field Site Tasks' : 'Active Inquiries'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              {role === 'store_field' ? <Wrench className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {role === 'store_field' ? pendingTasks.length : activeLeads.length}
            </span>
            <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Active CRM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            {role === 'store_field' ? 'Assigned site visits & mountings' : 'Calls, WhatsApp & Website leads'}
          </p>
        </div>

        {/* Card 2: Quotations / Stock SKUs */}
        <div
          onClick={() => setActiveTab(role === 'store_field' ? 'inventory' : 'quotations')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {role === 'store_field' ? 'Inventory Catalog' : 'Proposals Pipeline'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              {role === 'store_field' ? <Warehouse className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {role === 'store_field' ? products.length : quotations.length}
            </span>
            <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
              {role === 'store_field' ? 'Master SKUs' : formatIndianCurrency(totalPipelineValue)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            {role === 'store_field' ? 'Panels, inverters & mounting BOS' : 'Official PDF proposals generated'}
          </p>
        </div>

        {/* Card 3: Orders & Collections */}
        <div
          onClick={() => setActiveTab('orders')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-emerald-400 hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {role === 'store_field' ? 'Active Projects' : 'Projects Booked'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{orders.length}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {formatIndianCurrency(totalPaidRevenue)} Paid
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            {formatIndianCurrency(totalBalanceDue)} balance pending collection
          </p>
        </div>

        {/* Card 4: Action Alerts */}
        <div
          onClick={() => setActiveTab(role === 'sales' ? 'leads' : 'inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-rose-400 hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
        >
          <div className={`h-1 w-full absolute top-0 left-0 ${
            (role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0
              ? 'bg-gradient-to-r from-rose-500 to-red-600'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`} />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {role === 'sales' ? 'Follow-ups Due Today' : 'Low Stock Alerts'}
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs ${
              (role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0
                ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              (role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {(role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            {role === 'sales'
              ? `${pendingFollowups.length} client interactions scheduled`
              : `${lowStockProducts.length} items below minimum safety buffer`}
          </p>
        </div>
      </div>

      {/* DASHBOARD WIDGET: Instant 10-Second Solar Bill & Subsidy Sizer (Infisparks Precision Design) */}
      {role !== 'store_field' && (
        <div className="bg-gradient-to-br from-white via-amber-50/20 to-white rounded-3xl border border-amber-300/80 p-5 sm:p-6 shadow-md shadow-amber-500/5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-200/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-amber-400 flex items-center justify-center font-black shadow-md border border-slate-700">
                <Zap className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Instant 10-Second Rooftop Sizing &amp; Subsidy Calculator
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F172A] text-amber-300 border border-slate-700">
                    PM Surya Ghar 2026
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Slide or select client&apos;s monthly electricity bill to instantly size kW capacity, central DBT subsidy, and net payable:
                </p>
              </div>
            </div>

            <button
              onClick={onOpenQuoteModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0F172A] text-amber-400 hover:bg-slate-800 transition-all shadow-sm shrink-0 border border-slate-700 cursor-pointer"
            >
              <span>Full Proposal Modal &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
            {/* Input Slider & Presets (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Monthly Electricity Bill:
                </label>
                <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-300 shadow-2xs">
                  <span className="text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="100"
                    min="1000"
                    max="50000"
                    value={quickBill}
                    onChange={(e) => setQuickBill(Number(e.target.value))}
                    className="w-20 text-sm font-black text-slate-900 bg-transparent text-right focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-500 font-medium">/mo</span>
                </div>
              </div>

              {/* Slider Range */}
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={quickBill}
                onChange={(e) => setQuickBill(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />

              {/* Quick Preset Chips */}
              <div className="grid grid-cols-2 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setQuickBill(p.value)}
                    className={`px-2.5 py-1.5 text-[11px] rounded-xl font-bold transition-all text-left border cursor-pointer ${
                      quickBill === p.value
                        ? 'bg-[#0F172A] text-amber-400 border-slate-700 shadow-xs'
                        : 'bg-white hover:bg-amber-50/60 text-slate-700 border-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Monthly Power Consumption:</span>
                  <strong className="text-slate-900 font-bold">{quickCalc.monthlyUnits} Units / month</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Required Shadow-free Roof:</span>
                  <strong className="text-slate-900 font-bold">~{quickCalc.roofAreaSqFt} Sq.Ft</strong>
                </div>
              </div>
            </div>

            {/* Instant Calculated Output (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* Output 1: Sizing */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Plant</span>
                <span className="text-2xl font-black text-[#0F172A] my-1 tracking-tight">
                  {quickCalc.systemKw} kW
                </span>
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 py-0.5 rounded-md border border-slate-100">
                  {quickCalc.panelCount}x 545Wp Bifacial
                </span>
              </div>

              {/* Output 2: PM Surya Ghar Subsidy */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/90 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">PM Surya Ghar Subsidy</span>
                <span className="text-2xl font-black text-emerald-700 my-1 tracking-tight">
                  -{formatIndianCurrency(quickCalc.subsidyAmount)}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 py-0.5 rounded-md">
                  Direct Bank DBT
                </span>
              </div>

              {/* Output 3: Net Customer Payable */}
              <div className="p-4 bg-[#0F172A] rounded-2xl shadow-md text-white flex flex-col justify-between border border-slate-700">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Net Customer Cost</span>
                <span className="text-xl sm:text-2xl font-black text-white my-1 tracking-tight">
                  {formatIndianCurrency(quickCalc.netPayableCustomer)}
                </span>
                <span className="text-[10px] text-slate-300">Turnkey Installed Cost</span>
              </div>

              {/* Output 4: Payback */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/90 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Est. Simple Payback</span>
                <span className="text-2xl font-black text-amber-800 my-1 tracking-tight">
                  ~{quickCalc.paybackPeriodYears} Yrs
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 py-0.5 rounded-md">
                  Saves {formatIndianCurrency(quickCalc.annualElectricitySavings)}/yr
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Operational Split Views */}
      {role === 'store_field' ? (
        /* STORE / FIELD MOBILE-OPTIMIZED SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Field Tasks (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Assigned Rooftop Field Jobs ({tasks.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                All Tasks <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => {
                const doneChecks = task.checklist.filter((c) => c.done).length;
                const totalChecks = task.checklist.length;
                return (
                  <div
                    key={task.id}
                    onClick={() => setActiveTab('tasks')}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-all cursor-pointer space-y-2.5 hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {task.taskNumber}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">{task.title}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shrink-0 ${
                        task.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : task.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {task.customerName} ({task.city})
                      </span>
                      <span className="text-slate-500 font-medium">Due Date: {task.dueDate}</span>
                    </div>

                    {/* Checklist Bar */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Field Checklist: {doneChecks} of {totalChecks} done
                      </span>
                      <span className="font-bold text-emerald-700">
                        {Math.round((doneChecks / (totalChecks || 1)) * 100)}% Complete
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warehouse Inventory (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <Warehouse className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Live Stock Balances
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                Movement Ledger <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {products.slice(0, 6).map((p) => {
                const isLow = p.stock <= p.minStockAlert;
                return (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-[210px]">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.sku} &bull; Min Buffer: {p.minStockAlert} {p.uom}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                        {p.stock} {p.uom}
                      </span>
                      {isLow && (
                        <span className="block text-[9px] font-bold text-rose-600 uppercase tracking-wider">
                          Low Stock!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onOpenStockModal}
              className="w-full py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Warehouse className="w-4 h-4" />
              <span>Record Stock In (GRN) / Dispatch</span>
            </button>
          </div>
        </div>
      ) : (
        /* SALES & ADMIN OFFICE OVERVIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Follow-up Queue & Client Calls (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Client Follow-Up &amp; Call Queue ({pendingFollowups.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('leads')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                Lead Pipeline <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingFollowups.map((fup) => {
                const isDue = today ? fup.nextFollowUpDate.split('T')[0] <= today : false;
                const leadObj = leads.find((l) => l.id === fup.leadId);

                return (
                  <div
                    key={fup.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isDue ? 'bg-amber-50/70 border-amber-300 shadow-2xs' : 'bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{fup.leadName}</span>
                        {isDue && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase">
                            Due Today
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 capitalize">via {fup.contactMethod}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">{fup.interactionSummary}</p>
                      <p className="text-[11px] text-amber-900 font-semibold flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-amber-600" />
                        Next: {fup.nextAction}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                      {leadObj && (
                        <a
                          href={`https://wa.me/${leadObj.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste ${leadObj.name} ji, regarding your PM Surya Ghar solar inquiry with Systomech Engineers...`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                          title="WhatsApp Follow-up"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          crmStorage.markFollowUpDone(fup.id);
                          alert(`Follow-up completed for ${fup.leadName}`);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
                      >
                        ✓ Mark Done
                      </button>
                    </div>
                  </div>
                );
              })}

              {pendingFollowups.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  All customer follow-ups are up to date! Great job.
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders & Collection Status (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Projects &amp; Revenue Collections
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                All Orders <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Financial Card */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Booked Turnkey Contracts:</span>
                <span className="font-bold text-slate-900">{formatIndianCurrency(totalOrderValue)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Collections Realized (Bank):</span>
                <span>{formatIndianCurrency(totalPaidRevenue)}</span>
              </div>
              <div className="flex justify-between text-rose-700 pt-1.5 border-t border-slate-200 font-bold">
                <span>Pending Balance Due:</span>
                <span>{formatIndianCurrency(totalBalanceDue)}</span>
              </div>

              {/* Visual Progress Bar */}
              <div className="pt-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                  <span>Collection Milestone</span>
                  <span>{collectionPercentage}% Realized</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${collectionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-2.5 text-xs">
              {orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setActiveTab('orders')}
                  className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{o.customerName} ({o.systemKw}kW)</div>
                    <div className="text-[10px] text-slate-500">{o.orderNumber} &bull; Paid: {formatIndianCurrency(o.totalPaid)}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 capitalize border border-emerald-200">
                    {o.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>

            {role === 'admin' && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  System Security &amp; Audit Trail
                </span>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  {auditLogs.slice(0, 2).map((log) => (
                    <div key={log.id} className="truncate">
                      <strong className="text-slate-800">{log.actorName}:</strong> {log.details}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
