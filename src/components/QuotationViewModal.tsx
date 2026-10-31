'use client';

import React, { useEffect } from 'react';
import { Quotation, UserRole } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import { generateWhatsAppMessage, generateEmailLink } from '@/lib/pdf-generator';
import { crmStorage } from '@/lib/storage';
import { soundManager } from '@/lib/sound';
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
  Zap,
  CheckCircle2,
  Award,
} from 'lucide-react';

interface QuotationViewModalProps {
  isOpen?: boolean;
  quote: Quotation | null;
  onClose: () => void;
  userRole: UserRole;
  onOrderCreated?: () => void;
  onRevisionCreated?: (revisedQuote: Quotation) => void;
}

export function QuotationViewModal({
  isOpen = true,
  quote,
  onClose,
  userRole,
  onOrderCreated,
  onRevisionCreated,
}: QuotationViewModalProps) {
  // Listen for Escape key to cleanly navigate back / close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        soundManager.playSoftClick();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Guaranteed safe exit check
  if (!isOpen || !quote) return null;

  const handleReturn = () => {
    soundManager.playSoftClick();
    onClose();
  };

  const handlePrint = () => {
    soundManager.playSuccessTone();
    window.print();
  };

  const handleWhatsApp = () => {
    soundManager.playSoftClick();
    const url = generateWhatsAppMessage(quote);
    window.open(url, '_blank');
    if (quote.status === 'draft') {
      quote.status = 'shared';
      crmStorage.updateLead({} as any);
    }
  };

  const handleEmail = () => {
    soundManager.playSoftClick();
    const url = generateEmailLink(quote);
    window.location.href = url;
  };

  const handleConvertToOrder = () => {
    if (
      confirm(
        `Confirm order conversion for ${quote.customerName} (${quote.systemKw}kW)? This will initialize project execution and field assignments.`
      )
    ) {
      const res = crmStorage.createOrderFromQuotation(quote.id);
      if (res.success) {
        soundManager.playPaytmChime();
        alert('Order created successfully! Field team and warehouse store have been notified.');
        if (onOrderCreated) onOrderCreated();
        onClose();
      } else {
        alert(res.message);
      }
    }
  };

  const handleCreateRevision = () => {
    const reason = prompt(
      'Enter reason for revision (e.g., Capacity change, discount update):',
      'Customer requested capacity adjustment'
    );
    if (reason) {
      const revised = crmStorage.createQuotationRevision(quote.id, {
        notes: `${quote.notes}\n[Revision]: ${reason}`,
      });
      if (revised && onRevisionCreated) {
        soundManager.playSuccessTone();
        alert(`Created revision ${revised.quoteNumber}`);
        onRevisionCreated(revised);
      }
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleReturn();
      }}
      className="quotation-modal-overlay fixed inset-0 z-50 overflow-y-auto bg-[#002E6E]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 print:p-0 print:bg-white"
    >
      <div className="quotation-modal-container bg-white rounded-2xl shadow-2xl border border-[#E1EBF5] w-full max-w-4xl overflow-hidden my-4 print:my-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* ═══════════════════════════════════════════════════════════════
            TOP NAVIGATION BAR (PAYTM DEEP NAVY + ELECTRIC CYAN THEME)
            Hidden on Print / PDF Export
            ═══════════════════════════════════════════════════════════════ */}
        <div className="no-print sticky top-0 z-20 px-4 sm:px-6 py-3 bg-[#002E6E] text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#002354] shadow-md">
          {/* Prominent Return Option */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReturn}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer shadow-xs active:scale-95 group"
              title="Return to quotations list (Press Esc)"
            >
              <ArrowLeft className="w-4 h-4 text-[#00BAF2] group-hover:-translate-x-0.5 transition-transform" />
              <span>← Return to Quotations</span>
              <span className="text-[10px] text-white/60 font-mono hidden sm:inline">(Esc)</span>
            </button>

            <div className="h-5 w-px bg-white/20 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-[#00BAF2] text-white">
                {quote.quoteNumber}
              </span>
              <span className="text-xs text-white/70 hidden md:inline">
                Rev: R{quote.revision || 0} &bull;{' '}
                {new Date(quote.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Action Buttons: Print PDF, WhatsApp, Convert */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#00BAF2] hover:bg-[#00A6DA] text-white transition-all shadow-xs cursor-pointer active:scale-95"
              title="Print or Save as Full-Page A4 PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Save Full A4 PDF / Print</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00AC4F] hover:bg-[#009644] text-white transition-all shadow-xs cursor-pointer active:scale-95"
              title="Send summary to client WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleEmail}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              title="Email PDF Proposal to Client"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            {userRole !== 'store_field' && (
              <>
                <button
                  type="button"
                  onClick={handleCreateRevision}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
                  title="Create historical revision"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#00BAF2]" />
                  <span>Revise</span>
                </button>

                <button
                  type="button"
                  onClick={handleConvertToOrder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00AC4F] hover:bg-[#009644] text-white transition-colors shadow-xs cursor-pointer"
                  title="Convert this quote into a booked project"
                >
                  <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Convert to Order</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleReturn}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORMAL FULL A4 DOCUMENT SHEET (PAYTM PRECISION SIZED)
            Fills the complete A4 page naturally without squishing or voids
            ═══════════════════════════════════════════════════════════════ */}
        <div className="a4-document-sheet p-6 sm:p-9 print:p-0 text-[#0F1E36] space-y-4 bg-white font-sans text-xs leading-normal">
          {/* 1. Header (Company Identity + Channel Partner Credentials + Proposal Reference) */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="flex items-start justify-between border-b-2 border-[#002E6E] pb-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#002E6E] text-[#00BAF2] flex items-center justify-center font-bold shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#002E6E] leading-none">
                    SYSTOMECH ENGINEERS
                  </h1>
                  <span className="text-[10px] text-[#00BAF2] font-semibold uppercase tracking-wider block mt-0.5">
                    Solar EPC &bull; Rooftop Power Plants &bull; PM Surya Ghar Approved Channel Partner
                  </span>
                </div>
              </div>
              <p className="text-[9.5px] text-[#5B6E88] pt-0.5 leading-relaxed">
                Reg. Office: Office 402, Pride Silicon Plaza, Senapati Bapat Road, Pune - 411016 &bull; Branch: Satpur MIDC, Nashik - 422007
                <br />
                Phone: +91 98201 12345 &bull; Web: www.systomech.com &bull; GSTIN: 27AABCS1429Q1ZX &bull; MSME: UDYAM-MH-26-0048192
              </p>
            </div>

            <div className="text-right shrink-0 space-y-1 pl-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#002E6E]">
                ROOFTOP SOLAR PROPOSAL
              </div>
              <div className="text-xs font-bold text-[#002E6E] bg-[#E8F8FE] px-2.5 py-0.5 rounded border border-[#BCE8FC] inline-block font-mono">
                {quote.quoteNumber}
              </div>
              <div className="text-[10px] text-[#5B6E88]">
                Date: {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-[9.5px] text-[#5B6E88]">
                Validity: {quote.validityDays} Days &bull; Rev: R{quote.revision || 0}
              </div>
            </div>
          </div>

          {/* 2. Client & Grid Connection Details (2 Balanced Columns) */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="grid grid-cols-2 gap-4 p-3 bg-[#F4F7FC] rounded-xl border border-[#E1EBF5] text-[11px]"
          >
            <div>
              <span className="text-[9.5px] font-semibold text-[#5B6E88] uppercase tracking-wider block">
                Customer Details
              </span>
              <p className="font-semibold text-sm text-[#002E6E] mt-0.5">{quote.customerName}</p>
              <p className="text-[#5B6E88]">
                Phone: {quote.customerPhone} {quote.customerEmail ? `• ${quote.customerEmail}` : ''}
              </p>
              <p className="text-[#5B6E88]">
                Site Address: {quote.siteAddress}, {quote.city}
              </p>
            </div>
            <div>
              <span className="text-[9.5px] font-semibold text-[#5B6E88] uppercase tracking-wider block">
                Discom &amp; Grid Connection
              </span>
              <p className="font-semibold text-[#002E6E] mt-0.5">Discom: {quote.discom}</p>
              <p className="text-[#5B6E88]">
                Sanctioned Load: {quote.sanctionLoadKw} kW &bull; Grid:{' '}
                {quote.phase === 'three' ? '3-Phase (415V)' : '1-Phase (230V)'}
              </p>
              <p className="text-[#5B6E88]">
                Monthly Consumption: ~{quote.monthlyUnits} Units/mo &bull; Consumer No:{' '}
                {quote.consumerNumber || 'To be updated from bill'}
              </p>
            </div>
          </div>

          {/* 3. System Configuration Highlights (4 Balanced Metric Tiles) */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="grid grid-cols-4 gap-2.5 text-center text-xs"
          >
            <div className="p-2 rounded-xl border border-[#E1EBF5] bg-white shadow-2xs">
              <span className="text-[9.5px] text-[#5B6E88] uppercase font-semibold block">
                Plant Capacity
              </span>
              <span className="font-bold text-sm text-[#002E6E]">{quote.systemKw} kWp</span>
            </div>
            <div className="p-2 rounded-xl border border-[#E1EBF5] bg-white shadow-2xs">
              <span className="text-[9.5px] text-[#5B6E88] uppercase font-semibold block">
                Solar Modules
              </span>
              <span className="font-semibold text-xs text-[#0F1E36]">
                {quote.panelQty}x {quote.panelWattage}Wp Bifacial
              </span>
            </div>
            <div className="p-2 rounded-xl border border-[#E1EBF5] bg-white shadow-2xs">
              <span className="text-[9.5px] text-[#5B6E88] uppercase font-semibold block">
                Grid Inverter
              </span>
              <span className="font-semibold text-xs text-[#0F1E36]">
                {quote.inverterModel.split(' ')[0]} {quote.phase === 'three' ? '3-Ph' : '1-Ph'}
              </span>
            </div>
            <div className="p-2 rounded-xl border border-[#E1EBF5] bg-white shadow-2xs">
              <span className="text-[9.5px] text-[#5B6E88] uppercase font-semibold block">
                Mounting Kit
              </span>
              <span className="font-semibold text-xs text-[#0F1E36] truncate block">
                {quote.structureType.split(' ')[0]} HDG Kit
              </span>
            </div>
          </div>

          {/* 4. Scope of Supply & Itemized Bill of Materials Table */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="overflow-hidden rounded-xl border border-[#E1EBF5] shadow-2xs"
          >
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#002E6E] text-white font-medium text-[11px]">
                  <th className="py-1.5 px-3 text-center w-9">#</th>
                  <th className="py-1.5 px-3">Item Description</th>
                  <th className="py-1.5 px-3">Specification / Brand</th>
                  <th className="py-1.5 px-3 text-center w-14">Qty</th>
                  <th className="py-1.5 px-3 text-center w-14">UoM</th>
                  <th className="py-1.5 px-3 text-right w-24">Unit Rate (₹)</th>
                  <th className="py-1.5 px-3 text-right w-28">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1EBF5]">
                {quote.lineItems.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F7FC]/70'}>
                    <td className="py-2 px-3 text-[#5B6E88] text-center font-medium">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-[#002E6E]">{item.productName}</td>
                    <td className="py-2 px-3 text-[#5B6E88] text-[11px] truncate max-w-[280px]">
                      {item.spec}
                    </td>
                    <td className="py-2 px-3 text-center font-semibold text-[#0F1E36]">{item.quantity}</td>
                    <td className="py-2 px-3 text-center text-[#5B6E88]">{item.uom}</td>
                    <td className="py-2 px-3 text-right text-[#0F1E36]">
                      {item.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-[#002E6E]">
                      {item.lineTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#F4F7FC] font-medium text-[11px]">
                  <td colSpan={6} className="py-1.5 px-3 text-[#5B6E88] text-right">
                    Net Metering Liaison &amp; Discom Inspection Charges:
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-[#002E6E]">
                    {quote.netMeteringCharge.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr className="bg-[#F4F7FC] font-medium text-[11px]">
                  <td colSpan={6} className="py-1.5 px-3 text-[#5B6E88] text-right">
                    Civil Grouting, Electrical Wiring &amp; Commissioning Labor:
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-[#002E6E]">
                    {quote.installationCharge.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Pricing Summary & ROI Matrix (2 Balanced Columns) */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="grid grid-cols-2 gap-4"
          >
            {/* Left: 25-Year Performance & Generation Projections */}
            <div className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E1EBF5] text-xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#5B6E88] uppercase tracking-wider block">
                  25-Year Performance &amp; Savings Projections
                </span>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <span className="text-[10px] text-[#5B6E88] block">Annual Generation</span>
                    <span className="font-semibold text-[#002E6E] text-xs">
                      {quote.annualGenerationUnits.toLocaleString('en-IN')} Units
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5B6E88] block">Annual Bill Savings</span>
                    <span className="font-semibold text-[#00AC4F] text-xs">
                      {formatIndianCurrency(quote.annualElectricitySavings)} / yr
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5B6E88] block">Simple Payback</span>
                    <span className="font-semibold text-[#002E6E] text-xs">
                      ~{quote.paybackYears} Years
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5B6E88] block">25-Yr Lifetime Savings</span>
                    <span className="font-semibold text-[#00AC4F] text-xs">
                      {formatIndianCurrency(quote.twentyFiveYearSavings)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-[#5B6E88] border-t border-[#E1EBF5] pt-1.5">
                *MNRE generation benchmark: 4.2 units/kW/day under Maharashtra solar insolation.
              </p>
            </div>

            {/* Right: Commercial Financial Breakdown */}
            <div className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E1EBF5] text-xs space-y-1.5">
              <div className="flex justify-between text-[#5B6E88]">
                <span>Taxable Amount (Goods &amp; Services):</span>
                <span className="font-medium text-[#0F1E36]">{formatIndianCurrency(quote.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-[#5B6E88]">
                <span>GST ({quote.gstRate}% Composite Solar):</span>
                <span className="font-medium text-[#0F1E36]">{formatIndianCurrency(quote.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#002E6E] pt-1 border-t border-[#E1EBF5]">
                <span>Total Project Gross Value:</span>
                <span>{formatIndianCurrency(quote.totalGrossPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-[#008A3F] font-semibold bg-[#E7F9F0] px-2.5 py-1 rounded-lg border border-[#B7ECCF]">
                <div>
                  <span className="block text-xs font-semibold">Less: PM Surya Ghar Central Subsidy</span>
                  <span className="text-[9.5px] block text-[#008A3F] font-normal">
                    {quote.subsidyEligibilityStatus === 'verified'
                      ? 'Eligible for Direct DBT to Bank'
                      : 'Subject to National Portal Verification'}
                  </span>
                </div>
                <span className="text-sm font-bold">-{formatIndianCurrency(quote.subsidyAmount)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-xs text-[#002E6E] bg-[#E8F8FE] px-3 py-2 rounded-xl border border-[#00BAF2]">
                <span>NET PAYABLE BY CUSTOMER:</span>
                <span className="text-base font-bold text-[#002E6E]">
                  {formatIndianCurrency(quote.netPayableCustomer)}
                </span>
              </div>
            </div>
          </div>

          {/* 6. PM Surya Ghar Disclaimer Banner */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="p-2 px-3 bg-[#E8F8FE] border border-[#BCE8FC] rounded-xl text-[10px] text-[#002E6E] flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#00BAF2] shrink-0" />
            <p>
              <strong>Disclaimer:</strong> Subsidy amounts are calculated under PM Surya Ghar Muft Bijli Yojana guidelines. Final approval, net metering, and DBT disbursement are subject to DISCOM inspection and National Portal approval.
            </p>
          </div>

          {/* 7. Payment Terms & Bank Details (2 Columns) */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="grid grid-cols-2 gap-4 pt-1 border-t border-[#E1EBF5] text-[10px]"
          >
            <div>
              <span className="font-semibold text-[#002E6E] block mb-1">Payment Terms:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[#5B6E88]">
                <li><strong>20% Token Advance:</strong> Order booking &amp; site feasibility survey.</li>
                <li><strong>60% Material Dispatch:</strong> Upon dispatch of panels &amp; inverter.</li>
                <li><strong>20% Final Commissioning:</strong> Post Discom net-meter synchronization.</li>
              </ul>
            </div>
            <div>
              <span className="font-semibold text-[#002E6E] block mb-1">Bank Details for RTGS / NEFT / IMPS:</span>
              <div className="text-[10px] text-[#0F1E36] space-y-0.5 bg-[#F4F7FC] p-2 rounded-lg border border-[#E1EBF5]">
                <p><strong>A/c Name:</strong> Systomech Engineers &bull; <strong>Bank:</strong> HDFC Bank Ltd</p>
                <p><strong>Current A/c:</strong> 50200084920194 &bull; <strong>IFSC:</strong> HDFC0000039 &bull; <strong>Branch:</strong> SB Road, Pune</p>
              </div>
            </div>
          </div>

          {/* 8. Footer Sign-off Block */}
          <div
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="pt-3 border-t border-[#E1EBF5] flex items-center justify-between text-[10px] text-[#5B6E88]"
          >
            <div>
              <p className="font-semibold text-[#002E6E]">For Systomech Engineers</p>
              <p className="text-[9px] text-[#8C9EB5] mt-4">Authorized Signatory / Technical Lead</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#002E6E]">Customer Acceptance</p>
              <p className="text-[9px] text-[#8C9EB5] mt-4">Signature &amp; Date: ___________________</p>
            </div>
          </div>

          {/* 9. Bottom Navigation Bar for Interactive Screen Viewing - Hidden on Print */}
          <div className="no-print pt-4 mt-2 border-t border-[#E1EBF5] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReturn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#F4F7FC] hover:bg-[#E1EBF5] text-[#002E6E] border border-[#C7D9EC] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-[#00BAF2]" />
              <span>← Return to Quotations List</span>
              <span className="text-[10px] text-[#5B6E88] font-mono">(Esc)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#00BAF2] hover:bg-[#00A6DA] text-white shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Save Full A4 PDF / Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
