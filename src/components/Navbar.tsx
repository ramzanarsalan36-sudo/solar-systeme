'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/crm';
import { crmStorage } from '@/lib/storage';
import { INITIAL_USERS } from '@/lib/initial-data';
import { RoleBadge } from './RoleBadge';
import {
  Sun,
  Bell,
  PlusCircle,
  Calculator,
  ChevronDown,
  Menu,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onOpenLeadModal: () => void;
  onOpenQuoteModal: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({
  currentUser,
  onUserChange,
  onOpenLeadModal,
  onOpenQuoteModal,
  mobileMenuOpen,
  setMobileMenuOpen,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dueFollowUps, setDueFollowUps] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  useEffect(() => {
    function refreshAlerts() {
      const followups = crmStorage.getFollowUps().filter((f) => !f.isDone);
      const today = new Date().toISOString().split('T')[0];
      const dueCount = followups.filter((f) => f.nextFollowUpDate.split('T')[0] <= today).length;
      setDueFollowUps(dueCount);

      const products = crmStorage.getProducts();
      const lowCount = products.filter((p) => p.stock <= p.minStockAlert || p.stock < 10).length;
      setLowStockCount(lowCount);
    }

    refreshAlerts();
    window.addEventListener('systomech_crm_storage_change', refreshAlerts);
    return () => window.removeEventListener('systomech_crm_storage_change', refreshAlerts);
  }, []);

  const totalAlerts = dueFollowUps + (currentUser.role !== 'sales' ? lowStockCount : 0);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-xs no-print text-slate-900 transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
                <Sun className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-base sm:text-lg text-[#0B1120]">
                    SYSTOMECH
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                    Solar CRM
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 hidden sm:block tracking-wide font-medium">
                  Rooftop EPC &bull; PM Surya Ghar Operations
                </p>
              </div>
            </div>
          </div>

          {/* Demo Role Switcher Segmented Pill (Prompt Requirement) */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/90 rounded-2xl shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 py-0.5">
              Viewing as:
            </span>
            {[
              { role: 'admin', label: 'Admin', user: INITIAL_USERS[0] },
              { role: 'sales', label: 'Sales / Office', user: INITIAL_USERS[1] },
              { role: 'store_field', label: 'Store / Field Tech', user: INITIAL_USERS[2] },
            ].map((r) => {
              const isCurrent = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => onUserChange(r.user)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#0B1120] text-amber-400 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Radiant Solar Gradient Quick Actions */}
            {currentUser.role !== 'store_field' && (
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={onOpenQuoteModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-98"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>2-Min Quotation</span>
                </button>
                <button
                  onClick={onOpenLeadModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B1120] hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Lead</span>
                </button>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Operational Notifications"
              >
                <Bell className="w-5 h-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 p-3.5 z-50 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Operations Feed
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Live Status
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto mt-2">
                    {dueFollowUps > 0 && (
                      <div
                        onClick={() => {
                          setActiveTab('leads');
                          setNotificationOpen(false);
                        }}
                        className="py-2.5 px-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          {dueFollowUps} Follow-up{dueFollowUps > 1 ? 's' : ''} Due Today
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Customer phone consultation or quote review scheduled.
                        </p>
                      </div>
                    )}
                    {lowStockCount > 0 && currentUser.role !== 'sales' && (
                      <div
                        onClick={() => {
                          setActiveTab('inventory');
                          setNotificationOpen(false);
                        }}
                        className="py-2.5 px-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          {lowStockCount} Product{lowStockCount > 1 ? 's' : ''} Under Minimum Threshold
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Panels/Inverters below 10 units. Create replenishment PO.
                        </p>
                      </div>
                    )}
                    {totalAlerts === 0 && (
                      <div className="py-5 text-center text-xs text-slate-500">
                        All operations up to date! Zero overdue alerts.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0B1120] to-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-bold text-[#0B1120] leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-2.5 z-50 animate-in fade-in-50 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role Context
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Adapt permissions, modules, and workflows:
                    </p>
                  </div>
                  <div className="py-1">
                    {INITIAL_USERS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onUserChange(u);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          u.id === currentUser.id ? 'bg-amber-50 text-amber-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-[10px] text-slate-500">{u.email}</div>
                        </div>
                        <RoleBadge role={u.role} size="sm" />
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2">
                    <button
                      onClick={() => {
                        if (confirm('Reset CRM database to fresh default state?')) {
                          crmStorage.resetAllData();
                        }
                      }}
                      className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1.5 py-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Sample Database</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
