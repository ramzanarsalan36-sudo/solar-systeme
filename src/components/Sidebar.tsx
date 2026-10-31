'use client';

import React from 'react';
import { UserRole } from '@/types/crm';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  ShoppingBag,
  Boxes,
  CheckSquare,
  Wrench,
  BarChart3,
  Settings,
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

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'sales', 'store_field'],
  },
  {
    id: 'leads',
    label: 'Leads Pipeline',
    icon: Users,
    roles: ['admin', 'sales'],
  },
  {
    id: 'calculator',
    label: 'Bill to Solar Quote',
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden no-print"
        />
      )}

      {/* Modern Clean Sidebar */}
      <aside
        className={`fixed top-14 sm:top-16 bottom-0 left-0 z-40 w-60 bg-slate-900 text-slate-300 border-r border-slate-800 shadow-xl transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:shrink-0 md:z-10 no-print flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-4 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>Navigation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>

          <nav className="px-2.5 space-y-0.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'customers' && activeTab === 'leads') ||
                (item.id === 'products' && activeTab === 'inventory') ||
                (item.id === 'field_operations' && activeTab === 'tasks') ||
                (item.id === 'reports' && activeTab === 'audit') ||
                (item.id === 'settings' && activeTab === 'audit');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'customers') setActiveTab('leads');
                    else if (item.id === 'products') setActiveTab('inventory');
                    else if (item.id === 'field_operations') setActiveTab('tasks');
                    else if (item.id === 'reports' || item.id === 'settings') setActiveTab('audit');
                    else setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="p-3 m-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-medium text-white">
            <div className="w-5 h-5 rounded-md bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-[10px]">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs">Systomech Solar</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Pune &bull; Maharashtra &bull; EPC
          </p>
          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-700 text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              PM Surya Ghar DBT
            </span>
            <span className="text-slate-400">Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}