'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Quotation, UserRole } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import { generateWhatsAppMessage } from '@/lib/pdf-generator';
import { soundManager } from '@/lib/sound';
import {
  FileSpreadsheet,
  Search,
  PlusCircle,
  Eye,
  Share2,
  RotateCw,
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
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E1EBF5]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E8F8FE] border border-[#BCE8FC] text-[#00BAF2] flex items-center justify-center font-bold shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#002E6E] tracking-tight">
              Quotations &amp; Proposals Hub
            </h1>
            <p className="text-xs text-[#5B6E88] font-normal">
              Formal A4 solar proposals &bull; PM Surya Ghar DBT calculation &bull; WhatsApp delivery
            </p>
          </div>
        </div>

        {role !== 'store_field' && (
          <button
            onClick={() => {
              soundManager.playSoftClick();
              onOpenQuoteModal();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#00BAF2] hover:bg-[#00A6DA] text-white shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate New Solar Quote</span>
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
            placeholder="Search quote ref, customer, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-[#E1EBF5] bg-white focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden text-[#0F1E36] placeholder:text-slate-400 shadow-2xs transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#F4F7FC] rounded-xl border border-[#E1EBF5] overflow-x-auto">
          {['all', 'draft', 'shared', 'accepted', 'revised'].map((st) => (
            <button
              key={st}
              onClick={() => {
                soundManager.playSoftClick();
                setStatusFilter(st);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize shrink-0 transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#002E6E] text-white shadow-xs'
                  : 'text-[#5B6E88] hover:text-[#002E6E] hover:bg-white/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Quotations Table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-[#E1EBF5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F7FC] border-b border-[#E1EBF5] text-[#5B6E88] font-semibold text-[11px] uppercase tracking-wider">
                <th className="p-3.5">Quote Ref</th>
                <th className="p-3.5">Customer &amp; Site</th>
                <th className="p-3.5">System Sizing</th>
                <th className="p-3.5 text-right">Gross Total</th>
                <th className="p-3.5 text-right">Central Subsidy</th>
                <th className="p-3.5 text-right">Net Payable</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1EBF5]">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-[#F4F7FC]/70 transition-colors">
                  <td className="p-3.5 align-top">
                    <span className="font-mono font-bold text-[#002E6E] block">{quote.quoteNumber}</span>
                    <span className="text-[10px] text-[#8C9EB5]">
                      R{quote.revision || 0} &bull; {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </td>

                  <td className="p-3.5 align-top space-y-0.5">
                    <p className="font-semibold text-slate-900">{quote.customerName}</p>
                    <p className="text-[11px] text-[#5B6E88]">{quote.customerPhone}</p>
                    <p className="text-[11px] text-[#5B6E88] truncate max-w-[200px]">{quote.siteAddress}, {quote.city}</p>
                  </td>

                  <td className="p-3.5 align-top space-y-0.5">
                    <span className="font-semibold text-[#008AC5] bg-[#E8F8FE] px-2 py-0.5 rounded-md border border-[#BCE8FC] inline-block text-[11px]">
                      {quote.systemKw} kWp
                    </span>
                    <p className="text-[10px] text-[#5B6E88]">
                      {quote.panelQty}x {quote.panelWattage}Wp Bifacial
                    </p>
                  </td>

                  <td className="p-3.5 align-top text-right font-medium text-[#0F1E36]">
                    {formatIndianCurrency(quote.totalGrossPrice)}
                  </td>

                  <td className="p-3.5 align-top text-right">
                    <span className="text-[#008A3F] font-semibold">
                      -{formatIndianCurrency(quote.subsidyAmount)}
                    </span>
                    <span className="block text-[9px] text-[#00AC4F]">PM Surya Ghar</span>
                  </td>

                  <td className="p-3.5 align-top text-right font-bold text-[#002E6E] text-sm">
                    {formatIndianCurrency(quote.netPayableCustomer)}
                  </td>

                  <td className="p-3.5 align-top">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                        quote.status === 'accepted'
                          ? 'bg-[#E7F9F0] text-[#008A3F] border border-[#B7ECCF]'
                          : quote.status === 'shared'
                          ? 'bg-[#E8F8FE] text-[#008AC5] border border-[#BCE8FC]'
                          : quote.status === 'revised'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>

                  <td className="p-3.5 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playSoftClick();
                          onSelectQuoteToView(quote);
                        }}
                        className="p-1.5 rounded-xl bg-[#00BAF2] hover:bg-[#00A6DA] text-white transition-all shadow-xs cursor-pointer active:scale-95"
                        title="View Official Full A4 Proposal"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playSoftClick();
                          const url = generateWhatsAppMessage(quote);
                          window.open(url, '_blank');
                        }}
                        className="p-1.5 rounded-xl bg-[#00AC4F] hover:bg-[#009644] text-white transition-all shadow-xs cursor-pointer active:scale-95"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden space-y-3">
        {filteredQuotes.map((quote) => (
          <div key={quote.id} className="bg-white rounded-2xl border border-[#E1EBF5] p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#002E6E]">{quote.quoteNumber}</span>
                <h3 className="font-semibold text-sm text-[#0F1E36]">{quote.customerName}</h3>
                <p className="text-xs text-[#5B6E88]">{quote.customerPhone} &bull; {quote.city}</p>
              </div>
              <span className="font-bold text-xs text-[#00BAF2] bg-[#E8F8FE] px-2 py-0.5 rounded-md border border-[#BCE8FC]">
                {quote.systemKw} kW
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E1EBF5]">
              <div>
                <span className="text-[10px] text-[#5B6E88] block">Net Payable</span>
                <span className="font-bold text-sm text-[#002E6E]">{formatIndianCurrency(quote.netPayableCustomer)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#5B6E88] block">Govt Subsidy</span>
                <span className="font-semibold text-xs text-[#00AC4F]">-{formatIndianCurrency(quote.subsidyAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E1EBF5]">
              <button
                type="button"
                onClick={() => {
                  soundManager.playSoftClick();
                  onSelectQuoteToView(quote);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#00BAF2] text-white text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>View Proposal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playSoftClick();
                  const url = generateWhatsAppMessage(quote);
                  window.open(url, '_blank');
                }}
                className="inline-flex items-center justify-center p-2 rounded-xl bg-[#00AC4F] text-white cursor-pointer shadow-xs active:scale-95"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
