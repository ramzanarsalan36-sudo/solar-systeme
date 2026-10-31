'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '@/types/crm';
import { crmStorage } from '@/lib/storage';
import { INITIAL_USERS } from '@/lib/initial-data';
import { RoleBadge } from './RoleBadge';
import { soundManager } from '@/lib/sound';
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
  Volume2,
  VolumeX,
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
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSoundEnabled(soundManager.isEnabled());

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

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    soundManager.setEnabled(newState);
    setSoundEnabled(newState);
    if (newState) {
      soundManager.playPaytmChime();
    }
  };

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

  // Quick Autocomplete items
  const matchingLeads = searchQuery.trim()
    ? crmStorage
        .getLeads()
        .filter(
          (l) =>
            l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.phone.includes(searchQuery) ||
            l.city.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const matchingQuotes = searchQuery.trim()
    ? crmStorage
        .getQuotations()
        .filter(
          (q) =>
            q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const matchingProducts = searchQuery.trim()
    ? crmStorage
        .getProducts()
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const totalResults = matchingLeads.length + matchingQuotes.length + matchingProducts.length;
  const totalAlerts = dueFollowUps + (currentUser.role !== 'sales' ? lowStockCount : 0);

  return (
    <header className="sticky top-0 z-30 bg-[#002E6E] text-white shadow-md border-b border-[#002354] no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                soundManager.playSoftClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => {
                soundManager.playSoftClick();
                setActiveTab('dashboard');
              }}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#00BAF2] flex items-center justify-center shadow-md text-white font-bold">
                <Sun className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-sm sm:text-base text-white">
                    Systomech
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-[#00BAF2] text-white">
                    Solar CRM
                  </span>
                </div>
                <p className="text-[10px] text-white/60 hidden sm:block font-normal">
                  PM Surya Ghar &bull; Maharashtra EPC
                </p>
              </div>
            </div>
          </div>

          {/* Unified Global Search Bar (Paytm Crisp White Input) */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xs sm:max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, quotes, inventory..."
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-xl border border-transparent bg-white focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/30 focus:outline-hidden text-[#0F1E36] placeholder:text-slate-400 shadow-xs transition-all"
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
              <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-[#E1EBF5] text-xs py-2 z-50 max-h-80 overflow-y-auto text-[#0F1E36]">
                {totalResults === 0 ? (
                  <div className="p-3 text-center text-slate-500">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <>
                    {matchingLeads.length > 0 && (
                      <div className="px-3 py-1">
                        <div className="text-[10px] uppercase font-semibold text-[#00BAF2] tracking-wider mb-1">
                          Leads
                        </div>
                        {matchingLeads.map((l) => (
                          <div
                            key={l.id}
                            onClick={() => {
                              soundManager.playSoftClick();
                              setActiveTab('leads');
                              setSearchFocused(false);
                            }}
                            className="p-2 hover:bg-[#F4F7FC] rounded-lg cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-medium text-[#0F1E36]">{l.name}</span>
                            <span className="text-[11px] text-[#5B6E88]">{l.phone} &bull; {l.city}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {matchingQuotes.length > 0 && (
                      <div className="px-3 py-1 border-t border-[#E1EBF5]">
                        <div className="text-[10px] uppercase font-semibold text-[#00BAF2] tracking-wider mb-1">
                          Quotations
                        </div>
                        {matchingQuotes.map((q) => (
                          <div
                            key={q.id}
                            onClick={() => {
                              soundManager.playSoftClick();
                              setActiveTab('quotations');
                              setSearchFocused(false);
                            }}
                            className="p-2 hover:bg-[#F4F7FC] rounded-lg cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-medium text-[#0F1E36]">{q.customerName} ({q.systemKw} kW)</span>
                            <span className="text-[11px] text-[#5B6E88]">{q.quoteNumber}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {matchingProducts.length > 0 && (
                      <div className="px-3 py-1 border-t border-[#E1EBF5]">
                        <div className="text-[10px] uppercase font-semibold text-[#00BAF2] tracking-wider mb-1">
                          Products
                        </div>
                        {matchingProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              soundManager.playSoftClick();
                              setActiveTab('inventory');
                              setSearchFocused(false);
                            }}
                            className="p-2 hover:bg-[#F4F7FC] rounded-lg cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-medium text-[#0F1E36]">{p.name}</span>
                            <span className="text-[11px] text-[#5B6E88]">{p.stock} in stock</span>
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
          <div className="hidden lg:flex items-center gap-1 p-1 bg-white/10 border border-white/15 rounded-xl">
            <span className="text-[11px] font-medium text-white/70 px-2">Role:</span>
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
                  onClick={() => {
                    soundManager.playSoftClick();
                    onUserChange(r.user);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white text-[#002E6E] shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Quick Actions, Sound & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Paytm Sound Chime Toggle Button */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                soundEnabled
                  ? 'bg-[#00BAF2]/20 text-[#00BAF2] hover:bg-[#00BAF2]/30 border border-[#00BAF2]/40'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={soundEnabled ? 'Paytm Sound FX On (Click to Mute)' : 'Paytm Sound FX Muted (Click to Enable)'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00BAF2]" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[10px] font-semibold hidden xl:inline">
                {soundEnabled ? 'Sound' : 'Muted'}
              </span>
            </button>

            {/* Quick action buttons (Paytm Cyan & White) */}
            {currentUser.role !== 'store_field' && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    soundManager.playSoftClick();
                    onOpenQuoteModal();
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-xs transition-colors cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#00BAF2]" />
                  <span>Solar Quote</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playSoftClick();
                    onOpenLeadModal();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#00BAF2] hover:bg-[#00A6DA] text-white shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Lead</span>
                  <span className="sm:hidden">Lead</span>
                </button>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  soundManager.playSoftClick();
                  setNotificationOpen(!notificationOpen);
                }}
                className="relative p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FFA400] text-[#002E6E] text-[9px] font-bold flex items-center justify-center">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#E1EBF5] text-[#0F1E36] p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E1EBF5]">
                    <span className="font-semibold text-xs text-[#002E6E]">
                      Live Notifications
                    </span>
                    <span className="text-[10px] font-semibold text-[#008A3F] bg-[#E7F9F0] px-2 py-0.5 rounded-full">
                      Paytm Live
                    </span>
                  </div>
                  <div className="divide-y divide-[#E1EBF5] max-h-60 overflow-y-auto mt-1">
                    {dueFollowUps > 0 && (
                      <div
                        onClick={() => {
                          soundManager.playSoftClick();
                          setActiveTab('leads');
                          setNotificationOpen(false);
                        }}
                        className="py-2.5 px-1 hover:bg-[#F4F7FC] rounded-lg cursor-pointer"
                      >
                        <p className="text-xs font-medium text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#FFA400] shrink-0" />
                          <span>{dueFollowUps} Follow-up{dueFollowUps > 1 ? 's' : ''} Due Today</span>
                        </p>
                        <p className="text-[11px] text-[#5B6E88] mt-0.5">
                          Customer phone consultation scheduled.
                        </p>
                      </div>
                    )}
                    {lowStockCount > 0 && currentUser.role !== 'sales' && (
                      <div
                        onClick={() => {
                          soundManager.playSoftClick();
                          setActiveTab('inventory');
                          setNotificationOpen(false);
                        }}
                        className="py-2.5 px-1 hover:bg-[#F4F7FC] rounded-lg cursor-pointer"
                      >
                        <p className="text-xs font-medium text-rose-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{lowStockCount} Products Below Min Stock</span>
                        </p>
                        <p className="text-[11px] text-[#5B6E88] mt-0.5">
                          Inventory reorder needed for panels / inverters.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#00BAF2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="hidden xl:block">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-white/70 capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/60 hidden xl:block" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E1EBF5] text-[#0F1E36] p-2 z-50">
                  <div className="p-2 border-b border-[#E1EBF5]">
                    <p className="text-xs font-semibold text-[#002E6E]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#5B6E88]">{currentUser.email}</p>
                    <div className="mt-1.5">
                      <RoleBadge role={currentUser.role} size="sm" />
                    </div>
                  </div>

                  <div className="py-1">
                    <span className="block px-2 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      Switch Role Profile
                    </span>
                    {INITIAL_USERS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          soundManager.playPaytmChime();
                          onUserChange(u);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                          currentUser.id === u.id ? 'bg-[#E8F8FE] text-[#002E6E] font-semibold' : 'hover:bg-[#F4F7FC] text-[#5B6E88]'
                        }`}
                      >
                        <span>{u.name}</span>
                        <span className="text-[10px] uppercase font-mono text-[#8C9EB5]">{u.role}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-[#E1EBF5]">
                    <button
                      onClick={() => {
                        if (confirm('Reset all CRM data to initial demonstration state?')) {
                          crmStorage.resetAllData();
                          soundManager.playPaytmChime();
                          window.location.reload();
                        }
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Demo Data</span>
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
