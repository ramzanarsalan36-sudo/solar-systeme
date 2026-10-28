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
      const lowCount = products.filter((p) => p.stock <= p.minStockAlert).length;
      setLowStockCount(lowCount);
    }

    refreshAlerts();
    window.addEventListener('systomech_crm_storage_change', refreshAlerts);
    return () => window.removeEventListener('systomech_crm_storage_change', refreshAlerts);
  }, []);

  const totalAlerts = dueFollowUps + (currentUser.role !== 'sales' ? lowStockCount : 0);

  return (
    <header className="sticky top-0 z-40 bg-[#10233F] text-white shadow-md border-b border-[#1b355d] no-print">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#1b355d]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F4B740] to-[#D99B26] flex items-center justify-center shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Sun className="w-5 h-5 text-[#10233F] stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-base sm:text-lg text-white">SYSTOMECH</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[#F4B740] text-[#10233F]">
                    Solar CRM
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 hidden sm:block tracking-wide">
                  Solar EPC &amp; Engineering Operations
                </p>
              </div>
            </div>
          </div>

          {/* Demo Role Switcher (1-Click Segmented Pill) */}
          <div className="hidden md:flex items-center gap-1.5 p-1 bg-[#0A1128]/80 border border-slate-700/80 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5">
              Viewing as:
            </span>
            {[
              { role: 'admin', label: 'Admin', user: INITIAL_USERS[0] },
              { role: 'sales', label: 'Sales / Office', user: INITIAL_USERS[1] },
              { role: 'store_field', label: 'Store / Field', user: INITIAL_USERS[2] },
            ].map((r) => {
              const isCurrent = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => onUserChange(r.user)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-400 text-[#0A1128] shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick action buttons for sales / admin */}
            {currentUser.role !== 'store_field' && (
              <div className="hidden xl:flex items-center gap-2">
                <button
                  onClick={onOpenQuoteModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F4B740] hover:bg-[#D99B26] text-[#10233F] transition-colors shadow-sm cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Bill to Quote</span>
                </button>
                <button
                  onClick={onOpenLeadModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1b355d] hover:bg-[#25497f] text-slate-100 border border-slate-600 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#F4B740]" />
                  <span>New Lead</span>
                </button>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#1b355d] transition-colors"
                title="Operational Notifications"
              >
                <Bell className="w-5 h-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#B91C1C] text-white text-[10px] font-bold flex items-center justify-center">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                      Operations Feed
                    </span>
                    <span className="text-[11px] text-slate-500">Live Status</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto mt-2">
                    {dueFollowUps > 0 && (
                      <div
                        onClick={() => {
                          setActiveTab('leads');
                          setNotificationOpen(false);
                        }}
                        className="py-2 px-1 hover:bg-slate-50 rounded cursor-pointer"
                      >
                        <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          {dueFollowUps} Follow-up{dueFollowUps > 1 ? 's' : ''} Due Today
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Customers awaiting scheduled phone consultation or quote review.
                        </p>
                      </div>
                    )}
                    {lowStockCount > 0 && currentUser.role !== 'sales' && (
                      <div
                        onClick={() => {
                          setActiveTab('inventory');
                          setNotificationOpen(false);
                        }}
                        className="py-2 px-1 hover:bg-slate-50 rounded cursor-pointer"
                      >
                        <p className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          {lowStockCount} Product{lowStockCount > 1 ? 's' : ''} Below Minimum Threshold
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Immediate PO receipt needed to avoid project installation delays.
                        </p>
                      </div>
                    )}
                    {totalAlerts === 0 && (
                      <div className="py-4 text-center text-xs text-slate-500">
                        All operations up to date! No pending overdue alerts.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#1b355d] hover:bg-[#25497f] border border-slate-700 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#F4B740] text-[#10233F] font-bold text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-medium text-white leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-300 capitalize">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role Context
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Review how the CRM adapts permissions and screens per role:
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
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          u.id === currentUser.id ? 'bg-amber-50 text-amber-950 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
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
                      className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 py-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Sample Data
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
