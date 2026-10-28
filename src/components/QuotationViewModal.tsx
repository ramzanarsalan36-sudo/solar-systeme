'use client';

import React from 'react';
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
  if (!quote) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const url = generateWhatsAppMessage(quote);
    window.open(url, '_blank');
    // Update quote status to shared if draft
    if (quote.status === 'draft') {
      quote.status = 'shared';
      crmStorage.updateLead({} as any); // trigger storage update
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
        alert('Order created successfully! Field team and store have been notified.');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-4 print:my-0 print:border-none print:shadow-none">
        {/* Action Header - Hidden on Print */}
        <div className="px-6 py-3 bg-[#10233F] text-white flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#F4B740] text-[#10233F]">
              {quote.quoteNumber}
            </span>
            <span className="text-xs text-slate-300">
              Revision: R{quote.revision || 0} &bull; {new Date(quote.createdAt).toLocaleDateString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Share</span>
            </button>

            <button
              onClick={handleEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1b355d] hover:bg-[#25497f] text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            {userRole !== 'store_field' && (
              <>
                <button
                  onClick={handleCreateRevision}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-[#F4B740] hover:bg-amber-500/30 transition-colors"
                  title="Create a new revision with historical preservation"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Revise</span>
                </button>

                <button
                  onClick={handleConvertToOrder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F4B740] hover:bg-[#D99B26] text-[#10233F] transition-colors shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Convert to Order</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1b355d]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formal A4 Document Sheet */}
        <div className="p-6 sm:p-10 text-slate-800 space-y-6 bg-white font-sans text-xs">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-[#10233F] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#10233F] text-[#F4B740] flex items-center justify-center font-bold">
                  <Sun className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-[#10233F] leading-none">
                    SYSTOMECH ENGINEERS
                  </h1>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Solar EPC, Rooftop Power Plants &amp; Energy Solutions
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 pt-1">
                Reg. Office: Office 402, Pride Silicon Plaza, Senapati Bapat Road, Pune - 411016
                <br />
                Branch: Satpur MIDC, Nashik - 422007 | Phone: +91 98201 12345 | Web: www.systomech.com
              </p>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span><strong>GSTIN:</strong> 27AABCS1429Q1ZX</span>
                <span>&bull;</span>
                <span><strong>MSME:</strong> UDYAM-MH-26-0048192</span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-base font-bold text-[#10233F]">SOLAR PROPOSAL</div>
              <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                {quote.quoteNumber}
              </div>
              <div className="text-[11px] text-slate-500">
                Date: {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-[10px] text-slate-500">
                Valid For: {quote.validityDays} Days
              </div>
            </div>
          </div>

          {/* Client & Site Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Details</span>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{quote.customerName}</p>
              <p className="text-slate-600">Phone: {quote.customerPhone}</p>
              {quote.customerEmail && <p className="text-slate-600">Email: {quote.customerEmail}</p>}
              <p className="text-slate-600 mt-0.5">Site Address: {quote.siteAddress}, {quote.city}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Utility &amp; Grid Connection</span>
              <p className="font-semibold text-slate-800 mt-0.5">Discom: {quote.discom}</p>
              <p className="text-slate-600">Consumer No: {quote.consumerNumber || 'To be updated from bill'}</p>
              <p className="text-slate-600">Sanctioned Load: {quote.sanctionLoadKw} kW &bull; Grid: {quote.phase === 'three' ? '3-Phase (415V)' : '1-Phase (230V)'}</p>
              <p className="text-slate-600">Monthly Consumption: ~{quote.monthlyUnits} Units/month</p>
            </div>
          </div>

          {/* Technical Specifications Highlights */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1 mb-2 border-b border-slate-200">
              System Configuration &amp; Equipment
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 block">Plant Capacity</span>
                <span className="font-bold text-sm text-[#10233F]">{quote.systemKw} kWp</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 block">Solar Modules</span>
                <span className="font-bold text-xs text-slate-800">{quote.panelQty}x {quote.panelWattage}Wp Bifacial</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 block">Grid Inverter</span>
                <span className="font-bold text-xs text-slate-800">{quote.inverterModel.split(' ')[0]} {quote.phase === 'three' ? '3-Ph' : '1-Ph'}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 block">Mounting Structure</span>
                <span className="font-bold text-xs text-slate-800 truncate block" title={quote.structureType}>
                  {quote.structureType.split(' ')[0]} HDG Kit
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1 mb-2 border-b border-slate-200">
              Scope of Supply &amp; Itemized Bill of Materials
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-[#10233F] text-white text-[11px]">
                    <th className="p-2 border border-slate-700">#</th>
                    <th className="p-2 border border-slate-700">Item Description</th>
                    <th className="p-2 border border-slate-700">Specification / Brand</th>
                    <th className="p-2 border border-slate-700 text-center">Qty</th>
                    <th className="p-2 border border-slate-700 text-center">UoM</th>
                    <th className="p-2 border border-slate-700 text-right">Unit Rate (₹)</th>
                    <th className="p-2 border border-slate-700 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {quote.lineItems.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-2 border border-slate-200 text-slate-500 text-center">{idx + 1}</td>
                      <td className="p-2 border border-slate-200 font-semibold text-slate-900">{item.productName}</td>
                      <td className="p-2 border border-slate-200 text-slate-600 text-[10px]">{item.spec}</td>
                      <td className="p-2 border border-slate-200 text-center font-medium">{item.quantity}</td>
                      <td className="p-2 border border-slate-200 text-center text-slate-500">{item.uom}</td>
                      <td className="p-2 border border-slate-200 text-right">{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="p-2 border border-slate-200 text-right font-semibold">{item.lineTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50">
                    <td colSpan={6} className="p-2 border border-slate-200 font-medium text-slate-700 text-right">
                      Net Metering Liaison &amp; Discom Inspection Charges:
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-medium">
                      {quote.netMeteringCharge.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td colSpan={6} className="p-2 border border-slate-200 font-medium text-slate-700 text-right">
                      Civil Grouting, Electrical Wiring &amp; Commissioning Labor:
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-medium">
                      {quote.installationCharge.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary & Subsidy Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* ROI & Generation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                25-Year Performance &amp; Savings Projections
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Annual Generation</span>
                  <span className="font-bold text-slate-800">{quote.annualGenerationUnits.toLocaleString('en-IN')} Units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Annual Bill Savings</span>
                  <span className="font-bold text-emerald-700">{formatIndianCurrency(quote.annualElectricitySavings)} / yr</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Simple Payback</span>
                  <span className="font-bold text-[#10233F]">~{quote.paybackYears} Years</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">25-Yr Lifetime Savings</span>
                  <span className="font-bold text-emerald-700">{formatIndianCurrency(quote.twentyFiveYearSavings)}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                *Projections based on MNRE benchmark generation of 4.2 units/kW/day and standard Discom tariffs.
              </p>
            </div>

            {/* Financial Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount (Goods &amp; Services):</span>
                <span>{formatIndianCurrency(quote.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST ({quote.gstRate}% Composite Solar):</span>
                <span>{formatIndianCurrency(quote.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Project Gross Value:</span>
                <span>{formatIndianCurrency(quote.totalGrossPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                <div>
                  <span>Less: PM Surya Ghar Central Subsidy</span>
                  <span className="text-[9px] block text-emerald-600 font-normal">
                    {quote.subsidyEligibilityStatus === 'verified' ? 'Eligible for Direct DBT' : 'Subject to National Portal Verification'}
                  </span>
                </div>
                <span>-{formatIndianCurrency(quote.subsidyAmount)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-sm text-[#10233F] bg-amber-100/70 p-2 rounded-lg border border-amber-300">
                <span>NET PAYABLE BY CUSTOMER:</span>
                <span className="text-base text-amber-950 font-black">
                  {formatIndianCurrency(quote.netPayableCustomer)}
                </span>
              </div>
            </div>
          </div>

          {/* Mandatory Legal Disclaimer Banner */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Disclaimer:</strong> Subsidy amounts shown are estimates calculated under PM Surya Ghar Muft Bijli Yojana guidelines. Final approval, net metering, and DBT disbursement are subject to DISCOM inspection and National Portal approval.
            </p>
          </div>

          {/* Payment Terms & Bank Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-[11px]">
            <div>
              <span className="font-bold text-slate-800 block mb-1">Standard Payment Schedule:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[10px]">
                <li><strong>20% Token Advance:</strong> Upon confirmation of order &amp; site feasibility survey.</li>
                <li><strong>60% Material Dispatch:</strong> Upon dispatch of panels, structure &amp; inverter from warehouse.</li>
                <li><strong>20% Final Commissioning:</strong> Post Discom net-meter testing &amp; plant synchronization.</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-slate-800 block mb-1">Bank Account for RTGS / NEFT / IMPS:</span>
              <div className="text-[10px] text-slate-700 space-y-0.5 bg-slate-50 p-2 rounded border border-slate-200">
                <p><strong>Account Name:</strong> Systomech Engineers</p>
                <p><strong>Bank Name:</strong> HDFC Bank Ltd &bull; <strong>Branch:</strong> SB Road, Pune</p>
                <p><strong>Current A/c No:</strong> 50200084920194 &bull; <strong>IFSC:</strong> HDFC0000039</p>
              </div>
            </div>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              <p className="font-bold text-slate-800">For Systomech Engineers</p>
              <p className="text-[10px] text-slate-500 mt-6">Authorized Signatory / Technical Head</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">Customer Acceptance</p>
              <p className="text-[10px] text-slate-500 mt-6">Sign &amp; Date: ___________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
