'use client';

import React from 'react';
import { UserRole } from '@/types/crm';
import { soundManager } from '@/lib/sound';
import {
  LayoutDashboard,
  Users,
  Calculator,
  FileSpreadsheet,
  PackageCheck,
  Warehouse,
  Wrench,
  Boxes,
  ShieldAlert,
  Sun,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Overview Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'sales', 'store_field'],
  },
  {
    id: 'leads',
    label: 'Solar Leads Pipeline',
    icon: Users,
    roles: ['admin', 'sales'],
  },
  {
    id: 'calculator',
    label: '10s Rooftop Sizer',
    icon: Calculator,
    roles: ['admin', 'sales'],
  },
  {
    id: 'quotations',
    label: 'Quotations Hub',
    icon: FileSpreadsheet,
    roles: ['admin', 'sales'],
  },
  {
    id: 'orders',
    label: 'Orders & Payments',
    icon: PackageCheck,
    roles: ['admin', 'sales'],
  },
  {
    id: 'inventory',
    label: 'Stock & Inventory',
    icon: Warehouse,
    roles: ['admin', 'store_field'],
  },
  {
    id: 'tasks',
    label: 'Field Tasks & Ops',
    icon: Wrench,
    roles: ['admin', 'store_field'],
  },
  {
    id: 'products',
    label: 'Product Master',
    icon: Boxes,
    roles: ['admin', 'sales'],
  },
  {
    id: 'audit',
    label: 'Security & Audit Logs',
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
          className="fixed inset-0 bg-[#002E6E]/50 backdrop-blur-xs z-40 md:hidden no-print"
        />
      )}

      {/* Paytm Clean White Sidebar with Electric Cyan Accents */}
      <aside
        className={`fixed top-14 sm:top-16 bottom-0 left-0 z-40 w-60 bg-white text-[#0F1E36] border-r border-[#E1EBF5] shadow-sm transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:shrink-0 md:z-10 no-print flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-4 pb-2 text-[10px] font-bold tracking-wider text-[#8C9EB5] uppercase flex items-center justify-between">
            <span>Core Navigation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00BAF2]" />
          </div>

          <nav className="px-2 space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundManager.playSoftClick();
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-[#E8F8FE] text-[#002E6E] font-semibold border-r-4 border-[#00BAF2] shadow-2xs'
                      : 'text-[#5B6E88] hover:bg-[#F4F7FC] hover:text-[#002E6E] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#00BAF2]' : 'text-[#8C9EB5] group-hover:text-[#002E6E]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00BAF2]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info Card (Paytm Style) */}
        <div className="p-3 m-2.5 rounded-2xl bg-[#F4F7FC] border border-[#E1EBF5] text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-[#002E6E]">
            <div className="w-6 h-6 rounded-lg bg-[#00BAF2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Sun className="w-4 h-4" />
            </div>
            <span className="text-xs">Systomech Solar</span>
          </div>
          <p className="text-[10px] text-[#5B6E88]">
            Pune &bull; Maharashtra &bull; EPC
          </p>
          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#E1EBF5] text-[#008A3F] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00AC4F] animate-pulse" />
              PM Surya Ghar DBT
            </span>
            <span className="text-[#00BAF2] font-semibold">Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}
