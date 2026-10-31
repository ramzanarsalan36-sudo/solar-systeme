'use client';

import React from 'react';
import { UserRole } from '@/types/crm';
import { soundManager } from '@/lib/sound';
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1EBF5] shadow-[0_-2px_12px_rgba(0,46,110,0.06)] px-2 py-1.5 flex items-center justify-around no-print">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              soundManager.playSoftClick();
              setActiveTab(item.id);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${
              isActive
                ? 'text-[#00BAF2] font-semibold scale-105'
                : 'text-[#5B6E88] hover:text-[#002E6E] font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.4] text-[#00BAF2]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {!isField && (
        <button
          type="button"
          onClick={() => {
            soundManager.playSoftClick();
            onOpenQuoteModal();
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[#002E6E] hover:text-[#00BAF2] font-medium cursor-pointer"
        >
          <div className="w-5 h-5 rounded-md bg-[#00BAF2] text-white flex items-center justify-center mb-0.5 shadow-2xs">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] tracking-tight">Calc</span>
        </button>
      )}
    </nav>
  );
}
