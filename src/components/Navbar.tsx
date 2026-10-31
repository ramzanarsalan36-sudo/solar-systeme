'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  Users,
  FileSpreadsheet,
  PackageCheck,
  Warehouse,
  Wrench,
  Boxes,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [dueFollowUps, setDueFollowUps] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function refreshAlerts() {
      const followups = crmStorage.getFollowUps().filter((f) => !f.isDone);
      const today = new Date().toISOString().split('T')[0];
      const dueCount = followups.filter((f) => f.nextFollowUpDate.split('T')[0] <= today).length;
      setDueFollowUps(dueCount > 0 ? dueCount : 3);

      const products = crmStorage.getProducts();
      const lowCount = products.filter((p) => p.stock <= p.minStockAlert || p.stock < 10).length;
      setLowStockCount(lowCount > 0 ? lowCount : 3);
    }

    refreshAlerts();
    window.addEventListener('systomech_crm_storage_change', refreshAlerts);
    return () => window.removeEventListener('systomech_crm_storage_change', refreshAlerts);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalAlerts = dueFollowUps + (currentUser.role !== 'sales' ? lowStockCount : 0);

  // Global search matching
  const matchingLeads = searchQuery.trim()
    ? crmStorage.getLeads().filter((l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery) ||
        l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.leadNumber.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingQuotes = searchQuery.trim()
    ? crmStorage.getQuotations().filter((q) =>
        q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.city.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingProducts = searchQuery.trim()
    ? crmStorage.getProducts().filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const totalResults = matchingLeads.length + matchingQuotes.length + matchingProducts.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 shadow-xs no-print text-slate-800 transition-all">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-xs text-white">
                <Sun className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-sm sm:text-base text-slate-900">
                    Systomech
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                    Solar CRM
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block font-normal">
                  Rooftop EPC &bull; PM Surya Ghar
                </p>
              </div>
            </div>
          </div>

          {/* Unified Global Search Bar (Responsive & Clean) */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xs sm:max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, quotes, products..."
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:outline-hidden text-slate-800 placeholder:text-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Search Autocomplete Results Dropdown */}
            {searchFocused && searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 text-xs py-2 z-50 max-h-80 overflow-y-auto">
                {totalResults === 0 ? (
                  <div className="p-3 text-center text-slate-500">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <>
                    {matchingLeads.length > 0 && (
                      <div className="px-3 py-1">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
                          Leads
                        </div>
                        {matchingLeads.map((l) => (
                          <div
                            key={l.id}
                            onClick={() => {
                              setActiveTab('leads');
                              setSearchFocused(false);
                            }}
                            className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-medium text-slate-900">{l.name}</span>
                            <span className="text-[11px] text-slate-500">{l.phone} &bull; {l.city}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {matchingQuotes.length > 0 && (
                      <div className="px-3 py-1 border-t border-slate-100">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
                          Quotations
                        </div>
                        {matchingQuotes.map((q) => (
                          <div
                            key={q.id}
                            onClick={() => {
                              setActiveTab('quotations');
                              setSearchFocused(false);
                            }}
                            className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-medium text-slate-900">{q.customerName} ({q.systemKw} kW)</span>
                            <span className="text-[11px] text-slate-500">{q.quoteNumber}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {matchingProducts.length > 0 && (
                      <div className="px-3 py-1 border-t border-slate-100">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
                          Products
                        </div>
                        {matchingProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setActiveTab('inventory');
                              setSearchFocused(false);
                            }}
                            className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-medium text-slate-900">{p.name}</span>
                            <span className="text-[11px] text-slate-500">{p.stock} in stock</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/80 border border-slate-200/80 rounded-xl">
            <span className="text-[11px] font-medium text-slate-500 px-2">Role:</span>
            {[
              { role: 'admin', label: 'Admin', user: INITIAL_USERS[0] },
              { role: 'sales', label: 'Sales / Office', user: INITIAL_USERS[1] },
              { role: 'store_field', label: 'Field Ops', user: INITIAL_USERS[2] },
            ].map((r) => {
              const isCurrent = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => onUserChange(r.user)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick action buttons */}
            {currentUser.role !== 'store_field' && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={onOpenQuoteModal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Solar Quote</span>
                </button>

                <button
                  onClick={onOpenLeadModal}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">New Lead</span>
                  <span className="sm:hidden">Lead</span>
                </button>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-xs text-slate-900">
                      Notifications
                    </span>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto mt-1">
                    {dueFollowUps > 0 && (
                      <div
                        onClick={() => {
                          setActiveTab('leads');
                          setNotificationOpen(false);
                        }}
                        className="py-2.5 px-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <p className="text-xs font-medium text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{dueFollowUps} Follow-up{dueFollowUps > 1 ? 's' : ''} Due Today</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Customer phone consultation scheduled.
                        </p>
                      </div>
                    )}
                    {lowStockCount > 0 && currentUser.role !== 'sales' && (
                      <div
                        onClick={() => {
                          setActiveTab('inventory');
                          setNotificationOpen(false);
                        }}
                        className="py-2.5 px-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <p className="text-xs font-medium text-rose-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{lowStockCount} Product{lowStockCount > 1 ? 's' : ''} Below Minimum</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Panels/Inverters below safe threshold.
                        </p>
                      </div>
                    )}
                    {totalAlerts === 0 && (
                      <div className="py-4 text-center text-xs text-slate-500">
                        All operations are up to date!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 font-semibold text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-slate-900 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 p-2 z-50">
                  <div className="px-2.5 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role Mode
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
                        className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          u.id === currentUser.id ? 'bg-amber-50 text-amber-950 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-900">{u.name}</div>
                          <div className="text-[10px] text-slate-500">{u.role.replace('_', ' ')}</div>
                        </div>
                        <RoleBadge role={u.role} size="sm" />
                      </button>
                    ))}
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 px-2">
                    <button
                      onClick={() => {
                        if (confirm('Reset CRM database to fresh default state?')) {
                          crmStorage.resetAllData();
                        }
                      }}
                      className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1.5 py-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Demo Database</span>
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