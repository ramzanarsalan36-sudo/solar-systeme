import { Quotation } from '@/types/crm';
import { formatIndianCurrency } from './solar-calc';

export function generateWhatsAppMessage(quote: Quotation): string {
  const cleanPhone = quote.customerPhone.replace(/[^0-9]/g, '');
  const phoneFormatted = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.replace(/^0+/, '')}`;

  const message = `*SYSTOMECH ENGINEERS — ROOFTOP SOLAR PROPOSAL* ☀️

Namaste *${quote.customerName}* ji,

Thank you for consulting Systomech Engineers for your rooftop solar project. Here is your preliminary solar quotation:

📋 *Quotation Ref:* ${quote.quoteNumber}
⚡ *System Capacity:* ${quote.systemKw} kW (${quote.phase === 'three' ? '3-Phase' : '1-Phase'})
🔆 *Solar Panels:* ${quote.panelQty}x ${quote.panelModel}
🔌 *Inverter:* ${quote.inverterModel}
🏗️ *Structure:* ${quote.structureType}

📊 *FINANCIAL SUMMARY:*
• Total Project Cost: ${formatIndianCurrency(quote.totalGrossPrice)}
• PM Surya Ghar Central Subsidy: ${formatIndianCurrency(quote.subsidyAmount)}
💰 *Net Payable by You:* *${formatIndianCurrency(quote.netPayableCustomer)}*

💡 *SAVINGS & RETURN:*
• Estimated Monthly Generation: ~${Math.round(quote.annualGenerationUnits / 12)} Units
• Estimated Annual Electricity Savings: *${formatIndianCurrency(quote.annualElectricitySavings)} / year*
• Simple Payback Period: *~${quote.paybackYears} Years*
• 25-Year Cumulative Savings: ${formatIndianCurrency(quote.twentyFiveYearSavings)}

🔒 *WARRANTY:*
• 25 Years Performance Warranty on Solar Panels
• 10 Years Warranty on Inverter
• 5 Years Free Comprehensive O&M

Please review the attached formal PDF quotation. You can reach out to our Senior Solar Consultant at +91 98201 12345 or reply directly to this message.

*Systomech Engineers*
Reg. Office: Pune & Nashik, Maharashtra
GSTIN: 27AABCS1429Q1ZX | MSME: UDYAM-MH-26-0048192`;

  return `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(message)}`;
}

export function generateEmailLink(quote: Quotation): string {
  const subject = encodeURIComponent(`Solar EPC Quotation ${quote.quoteNumber} — Systomech Engineers for ${quote.customerName}`);
  const body = encodeURIComponent(`Dear ${quote.customerName},

Greetings from Systomech Engineers!

Please find your customized Rooftop Solar Power Plant proposal for ${quote.systemKw} kW capacity at your site (${quote.siteAddress}).

Summary of Proposition:
- System Capacity: ${quote.systemKw} kW
- Expected Monthly Generation: ${Math.round(quote.annualGenerationUnits / 12)} kWh
- Total Project Value (inc. GST): ${formatIndianCurrency(quote.totalGrossPrice)}
- PM Surya Ghar DBT Subsidy: ${formatIndianCurrency(quote.subsidyAmount)}
- Net Investment: ${formatIndianCurrency(quote.netPayableCustomer)}
- Estimated Annual Savings: ${formatIndianCurrency(quote.annualElectricitySavings)} / year
- Estimated Payback: ${quote.paybackYears} years

Attached is the full itemized scope of supply, structural drawings, and payment schedule.

Best regards,
Priya Verma | Senior Solar Consultant
Systomech Engineers
Phone: +91 98202 23456 | Web: systomech.com`);

  const recipient = quote.customerEmail || '';
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

export function printQuotation(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
