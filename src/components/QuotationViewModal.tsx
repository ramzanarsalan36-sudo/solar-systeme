'use client';

import React, { useEffect } from 'react';
import { Quotation, UserRole } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import { generateWhatsAppMessage, generateEmailLink } from '@/lib/pdf-generator';
import { crmStorage } from '@/lib/storage';
import {
  X,
  Printer,
  Share2,
  Mail,
  CheckCircle,
  Sun,
  ShieldCheck,
  Building,
  RotateCw,
  ArrowLeft,
  FileDown,
  Sparkles,
} from 'lucide-react';

interface QuotationViewModalProps {
  quote: Quotation | null;
  onClose: () => void;
  userRole: UserRole;
  onOrderCreated?: () => void;
  onRevisionCreated?: (revisedQuote: Quotation) => void;
}

export function QuotationViewModal({
  quote,
  onClose,
  userRole,
  onOrderCreated,
  onRevisionCreated,
}: QuotationViewModalProps) {
  // Listen for Escape key to cleanly navigate back / close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!quote) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const url = generateWhatsAppMessage(quote);
    window.open(url, '_blank');
    if (quote.status === 'draft') {
      quote.status = 'shared';
      crmStorage.updateLead({} as any);
    }
  };

  const handleEmail = () => {
    const url = generateEmailLink(quote);
    window.location.href = url;
  };

  const handleConvertToOrder = () => {
    if (confirm(`Confirm order conversion for ${quote.customerName} (${quote.systemKw}kW)? This will initialize project execution and field assignments.`)) {
      const res = crmStorage.createOrderFromQuotation(quote.id);
      if (res.success) {
        alert('Order created successfully! Field team and warehouse store have been notified.');
        if (onOrderCreated) onOrderCreated();
        onClose();
      } else {
        alert(res.message);
      }
    }
  };

  const handleCreateRevision = () => {
    const reason = prompt('Enter reason for revision (e.g., Capacity change, discount update):', 'Customer requested capacity adjustment');
    if (reason) {
      const revised = crmStorage.createQuotationRevision(quote.id, {
        notes: `${quote.notes}\n[Revision]: ${reason}`,
      });
      if (revised && onRevisionCreated) {
        alert(`Created revision ${revised.quoteNumber}`);
        onRevisionCreated(revised);
      }
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl overflow-hidden my-3 print:my-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Sticky Action Header with Unmistakable Back Option - Hidden on Print */}
        <div className="sticky top-0 z-20 px-4 sm:px-6 py-3 bg-[#0F172A] text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shadow-md no-print">
          {/* Prominent Back Button & Quote Meta */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 group"
              title="Return to quotations list (or press Esc)"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5] text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            <div className="h-5 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                {quote.quoteNumber}
              </span>
              <span className="text-xs text-slate-300 hidden md:inline">
                Rev: R{quote.revision || 0} &bull; {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Quick Actions (Print 1-Page PDF, WhatsApp, Convert) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
              title="Print or Save as Single-Page A4 PDF"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print / Save 1-Page PDF</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
              title="Send summary to client WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleEmail}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            {userRole !== 'store_field' && (
              <>
                <button
                  onClick={handleCreateRevision}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 transition-colors cursor-pointer"
                  title="Create historical revision"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Revise</span>
                </button>

                <button
                  onClick={handleConvertToOrder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors shadow-sm cursor-pointer"
                  title="Convert this quote into a booked project"
                >
                  <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Convert to Order</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORMAL SINGLE-PAGE A4 DOCUMENT SHEET (INFISPARKS COMPACT PRECISION)
            Optimized to fit 100% on 1 Single A4 Page in Print/PDF
            ═══════════════════════════════════════════════════════════════ */}
        <div className="a4-document-sheet p-5 sm:p-7 print:p-0 text-slate-800 space-y-3 bg-white font-sans text-xs leading-snug">
          {/* 1. Header (Company Identity + Quotation Reference) */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="flex items-start justify-between border-b-2 border-[#0F172A] pb-2"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <Sun className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-[#0F172A] leading-none">
                    SYSTOMECH ENGINEERS
                  </h1>
                  <span className="text-[9.5px] text-slate-600 font-semibold uppercase tracking-wider block mt-0.5">
                    Solar EPC &bull; Rooftop Power Plants &bull; PM Surya Ghar Approved Channel Partner
                  </span>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 pt-0.5 leading-tight">
                Reg. Office: Office 402, Pride Silicon Plaza, Senapati Bapat Road, Pune - 411016 &bull; Branch: Satpur MIDC, Nashik - 422007
                <br />
                Phone: +91 98201 12345 &bull; Web: www.systomech.com &bull; GSTIN: 27AABCS1429Q1ZX &bull; MSME: UDYAM-MH-26-0048192
              </p>
            </div>

            <div className="text-right shrink-0 space-y-0.5 pl-3">
              <div className="text-xs font-black uppercase tracking-wider text-[#0F172A]">ROOFTOP SOLAR PROPOSAL</div>
              <div className="text-[11px] font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 inline-block">
                {quote.quoteNumber}
              </div>
              <div className="text-[9.5px] text-slate-600">
                Date: {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-[9px] text-slate-500">
                Validity: {quote.validityDays} Days &bull; Rev: R{quote.revision || 0}
              </div>
            </div>
          </div>

          {/* 2. Client & Grid Connection Details (2 Compact Columns) */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="grid grid-cols-2 gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 text-[10px]"
          >
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Customer Details</span>
              <p className="font-bold text-xs text-slate-900 mt-0.5">{quote.customerName}</p>
              <p className="text-slate-600">Phone: {quote.customerPhone} {quote.customerEmail ? `• ${quote.customerEmail}` : ''}</p>
              <p className="text-slate-600 truncate">Site Address: {quote.siteAddress}, {quote.city}</p>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Discom &amp; Grid Connection</span>
              <p className="font-semibold text-slate-900 mt-0.5">Discom: {quote.discom}</p>
              <p className="text-slate-600">Sanctioned Load: {quote.sanctionLoadKw} kW &bull; Grid: {quote.phase === 'three' ? '3-Phase (415V)' : '1-Phase (230V)'}</p>
              <p className="text-slate-600">Monthly Consumption: ~{quote.monthlyUnits} Units/month &bull; Consumer No: {quote.consumerNumber || 'To be updated from bill'}</p>
            </div>
          </div>

          {/* 3. System Configuration Highlights (4 Mini Tiles) */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="grid grid-cols-4 gap-2 text-center text-[10px]"
          >
            <div className="p-1.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Plant Capacity</span>
              <span className="font-black text-xs sm:text-sm text-[#0F172A]">{quote.systemKw} kWp</span>
            </div>
            <div className="p-1.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Solar Modules</span>
              <span className="font-bold text-[11px] text-slate-800">{quote.panelQty}x {quote.panelWattage}Wp Bifacial</span>
            </div>
            <div className="p-1.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Grid Inverter</span>
              <span className="font-bold text-[11px] text-slate-800">{quote.inverterModel.split(' ')[0]} {quote.phase === 'three' ? '3-Ph' : '1-Ph'}</span>
            </div>
            <div className="p-1.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Mounting Kit</span>
              <span className="font-bold text-[11px] text-slate-800 truncate block">
                {quote.structureType.split(' ')[0]} HDG Kit
              </span>
            </div>
          </div>

          {/* 4. Scope of Supply & Itemized Bill of Materials Table */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="overflow-hidden rounded-lg border border-slate-200"
          >
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-[#0F172A] text-white">
                  <th className="py-1 px-2 text-center w-8">#</th>
                  <th className="py-1 px-2">Item Description</th>
                  <th className="py-1 px-2">Specification / Brand</th>
                  <th className="py-1 px-2 text-center w-12">Qty</th>
                  <th className="py-1 px-2 text-center w-12">UoM</th>
                  <th className="py-1 px-2 text-right w-20">Unit Rate (₹)</th>
                  <th className="py-1 px-2 text-right w-24">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quote.lineItems.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-1 px-2 text-slate-500 text-center font-medium">{idx + 1}</td>
                    <td className="py-1 px-2 font-bold text-slate-900">{item.productName}</td>
                    <td className="py-1 px-2 text-slate-600 text-[9.5px] truncate max-w-[280px]">{item.spec}</td>
                    <td className="py-1 px-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-1 px-2 text-center text-slate-500">{item.uom}</td>
                    <td className="py-1 px-2 text-right text-slate-700">{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-1 px-2 text-right font-bold text-slate-900">{item.lineTotal.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-medium">
                  <td colSpan={6} className="py-1 px-2 text-slate-700 text-right">
                    Net Metering Liaison &amp; Discom Inspection Charges:
                  </td>
                  <td className="py-1 px-2 text-right font-semibold text-slate-900">
                    {quote.netMeteringCharge.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-medium">
                  <td colSpan={6} className="py-1 px-2 text-slate-700 text-right">
                    Civil Grouting, Electrical Wiring &amp; Commissioning Labor:
                  </td>
                  <td className="py-1 px-2 text-right font-semibold text-slate-900">
                    {quote.installationCharge.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Pricing Summary & ROI Matrix (2 Columns) */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="grid grid-cols-2 gap-3"
          >
            {/* Left: 25-Year Performance Projections */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  25-Year Performance &amp; Savings Projections
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Annual Generation</span>
                    <span className="font-bold text-slate-900 text-[11px]">{quote.annualGenerationUnits.toLocaleString('en-IN')} Units</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Annual Bill Savings</span>
                    <span className="font-bold text-emerald-700 text-[11px]">{formatIndianCurrency(quote.annualElectricitySavings)} / yr</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Simple Payback</span>
                    <span className="font-bold text-[#0F172A] text-[11px]">~{quote.paybackYears} Years</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">25-Yr Lifetime Savings</span>
                    <span className="font-bold text-emerald-700 text-[11px]">{formatIndianCurrency(quote.twentyFiveYearSavings)}</span>
                  </div>
                </div>
              </div>
              <p className="text-[8.5px] text-slate-500 border-t border-slate-200/80 pt-1">
                *MNRE generation benchmark: 4.2 units/kW/day under Maharashtra solar insolation.
              </p>
            </div>

            {/* Right: Commercial Financial Breakdown */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount (Goods &amp; Services):</span>
                <span className="font-semibold">{formatIndianCurrency(quote.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST ({quote.gstRate}% Composite Solar):</span>
                <span className="font-semibold">{formatIndianCurrency(quote.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-0.5 border-t border-slate-200">
                <span>Total Project Gross Value:</span>
                <span>{formatIndianCurrency(quote.totalGrossPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <div>
                  <span>Less: PM Surya Ghar Central Subsidy</span>
                  <span className="text-[8.5px] block text-emerald-700 font-normal">
                    {quote.subsidyEligibilityStatus === 'verified' ? 'Eligible for Direct DBT to Bank' : 'Subject to National Portal Verification'}
                  </span>
                </div>
                <span className="text-xs font-black">-{formatIndianCurrency(quote.subsidyAmount)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-xs text-[#0F172A] bg-amber-100 px-2 py-1.5 rounded-lg border border-amber-300">
                <span>NET PAYABLE BY CUSTOMER:</span>
                <span className="text-sm font-black text-amber-950">
                  {formatIndianCurrency(quote.netPayableCustomer)}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Compact Disclaimer Banner */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="p-1.5 px-2 bg-amber-50/80 border border-amber-200 rounded-lg text-[9px] text-amber-950 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <p>
              <strong>Disclaimer:</strong> Subsidy amounts are calculated under PM Surya Ghar Muft Bijli Yojana guidelines. Final approval, net metering, and DBT disbursement are subject to DISCOM inspection and National Portal approval.
            </p>
          </div>

          {/* 7. Payment Terms & Bank Details (2 Columns) */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 text-[9.5px]"
          >
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">Payment Terms:</span>
              <ul className="list-disc list-inside space-y-0.2 text-slate-600 text-[9px]">
                <li><strong>20% Token Advance:</strong> Order booking &amp; site feasibility survey.</li>
                <li><strong>60% Material Dispatch:</strong> Upon dispatch of panels &amp; inverter.</li>
                <li><strong>20% Final Commissioning:</strong> Post Discom net-meter synchronization.</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">Bank Details for RTGS / NEFT / IMPS:</span>
              <div className="text-[9px] text-slate-700 space-y-0.2 bg-slate-50 p-1.5 rounded border border-slate-200">
                <p><strong>A/c Name:</strong> Systomech Engineers &bull; <strong>Bank:</strong> HDFC Bank Ltd</p>
                <p><strong>Current A/c:</strong> 50200084920194 &bull; <strong>IFSC:</strong> HDFC0000039 &bull; <strong>Branch:</strong> SB Road, Pune</p>
              </div>
            </div>
          </div>

          {/* 8. Footer Sign-off Block */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9.5px] text-slate-600"
          >
            <div>
              <p className="font-bold text-slate-900">For Systomech Engineers</p>
              <p className="text-[8.5px] text-slate-400 mt-3">Authorized Signatory / Technical Lead</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">Customer Acceptance</p>
              <p className="text-[8.5px] text-slate-400 mt-3">Signature &amp; Date: ___________________</p>
            </div>
          </div>

          {/* 9. Bottom Navigation Bar for Interactive Screen Viewing - Hidden on Print */}
          <div className="no-print pt-3 mt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
              <span>← Back to Quotations</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>Save 1-Page PDF / Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
