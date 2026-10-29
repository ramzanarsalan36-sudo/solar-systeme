'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Quotation, UserRole } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import { generateWhatsAppMessage } from '@/lib/pdf-generator';
import {
  FileSpreadsheet,
  Search,
  PlusCircle,
  Eye,
  Share2,
  RotateCw,
  CheckCircle,
  Sun,
  ShieldCheck,
} from 'lucide-react';

interface QuotationsViewProps {
  role: UserRole;
  onOpenQuoteModal: () => void;
  onSelectQuoteToView: (quote: Quotation) => void;
}

export function QuotationsView({ role, onOpenQuoteModal, onSelectQuoteToView }: QuotationsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const quotations = crmStorage.getQuotations();

  const filteredQuotes = quotations.filter((q) => {
    const matchSearch =
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerPhone.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            <span>Quotations &amp; Proposals Hub</span>
          </h1>
          <p className="text-xs text-slate-500">
            Immutable pricing snapshots &bull; PM Surya Ghar Subsidy calculation &bull; WhatsApp sharing &bull; Revision history
          </p>
        </div>

        {role !== 'store_field' && (
          <button
            onClick={onOpenQuoteModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Sizing Quotation</span>
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by quote ref, customer name, phone, or city..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'draft', 'shared', 'accepted', 'revised'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize shrink-0 transition-all ${
                statusFilter === st
                  ? 'bg-[#0F172A] text-amber-400 shadow-xs font-bold border border-slate-700'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3">Quote Ref</th>
                <th className="p-3">Customer &amp; Site</th>
                <th className="p-3">System Sizing</th>
                <th className="p-3">Gross Total</th>
                <th className="p-3">Central Subsidy</th>
                <th className="p-3 font-bold text-slate-900">Net Customer Payable</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 align-top">
                    <span className="font-bold text-slate-900 block">{quote.quoteNumber}</span>
                    <span className="text-[10px] text-slate-400">
                      Rev R{quote.revision || 0} &bull; {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </td>

                  <td className="p-3 align-top">
                    <p className="font-bold text-slate-900">{quote.customerName}</p>
                    <p className="text-slate-500 text-[11px] font-mono">{quote.customerPhone}</p>
                    <p className="text-[10px] text-slate-400">{quote.city}</p>
                  </td>

                  <td className="p-3 align-top space-y-0.5">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                      {quote.systemKw} kW
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {quote.panelQty}x {quote.panelWattage}Wp Bifacial
                    </p>
                  </td>

                  <td className="p-3 align-top font-medium text-slate-700">
                    {formatIndianCurrency(quote.totalGrossPrice)}
                  </td>

                  <td className="p-3 align-top">
                    <span className="text-emerald-700 font-semibold">
                      -{formatIndianCurrency(quote.subsidyAmount)}
                    </span>
                    <span className="block text-[9px] text-emerald-600">PM Surya Ghar</span>
                  </td>

                  <td className="p-3 align-top font-bold text-slate-900 text-sm">
                    {formatIndianCurrency(quote.netPayableCustomer)}
                  </td>

                  <td className="p-3 align-top">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      quote.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : quote.status === 'shared'
                        ? 'bg-blue-100 text-blue-800'
                        : quote.status === 'revised'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {quote.status}
                    </span>
                  </td>

                  <td className="p-3 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View & Print */}
                      <button
                        onClick={() => onSelectQuoteToView(quote)}
                        className="p-1.5 rounded-lg bg-[#0F172A] text-amber-400 hover:bg-slate-800 transition-colors border border-slate-700"
                        title="View Formal PDF Quotation"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* WhatsApp Share */}
                      <button
                        onClick={() => {
                          const url = generateWhatsAppMessage(quote);
                          window.open(url, '_blank');
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Revise */}
                      {role !== 'store_field' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for creating quotation revision:');
                            if (reason) {
                              const rev = crmStorage.createQuotationRevision(quote.id, {
                                notes: `${quote.notes}\n[Revision]: ${reason}`,
                              });
                              if (rev) alert(`Created revision ${rev.quoteNumber}`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                          title="Create Revision Snapshot"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No quotations found. Click "Create Sizing Quotation" to generate your first quotation.
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
