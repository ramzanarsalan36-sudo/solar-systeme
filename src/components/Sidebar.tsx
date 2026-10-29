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
    label: 'Leads',
    icon: Users,
    roles: ['admin', 'sales'],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: UserCheck,
    roles: ['admin', 'sales'],
  },
  {
    id: 'quotations',
    label: 'Quotations',
    icon: FileText,
    roles: ['admin', 'sales'],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingBag,
    roles: ['admin', 'sales'],
  },
  {
    id: 'products',
    label: 'Products & Stock',
    icon: Boxes,
    roles: ['admin', 'sales', 'store_field'],
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    roles: ['admin', 'store_field'],
  },
  {
    id: 'field_operations',
    label: 'Field Operations',
    icon: Wrench,
    roles: ['admin', 'store_field'],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    roles: ['admin'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
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
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-30 md:hidden no-print"
        />
      )}

      {/* Sidebar Panel with Deep Midnight Navy (#0B132B) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 w-64 bg-[#0B132B] text-slate-300 border-r border-[#192440] shadow-2xl transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:sticky md:top-0 md:h-screen md:shrink-0 md:z-20 no-print flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
          {/* Top Brand Logo - Exact from Image 2 */}
          <div
            onClick={() => {
              setActiveTab('dashboard');
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer group px-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
              <Sun className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white leading-tight">
                SYSTOMECH
              </div>
              <div className="text-[10px] font-medium tracking-widest text-slate-300 uppercase leading-tight">
                ENGINEERS
              </div>
              <div className="text-[9px] font-semibold tracking-wider text-amber-400 uppercase mt-0.5">
                SOLAR CRM
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-2">
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
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-[#433419] text-[#FBBF24] font-semibold border border-[#6B5324]/50 shadow-sm'
                      : 'text-slate-300 hover:bg-[#15203A] hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#FBBF24]' : 'text-slate-400 group-hover:text-amber-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Card - Exact Image 2 Sunset Photo Banner */}
        <div className="p-4 m-3 rounded-2xl relative overflow-hidden shadow-lg border border-[#192440]">
          <div
            className="absolute inset-0 bg-cover bg-center brightness-75 scale-105"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80")',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="relative z-10 pt-10 text-white space-y-0.5">
            <h4 className="text-xs font-semibold leading-tight text-white drop-shadow-sm">
              Clean Energy
            </h4>
            <h4 className="text-xs font-semibold leading-tight text-white drop-shadow-sm">
              Brighter Future
            </h4>
            <p className="text-[10px] text-amber-300/90 font-medium pt-1">
              Systomech Engineers
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
