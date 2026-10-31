'use client';

import { soundManager } from '@/lib/sound';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { AuditLog, UserRole } from '@/types/crm';
import { ShieldAlert, Search, Lock } from 'lucide-react';

interface AuditViewProps {
  role: UserRole;
}

export function AuditView({ role }: AuditViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const logs = crmStorage.getAuditLogs();

  const filteredLogs = logs.filter((l) => {
    const matchSearch =
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEntity = entityFilter === 'all' || l.entityType === entityFilter;
    return matchSearch && matchEntity;
  });

  if (role !== 'admin') {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#E1EBF5]">
        <Lock className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-semibold text-slate-800">Restricted Admin Access</h3>
        <p className="text-xs text-slate-500 mt-1">
          System audit logs are strictly reserved for administrative compliance and security audit review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E1EBF5]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center font-medium">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#002E6E] tracking-tight">
              Security &amp; Audit Logs
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Immutable ledger of price changes, stock movement, quotations &amp; user actions
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit details, actor, or action..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[#E1EBF5] bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:outline-hidden text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg border border-[#E1EBF5]/80 overflow-x-auto">
          {['all', 'product', 'lead', 'quotation', 'order', 'inventory', 'payment', 'settings'].map((et) => (
            <button
              key={et}
              onClick={() => setEntityFilter(et)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize shrink-0 transition-all cursor-pointer ${
                entityFilter === et
                  ? 'bg-white text-[#002E6E] shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-[#002E6E]'
              }`}
            >
              {et}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#E1EBF5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E1EBF5] text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor &amp; Role</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Entity Domain</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 align-top text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="p-3 align-top">
                    <p className="font-semibold text-[#002E6E]">{log.actorName}</p>
                    <span className="text-[10px] text-slate-400 capitalize">{log.actorRole.replace('_', ' ')}</span>
                  </td>

                  <td className="p-3 align-top">
                    <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {log.action}
                    </span>
                  </td>

                  <td className="p-3 align-top">
                    <span className="capitalize text-slate-600 font-medium">{log.entityType}</span>
                  </td>

                  <td className="p-3 align-top text-slate-700 leading-relaxed font-normal">
                    {log.details}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No audit records match search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}