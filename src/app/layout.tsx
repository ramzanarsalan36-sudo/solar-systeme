import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

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
    <html lang="en" className={`h-full antialiased ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className={`min-h-full flex flex-col bg-[#F8FAFC] text-[#172033] ${plusJakartaSans.className}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
