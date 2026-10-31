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
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-medium">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Quotations &amp; Proposals
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Official price quotes &bull; PM Surya Ghar Subsidy breakdown &bull; WhatsApp sharing
            </p>
          </div>
        </div>

        {role !== 'store_field' && (
          <button
            onClick={onOpenQuoteModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Solar Quote</span>
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by quote ref, customer, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:outline-hidden text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 overflow-x-auto">
          {['all', 'draft', 'shared', 'accepted', 'revised'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize shrink-0 transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Quotations Table */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                <th className="p-3">Quote Ref</th>
                <th className="p-3">Customer &amp; Site</th>
                <th className="p-3">System Sizing</th>
                <th className="p-3 text-right">Gross Total</th>
                <th className="p-3 text-right">Subsidy</th>
                <th className="p-3 text-right">Net Payable</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 align-top">
                    <span className="font-mono font-medium text-slate-900 block">{quote.quoteNumber}</span>
                    <span className="text-[10px] text-slate-400">
                      R{quote.revision || 0} &bull; {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </td>

                  <td className="p-3 align-top">
                    <p className="font-semibold text-slate-900 text-xs">{quote.customerName}</p>
                    <p className="text-slate-500 text-[11px] font-mono">{quote.customerPhone}</p>
                    <p className="text-[10px] text-slate-400">{quote.city}</p>
                  </td>

                  <td className="p-3 align-top space-y-0.5">
                    <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 inline-block text-[11px]">
                      {quote.systemKw} kW
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {quote.panelQty}x {quote.panelWattage}Wp Bifacial
                    </p>
                  </td>

                  <td className="p-3 align-top text-right font-medium text-slate-700">
                    {formatIndianCurrency(quote.totalGrossPrice)}
                  </td>

                  <td className="p-3 align-top text-right">
                    <span className="text-emerald-700 font-medium">
                      -{formatIndianCurrency(quote.subsidyAmount)}
                    </span>
                    <span className="block text-[9px] text-emerald-600">PM Surya Ghar</span>
                  </td>

                  <td className="p-3 align-top text-right font-semibold text-slate-900 text-sm">
                    {formatIndianCurrency(quote.netPayableCustomer)}
                  </td>

                  <td className="p-3 align-top">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        quote.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : quote.status === 'shared'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : quote.status === 'revised'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>

                  <td className="p-3 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectQuoteToView(quote)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                        title="View Official PDF Quotation"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          const url = generateWhatsAppMessage(quote);
                          window.open(url, '_blank');
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title="Share Proposal on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

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
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                          title="Create Revision"
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
                    No quotations match search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Phone / Field view) */}
      <div className="sm:hidden space-y-3">
        {filteredQuotes.map((quote) => (
          <div key={quote.id} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] text-slate-400">{quote.quoteNumber} (R{quote.revision || 0})</span>
                <h4 className="font-semibold text-sm text-slate-900 leading-tight">{quote.customerName}</h4>
                <p className="text-xs text-slate-500 font-mono">{quote.customerPhone} &bull; {quote.city}</p>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                  quote.status === 'accepted'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {quote.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block">System Size</span>
                <span className="font-medium text-amber-700">{quote.systemKw} kW Rooftop</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Net Payable</span>
                <span className="font-semibold text-slate-900">{formatIndianCurrency(quote.netPayableCustomer)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => onSelectQuoteToView(quote)}
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View PDF</span>
              </button>
              <button
                onClick={() => {
                  const url = generateWhatsAppMessage(quote);
                  window.open(url, '_blank');
                }}
                className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        ))}

        {filteredQuotes.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No quotations found.
          </div>
        )}
      </div>
    </div>
  );
}