'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/crm';
import { crmStorage } from '@/lib/storage';
import { INITIAL_USERS } from '@/lib/initial-data';
import { RoleBadge } from './RoleBadge';
import {
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [dueFollowUps, setDueFollowUps] = useState<number>(3);
  const [lowStockCount, setLowStockCount] = useState<number>(3);

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

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E8ECF2] shadow-[0_1px_3px_rgba(0,0,0,0.02)] no-print text-slate-800 transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search Bar - Exact Image 2 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads, customers, products..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-amber-400 focus:bg-white focus:outline-hidden transition-all text-slate-700 placeholder:text-slate-400 font-normal"
              />
            </div>
          </div>

          {/* Right Controls: Notifications & User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell with Red Badge '3' */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-semibold flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Notification Popover */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 p-3.5 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-xs text-slate-900">Notifications</span>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs mt-1">
                    <div className="py-2.5">
                      <p className="font-medium text-slate-800">Follow up with Rahul Sharma</p>
                      <p className="text-[10px] text-slate-400">Scheduled for today 10:00 AM</p>
                    </div>
                    <div className="py-2.5">
                      <p className="font-medium text-slate-800">Send quotation to Green Energy Ltd</p>
                      <p className="text-[10px] text-slate-400">Commercial 25kW system quote pending</p>
                    </div>
                    <div className="py-2.5">
                      <p className="font-medium text-slate-800">Low stock: Inverters (5kW)</p>
                      <p className="text-[10px] text-rose-600 font-medium">Only 8 units remaining in warehouse</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile - Hamza Khan / Admin */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-200 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Hamza Khan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-semibold text-slate-800">Hamza Khan</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'sales' ? 'Sales Head' : 'Field Operations'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-2.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role Context
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 font-normal">
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
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          u.id === currentUser.id ? 'bg-amber-50 text-amber-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-900">{u.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{u.email}</div>
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
                      className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1.5 py-1 transition-colors cursor-pointer"
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
