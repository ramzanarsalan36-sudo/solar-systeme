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
  Wrench,
  ArrowRight,
  Calculator,
  PlusCircle,
  Zap,
  Sparkles,
  MapPin,
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

  const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert || p.stock < 10);
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
    <div className="space-y-5">
      {/* Hero Solar EPC Operations Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 sm:p-7 text-white shadow-md border border-slate-700/80">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium bg-amber-500 text-slate-950 shadow-2xs">
                <Sun className="w-3.5 h-3.5 fill-slate-950" />
                Systomech Engineers &bull; Solar EPC
              </span>
              <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
                Maharashtra Central Hub (Pune &amp; Nashik)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              {role === 'admin' && 'Enterprise Solar Operations & Finance'}
              {role === 'sales' && 'Solar Inquiries & PM Surya Ghar Pipeline'}
              {role === 'store_field' && 'Rooftop Site Installations & Warehouse Ledger'}
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xl font-normal">
              {role === 'admin' &&
                'Track Maharashtra rooftop projects, approved vendor prices, milestone bank collections, and material ledger in one system.'}
              {role === 'sales' &&
                'Intake customer leads, convert electricity bills to system sizing in 10 seconds, and share PM Surya Ghar quotes.'}
              {role === 'store_field' &&
                'Manage assigned rooftop structural tasks, complete mobile verification checklists, and audit hardware movement.'}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {role !== 'store_field' ? (
              <>
                <button
                  onClick={onOpenQuoteModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Bill to Solar Quote</span>
                </button>
                <button
                  onClick={onOpenLeadModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Lead</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenStockModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Warehouse className="w-4 h-4 stroke-[2.5]" />
                <span>Record Stock GRN / Dispatch</span>
              </button>
            )}
          </div>
        </div>

        {/* Micro-KPI Bar in Hero */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Pipeline Proposals</span>
            <span className="text-base font-semibold text-white">{quotations.length} Active</span>
            <span className="block text-[11px] text-amber-300 font-medium">{formatIndianCurrency(totalPipelineValue)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Under Execution</span>
            <span className="text-base font-semibold text-white">{orders.length} Rooftop Sites</span>
            <span className="block text-[11px] text-emerald-300 font-medium">{formatIndianCurrency(totalOrderValue)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Govt Subsidy DBT</span>
            <span className="text-base font-semibold text-amber-400">PM Surya Ghar</span>
            <span className="block text-[11px] text-slate-300">Up to ₹78,000 / consumer</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Operating Discoms</span>
            <span className="text-base font-semibold text-white">MSEDCL, Tata Power</span>
            <span className="block text-[11px] text-emerald-300 font-medium">Net-metering synchronized</span>
          </div>
        </div>
      </div>

      {/* 4 Interactive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Leads */}
        <div
          onClick={() => setActiveTab(role === 'store_field' ? 'tasks' : 'leads')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {role === 'store_field' ? 'Field Site Tasks' : 'Active Inquiries'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center transition-transform shadow-2xs">
              {role === 'store_field' ? <Wrench className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900">
              {role === 'store_field' ? pendingTasks.length : activeLeads.length}
            </span>
            <span className="text-[11px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-normal">
            {role === 'store_field' ? 'Pending surveys & mountings' : 'Leads in sales pipeline'}
          </p>
        </div>

        {/* Card 2: Quotations / Stock SKUs */}
        <div
          onClick={() => setActiveTab(role === 'store_field' ? 'inventory' : 'quotations')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {role === 'store_field' ? 'Master Hardware' : 'Quotations Pipeline'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center transition-transform shadow-2xs">
              {role === 'store_field' ? <Warehouse className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900">
              {role === 'store_field' ? products.length : quotations.length}
            </span>
            <span className="text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
              {role === 'store_field' ? 'SKUs' : `${formatIndianCurrency(totalPipelineValue)}`}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-normal">
            {role === 'store_field' ? 'Panels, inverters & structures' : 'Proposals with locked price'}
          </p>
        </div>

        {/* Card 3: Orders & Collections */}
        <div
          onClick={() => setActiveTab('orders')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {role === 'store_field' ? 'Live Plants' : 'Projects Booked'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform shadow-2xs">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900">{orders.length}</span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {formatIndianCurrency(totalPaidRevenue)} Paid
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-normal">
            {formatIndianCurrency(totalBalanceDue)} balance due
          </p>
        </div>

        {/* Card 4: Action Alerts */}
        <div
          onClick={() => setActiveTab(role === 'sales' ? 'leads' : 'inventory')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className={`h-1 w-full absolute top-0 left-0 ${
            (role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0
              ? 'bg-gradient-to-r from-rose-500 to-red-600'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`} />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {role === 'sales' ? 'Follow-ups Due Today' : 'Low Stock Alerts'}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform shadow-2xs ${
                (role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900">
              {role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                (role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {(role === 'sales' ? dueTodayFollowups.length : lowStockProducts.length) > 0 ? 'Action Needed' : 'Normal'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-normal">
            {role === 'sales'
              ? `${pendingFollowups.length} scheduled client calls`
              : `${lowStockProducts.length} items below minimum`}
          </p>
        </div>
      </div>

      {/* DASHBOARD WIDGET: 10-Second Rooftop Sizing & Subsidy Calculator */}
      {role !== 'store_field' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-medium">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                    Quick Bill-to-Solar Sizing &amp; Subsidy Calculator
                  </h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    PM Surya Ghar DBT
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Instant sizing estimate based on client&apos;s monthly electricity bill
                </p>
              </div>
            </div>

            <button
              onClick={onOpenQuoteModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
            >
              <span>Full Proposal Modal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
            {/* Input Slider */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Monthly Electricity Bill:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-slate-500">₹</span>
                  <input
                    type="number"
                    step="100"
                    min="1000"
                    max="50000"
                    value={quickBill}
                    onChange={(e) => setQuickBill(Number(e.target.value))}
                    className="w-24 px-2 py-1 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg text-right focus:border-amber-500 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-500 font-medium">/mo</span>
                </div>
              </div>

              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={quickBill}
                onChange={(e) => setQuickBill(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />

              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹1,000/mo</span>
                <span>₹5,000/mo</span>
                <span>₹15,000/mo</span>
                <span>₹25,000/mo</span>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Estimated Monthly Units:</span>
                  <span className="font-medium text-slate-900">{quickCalc.monthlyUnits} Units/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Shadow-Free Roof:</span>
                  <span className="font-medium text-slate-900">~{quickCalc.roofAreaSqFt} sq.ft</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[10px] font-medium text-slate-500 uppercase">Recommended Plant</span>
                <span className="text-lg sm:text-xl font-bold text-slate-900 my-1">
                  {quickCalc.systemKw} kW
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {quickCalc.panelCount}x 545Wp Modules
                </span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col justify-between">
                <span className="text-[10px] font-medium text-emerald-800 uppercase">PM Surya Ghar Subsidy</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-700 my-1">
                  -{formatIndianCurrency(quickCalc.subsidyAmount)}
                </span>
                <span className="text-[10px] font-medium text-emerald-700">Direct DBT to Customer</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl text-white flex flex-col justify-between shadow-2xs">
                <span className="text-[10px] font-medium text-amber-400 uppercase">Net Customer Payable</span>
                <span className="text-base sm:text-lg font-bold text-white my-1">
                  {formatIndianCurrency(quickCalc.netPayableCustomer)}
                </span>
                <span className="text-[10px] text-slate-300 font-normal">Turnkey Cost</span>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-col justify-between">
                <span className="text-[10px] font-medium text-amber-900 uppercase">Est. Payback</span>
                <span className="text-lg sm:text-xl font-bold text-amber-800 my-1">
                  ~{quickCalc.paybackPeriodYears} Yrs
                </span>
                <span className="text-[10px] font-medium text-emerald-700">
                  Saves {formatIndianCurrency(quickCalc.annualElectricitySavings)}/yr
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Operational Split Views */}
      {role === 'store_field' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Active Field Tasks */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-sm text-slate-900">
                  Assigned Field Jobs ({tasks.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
              >
                All Tasks <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => {
                const doneChecks = task.checklist.filter((c) => c.done).length;
                const totalChecks = task.checklist.length;
                return (
                  <div
                    key={task.id}
                    onClick={() => setActiveTab('tasks')}
                    className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 transition-colors cursor-pointer space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {task.taskNumber}
                        </span>
                        <h4 className="font-semibold text-xs text-slate-900 mt-1">{task.title}</h4>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${
                        task.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : task.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-1.5">
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {task.customerName} ({task.city})
                      </span>
                      <span className="text-slate-500 text-[11px]">Due: {task.dueDate}</span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Field Checklist: {doneChecks} of {totalChecks} done
                      </span>
                      <span className="font-medium text-emerald-700">
                        {Math.round((doneChecks / (totalChecks || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warehouse Inventory */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-sm text-slate-900">
                  Live Stock Balances
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
              >
                Inventory <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {products.slice(0, 6).map((p) => {
                const isLow = p.stock <= p.minStockAlert || p.stock < 10;
                return (
                  <div key={p.id} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.sku} &bull; Min: {p.minStockAlert} {p.uom}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                        {p.stock} {p.uom}
                      </span>
                      {isLow && (
                        <span className="block text-[9px] font-medium text-rose-600 uppercase">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onOpenStockModal}
              className="w-full py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Record Stock In / Out</span>
            </button>
          </div>
        </div>
      ) : (
        /* SALES & ADMIN OFFICE OVERVIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Follow-up Queue & Client Calls */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-sm text-slate-900">
                  Client Follow-Up Queue ({pendingFollowups.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('leads')}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
              >
                Lead Pipeline <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingFollowups.map((fup) => {
                const isDue = today ? fup.nextFollowUpDate.split('T')[0] <= today : false;
                const leadObj = leads.find((l) => l.id === fup.leadId);

                return (
                  <div
                    key={fup.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                      isDue ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{fup.leadName}</span>
                        {isDue && (
                          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase">
                            Due Today
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 capitalize">via {fup.contactMethod}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">{fup.interactionSummary}</p>
                      <p className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-amber-600" />
                        <span>Next: {fup.nextAction}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                      {leadObj && (
                        <a
                          href={`https://wa.me/${leadObj.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Namaste ${leadObj.name} ji, regarding your rooftop solar consultation with Systomech Engineers...`
                          )}`}
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
                        }}
                        className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 rounded-lg transition-colors cursor-pointer"
                      >
                        ✓ Done
                      </button>
                    </div>
                  </div>
                );
              })}

              {pendingFollowups.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  All customer follow-ups are up to date!
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders & Collection Status */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-sm text-slate-900">
                  Revenue Collections
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
              >
                All Orders <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Booked Contracts:</span>
                <span className="font-semibold text-slate-900">{formatIndianCurrency(totalOrderValue)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Collections Realized (Bank):</span>
                <span className="font-semibold">{formatIndianCurrency(totalPaidRevenue)}</span>
              </div>
              <div className="flex justify-between text-rose-700 pt-1.5 border-t border-slate-200">
                <span>Pending Balance Due:</span>
                <span className="font-semibold">{formatIndianCurrency(totalBalanceDue)}</span>
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

            <div className="space-y-2 text-xs">
              {orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setActiveTab('orders')}
                  className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-900">{o.customerName} ({o.systemKw}kW)</div>
                    <div className="text-[10px] text-slate-500">{o.orderNumber} &bull; Paid: {formatIndianCurrency(o.totalPaid)}</div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 capitalize border border-emerald-200">
                    {o.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>

            {role === 'admin' && (
              <div className="pt-2.5 border-t border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Audit Trail
                </span>
                <div className="space-y-1 text-[11px] text-slate-600">
                  {auditLogs.slice(0, 2).map((log) => (
                    <div key={log.id} className="truncate">
                      <span className="font-medium text-slate-800">{log.actorName}:</span> {log.details}
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