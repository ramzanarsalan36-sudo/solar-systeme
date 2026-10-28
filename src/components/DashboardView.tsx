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

  return (
    <div className="space-y-6">
      {/* Role Demonstration & Quick Persona Switcher Bar */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-2xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F4B740] text-[#10233F] flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Multi-Role Persona Switcher</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                Active: {role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Click to instantly preview how screens and permissions adapt for each team member:
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isCurrent
                    ? 'bg-[#10233F] text-[#F4B740] shadow-sm ring-2 ring-amber-400'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                }`}
              >
                <span>{u.role === 'admin' ? '👑 Admin' : u.role === 'sales' ? '💼 Sales / Office' : '🔧 Store / Field'}</span>
                <span className="text-[10px] opacity-75 font-normal">({u.name.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Hero Cockpit Banner with Real Rooftop Array Photo */}
      <div className="relative overflow-hidden bg-[#0B1120] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        {/* Real Context Background Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80")',
          }}
        />
        {/* Radiant Solar Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-amber-400 text-slate-950 shadow-xs">
                <Sun className="w-3.5 h-3.5 fill-slate-950" />
                SYSTOMECH ENGINEERS &bull; SOLAR EPC
              </span>
              <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                Maharashtra Central Hub (Pune &amp; Nashik)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {role === 'admin' && 'Enterprise Solar Command Center'}
              {role === 'sales' && 'Solar Inquiries & PM Surya Ghar Quoting'}
              {role === 'store_field' && 'Rooftop Field Installations & Warehouse Stock'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {role === 'admin' &&
                'Track live Maharashtra rooftop projects, approved component prices, milestone collections, and inventory balances in one unified system.'}
              {role === 'sales' &&
                'Capture customer calls & WhatsApp inquiries, size rooftop systems from electricity bills in seconds, and share instant PDF quotes.'}
              {role === 'store_field' &&
                'Manage assigned rooftop mounting jobs, verify checklist inspections on mobile, and record stock receipts and dispatches.'}
            </p>
          </div>

          {/* Action CTAs with Radiant Solar Gradient */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {role !== 'store_field' ? (
              <>
                <button
                  onClick={onOpenQuoteModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-102"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Bill to Quote (2 Mins)</span>
                </button>
                <button
                  onClick={onOpenLeadModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>+ New Lead</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenStockModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-102"
              >
                <Warehouse className="w-4 h-4" />
                <span>Record Stock Movement</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Micro-KPI Bar in Hero */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Active System Pipeline</span>
            <span className="text-base sm:text-lg font-bold text-white">{quotations.length} Proposals</span>
            <span className="block text-[10px] text-amber-300 font-medium">{formatIndianCurrency(totalPipelineValue)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Under Execution</span>
            <span className="text-base sm:text-lg font-bold text-white">{orders.length} Rooftop Sites</span>
            <span className="block text-[10px] text-emerald-300 font-medium">{formatIndianCurrency(totalOrderValue)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Govt Subsidy Disbursal</span>
            <span className="text-base sm:text-lg font-bold text-amber-400">PM Surya Ghar</span>
            <span className="block text-[10px] text-slate-300">Up to ₹78,000 / Consumer</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Operating Discoms</span>
            <span className="text-base sm:text-lg font-bold text-white">MSEDCL, Tata, Adani</span>
            <span className="block text-[10px] text-emerald-300 font-medium">Net-metering active</span>
          </div>
        </div>
      </div>

      {/* 4 Interactive KPI Cards with Visual Elevation (Pure White Floating Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Leads */}
        <div
          onClick={() => setActiveTab(role === 'store_field' ? 'tasks' : 'leads')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:border-amber-400/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {role === 'store_field' ? 'Field Site Tasks' : 'Active Inquiries'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              {role === 'store_field' ? <Wrench className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {role === 'store_field' ? pendingTasks.length : activeLeads.length}
            </span>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {role === 'store_field' ? 'Surveys & site mountings' : 'Enquiries from Calls & WhatsApp'}
          </p>
        </div>

        {/* Card 2: Quotations / Catalog */}
        <div
          onClick={() => setActiveTab(role === 'store_field' ? 'inventory' : 'quotations')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:border-amber-400/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {role === 'store_field' ? 'Products In Stock' : 'Quotations Pipeline'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              {role === 'store_field' ? <Warehouse className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {role === 'store_field' ? products.length : quotations.length}
            </span>
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
              {role === 'store_field' ? 'Master SKUs' : `${formatIndianCurrency(totalPipelineValue)}`}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {role === 'store_field' ? 'Tier-1 panels, inverters & BOS' : 'Preserved price snapshots'}
          </p>
        </div>

        {/* Card 3: Orders & Collections */}
        <div
          onClick={() => setActiveTab('orders')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:border-amber-400/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {role === 'store_field' ? 'Commissioned Plants' : 'Projects Booked'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{orders.length}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {formatIndianCurrency(totalPaidRevenue)} Paid
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {formatIndianCurrency(totalBalanceDue)} balance pending
          </p>
        </div>

        {/* Card 4: Action Alerts */}
        <div
          onClick={() => setActiveTab(role === 'sales' ? 'leads' : 'inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:border-amber-400/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {role === 'sales' ? 'Follow-ups Due Today' : 'Low Stock Alerts'}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs ${
              (role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              (role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0
                ? 'bg-rose-100 text-rose-800'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold'
            }`}>
              {(role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0 ? 'Urgent Action' : 'All Clear'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {role === 'sales'
              ? `${pendingFollowups.length} scheduled client calls`
              : `${lowStockProducts.length} items below minimum threshold`}
          </p>
        </div>
      </div>

      {/* DASHBOARD WIDGET: Instant 10-Second Solar Bill & Subsidy Sizer */}
      {role !== 'store_field' && (
        <div className="bg-gradient-to-r from-white via-amber-50/40 to-white rounded-3xl border-2 border-amber-300/80 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#10233F] text-[#F4B740] flex items-center justify-center font-black shadow-sm">
                <Zap className="w-5 h-5 fill-[#F4B740]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Instant 10-Second Rooftop Sizing &amp; Subsidy Calculator
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10233F] text-[#F4B740]">
                    PM Surya Ghar 2026
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Slide or enter client’s monthly electricity bill to calculate plant capacity, subsidy benefit, and net customer payable.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenQuoteModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#10233F] text-[#F4B740] hover:bg-[#1b355d] transition-all shadow-sm shrink-0"
            >
              <span>Full Proposal Modal &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5">
            {/* Input Slider (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Monthly Electricity Bill:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    step="100"
                    min="1000"
                    max="50000"
                    value={quickBill}
                    onChange={(e) => setQuickBill(Number(e.target.value))}
                    className="w-24 px-2 py-1 text-sm font-black text-slate-900 bg-white border border-slate-300 rounded-lg text-right focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
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
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F4B740]"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>₹1,000/mo (Small)</span>
                <span>₹5,000/mo (Standard)</span>
                <span>₹15,000/mo (Large)</span>
                <span>₹25,000/mo</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Consumption Benchmark:</span>
                  <strong className="text-slate-800">{quickCalc.monthlyUnits} Units / month</strong>
                </div>
                <div className="flex justify-between">
                  <span>Required Roof Area:</span>
                  <strong className="text-slate-800">~{quickCalc.roofAreaSqFt} Sq.Ft shadow-free</strong>
                </div>
              </div>
            </div>

            {/* Instant Calculated Output (7 cols) */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* Output 1: Sizing */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Recommended Plant</span>
                <span className="text-xl font-black text-[#10233F] my-1">
                  {quickCalc.systemKw} kW
                </span>
                <span className="text-[10px] font-semibold text-slate-600">
                  {quickCalc.panelCount}x 545Wp Bifacial
                </span>
              </div>

              {/* Output 2: PM Surya Ghar Subsidy */}
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">PM Surya Ghar Subsidy</span>
                <span className="text-xl font-black text-emerald-700 my-1">
                  -{formatIndianCurrency(quickCalc.subsidyAmount)}
                </span>
                <span className="text-[10px] font-bold text-emerald-800">Direct DBT to A/c</span>
              </div>

              {/* Output 3: Net Customer Payable */}
              <div className="p-3.5 bg-[#10233F] rounded-2xl shadow-sm text-white flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#F4B740] uppercase">Net Customer Payable</span>
                <span className="text-lg sm:text-xl font-black text-white my-1">
                  {formatIndianCurrency(quickCalc.netPayableCustomer)}
                </span>
                <span className="text-[10px] text-slate-300">Total Turnkey Cost</span>
              </div>

              {/* Output 4: Payback */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-amber-900 uppercase">Est. Simple Payback</span>
                <span className="text-xl font-black text-amber-800 my-1">
                  ~{quickCalc.paybackPeriodYears} Yrs
                </span>
                <span className="text-[10px] font-bold text-emerald-700">
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
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Assigned Rooftop Field Jobs ({tasks.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
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
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                          {task.taskNumber}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">{task.title}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shrink-0 ${
                        task.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
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
                      <span className="text-slate-500 font-medium">Due: {task.dueDate}</span>
                    </div>

                    {/* Checklist Bar */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Checklist: {doneChecks} of {totalChecks} done
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
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Live Stock Balances
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
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
                      <p className="text-[10px] text-slate-400">{p.sku} &bull; Min: {p.minStockAlert} {p.uom}</p>
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
              className="w-full py-2.5 text-xs font-bold text-[#10233F] bg-[#F4B740] hover:bg-[#D99B26] rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
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
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Client Follow-Up &amp; Call Queue ({pendingFollowups.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('leads')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
              >
                Lead CRM <ArrowRight className="w-3.5 h-3.5" />
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
                      isDue ? 'bg-amber-50/70 border-amber-300 shadow-2xs' : 'bg-slate-50 border-slate-200'
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
                        <span className="text-[10px] text-slate-400 capitalize">via {fup.contactMethod}</span>
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
                          href={`https://wa.me/${leadObj.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste ${leadObj.name} ji, regarding your solar consultation with Systomech Engineers...`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
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
                        className="px-3 py-1 text-xs font-bold bg-white border border-slate-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 rounded-lg transition-colors shadow-2xs"
                      >
                        ✓ Mark Done
                      </button>
                    </div>
                  </div>
                );
              })}

              {pendingFollowups.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  All customer follow-ups up to date! Great job.
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders & Collection Status (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Projects &amp; Revenue Collections
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
              >
                All Orders <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Financial Card */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-2xl border border-slate-200 space-y-2 text-xs">
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
