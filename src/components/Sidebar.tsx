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
  CheckCircle2,
  Sparkles,
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
    label: 'Leads Pipeline',
    hindiLabel: 'ग्राहक लीड्स & कानबन',
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
    hindiLabel: 'कोटेशन लिस्ट & PDF',
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
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 md:hidden no-print"
        />
      )}

      {/* Sidebar Panel with Deep Obsidian Slate (#0B1120) */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-[#0B1120] text-slate-300 border-r border-slate-800/90 shadow-2xl transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:shrink-0 md:z-10 no-print flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 pb-2.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>Operations Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-[#0B1120] shadow-sm shadow-amber-500/30 font-bold'
                          : 'bg-slate-800/80 text-slate-400 group-hover:bg-slate-700 group-hover:text-amber-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className={`leading-tight font-medium ${isActive ? 'text-white font-bold' : ''}`}>
                        {item.label}
                      </div>
                      {item.hindiLabel && (
                        <div
                          className={`text-[10px] font-normal ${
                            isActive ? 'text-amber-400/90' : 'text-slate-500'
                          }`}
                        >
                          {item.hindiLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gold/Amber Active Indicator Pill */}
                  {isActive && (
                    <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 shadow-xs shadow-amber-400/50" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-[#111A2E] border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-[#0B1120] flex items-center justify-center shadow-xs">
              <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-xs tracking-tight">Systomech Solar EPC</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Pune &bull; Nashik &bull; Mumbai &bull; Thane
          </p>
          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800 font-semibold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PM Surya Ghar DBT
            </span>
            <span className="text-slate-400">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
