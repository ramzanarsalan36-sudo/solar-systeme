'use client';

import React from 'react';
import { UserRole } from '@/types/crm';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Warehouse,
  FileSpreadsheet,
  Calculator,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  onOpenQuoteModal: () => void;
}

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  role,
  onOpenQuoteModal,
}: MobileBottomNavProps) {
  const isField = role === 'store_field';
  const isSales = role === 'sales';

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    ...(isField
      ? [
          { id: 'tasks', label: 'Field Tasks', icon: Wrench },
          { id: 'inventory', label: 'Stock', icon: Warehouse },
        ]
      : [
          { id: 'leads', label: 'Leads', icon: Users },
          { id: 'quotations', label: 'Quotes', icon: FileSpreadsheet },
          { id: 'tasks', label: 'Tasks', icon: Wrench },
          { id: 'inventory', label: 'Stock', icon: Warehouse },
        ]),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] px-2 py-1.5 flex items-center justify-around no-print">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer min-w-[56px] ${
              isActive
                ? 'text-amber-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900 font-normal'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {!isField && (
        <button
          type="button"
          onClick={onOpenQuoteModal}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-amber-600 hover:text-amber-700 font-normal cursor-pointer"
        >
          <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center mb-0.5 shadow-2xs">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] tracking-tight">Calc</span>
        </button>
      )}
    </nav>
  );
}