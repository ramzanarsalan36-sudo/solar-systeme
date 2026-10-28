'use client';

import React from 'react';
import { UserRole } from '@/types/crm';
import { ShieldCheck, UserCheck, Wrench } from 'lucide-react';

export function RoleBadge({ role, size = 'md' }: { role: UserRole; size?: 'sm' | 'md' | 'lg' }) {
  const configs = {
    admin: {
      label: 'Admin (Full Control)',
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      icon: ShieldCheck,
      iconColor: 'text-indigo-600',
    },
    sales: {
      label: 'Sales / Office',
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: UserCheck,
      iconColor: 'text-amber-600',
    },
    store_field: {
      label: 'Store / Field Operations',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: Wrench,
      iconColor: 'text-emerald-600',
    },
  };

  const config = configs[role] || configs.sales;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses}`}>
      <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
      <span>{config.label}</span>
    </span>
  );
}
