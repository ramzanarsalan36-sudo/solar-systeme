'use client';

import React from 'react';
import { UserRole } from '@/types/crm';
import {
  LayoutDashboard,
  Users,
  Calculator,
  FileSpreadsheet,
  PackageCheck,
  Warehouse,
  Wrench,
  ShieldAlert,
  Boxes,
  Sun,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  hindiLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Overview',
    hindiLabel: 'डैशबोर्ड',
    icon: LayoutDashboard,
    roles: ['admin', 'sales', 'store_field'],
  },
  {
    id: 'leads',
    label: 'Leads & Follow-ups',
    hindiLabel: 'ग्राहक लीड्स & कॉल',
    icon: Users,
    roles: ['admin', 'sales'],
  },
  {
    id: 'calculator',
    label: 'Bill to Solar Quote',
    hindiLabel: 'बिजली बिल से कोटेशन',
    icon: Calculator,
    roles: ['admin', 'sales'],
  },
  {
    id: 'quotations',
    label: 'Quotations Hub',
    hindiLabel: 'कोटेशन लिस्ट',
    icon: FileSpreadsheet,
    roles: ['admin', 'sales'],
  },
  {
    id: 'orders',
    label: 'Orders & Payments',
    hindiLabel: 'ऑर्डर & पेमेंट लिस्ट',
    icon: PackageCheck,
    roles: ['admin', 'sales'],
  },
  {
    id: 'inventory',
    label: 'Stock & Inventory',
    hindiLabel: 'वेयरहाउस स्टॉक',
    icon: Warehouse,
    roles: ['admin', 'store_field'],
  },
  {
    id: 'tasks',
    label: 'Field Tasks & Ops',
    hindiLabel: 'फील्ड काम & इन्सपेक्शन',
    icon: Wrench,
    roles: ['admin', 'store_field'],
  },
  {
    id: 'products',
    label: 'Product Master & Rates',
    hindiLabel: 'प्रोडक्ट & रेट मास्टर',
    icon: Boxes,
    roles: ['admin', 'sales'],
  },
  {
    id: 'audit',
    label: 'Security & Audit Logs',
    hindiLabel: 'सिस्टम ऑडिट लॉग',
    icon: ShieldAlert,
    roles: ['admin'],
  },
];

export function Sidebar({ activeTab, setActiveTab, role, mobileOpen, setMobileOpen }: SidebarProps) {
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 md:hidden no-print"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/90 shadow-sm transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:shrink-0 md:z-10 no-print flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-4 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Operations Workspace
          </div>

          <nav className="px-3 space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-[#10233F] text-white shadow-sm ring-1 ring-[#10233F]'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-[#F4B740] text-[#10233F]'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="leading-tight">{item.label}</div>
                      {item.hindiLabel && (
                        <div
                          className={`text-[10px] font-normal ${
                            isActive ? 'text-amber-300' : 'text-slate-400'
                          }`}
                        >
                          {item.hindiLabel}
                        </div>
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-4 rounded-full bg-[#F4B740]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/80 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-6 h-6 rounded-md bg-[#F4B740] text-[#10233F] flex items-center justify-center">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <span>Systomech Solar EPC</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Pune &bull; Nashik &bull; Mumbai &bull; Thane
          </p>
          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/60 font-semibold text-emerald-800">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PM Surya Ghar Portal
            </span>
            <span>Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
