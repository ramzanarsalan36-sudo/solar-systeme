import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Systomech Engineers — Solar CRM | Rooftop EPC & Operations',
  description:
    'Production-grade Solar CRM for Systomech Engineers: Lead intake, PM Surya Ghar bill-to-quote sizing, live inventory ledger, order tracking, and field tasks.',
  keywords: [
    'Solar CRM',
    'Systomech Engineers',
    'Rooftop Solar',
    'PM Surya Ghar',
    'Solar Quotation',
    'Solar EPC Maharashtra',
    'Solar Inventory Management',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#172033]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
