import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SYSTOMECH ENGINEERS — Solar CRM & Operations Platform',
  description:
    'Solar CRM for Systomech Engineers: Powering a greener tomorrow with customer lead pipeline, quotations, orders, inventory stock, and field tasks.',
  keywords: [
    'Solar CRM',
    'Systomech Engineers',
    'Solar EPC',
    'PM Surya Ghar',
    'Solar Quotation',
    'Solar Inventory Management',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${poppins.variable}`} suppressHydrationWarning>
      <body className={`min-h-full flex flex-col bg-[#F3F5F9] text-[#1E293B] font-sans antialiased`} style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
