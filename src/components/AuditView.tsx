'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { AuditLog, UserRole } from '@/types/crm';
import { ShieldAlert, Search, Filter, Lock, CheckCircle2 } from 'lucide-react';

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
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <Lock className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">Restricted Admin Access</h3>
        <p className="text-xs text-slate-500 mt-1">
          System audit logs are strictly reserved for administrative compliance and security audit review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-700" />
            <span>Enterprise Security &amp; Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-500">
            Immutable tracking of price changes, stock deductions, quotation revisions, lead conversions, and role permissions
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit details, actor, or action..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'product', 'lead', 'quotation', 'order', 'inventory', 'payment', 'settings'].map((et) => (
            <button
              key={et}
              onClick={() => setEntityFilter(et)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-colors ${
                entityFilter === et
                  ? 'bg-[#0F172A] text-amber-400 shadow-xs font-bold border border-slate-700'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {et}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor &amp; Role</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Entity Domain</th>
                <th className="p-3">Audit Details &amp; Operational Payload</th>
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
                    <p className="font-bold text-slate-900">{log.actorName}</p>
                    <span className="text-[10px] text-slate-500 capitalize">{log.actorRole.replace('_', ' ')}</span>
                  </td>

                  <td className="p-3 align-top">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {log.action}
                    </span>
                  </td>

                  <td className="p-3 align-top">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {log.entityType}
                    </span>
                  </td>

                  <td className="p-3 align-top text-slate-700 leading-relaxed max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
