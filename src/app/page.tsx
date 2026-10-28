'use client';

import React, { useState, useEffect } from 'react';
import { User, Lead, Product, Order, Task, Quotation } from '@/types/crm';
import { crmStorage } from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { LeadsView } from '@/components/LeadsView';
import { QuotationsView } from '@/components/QuotationsView';
import { OrdersView } from '@/components/OrdersView';
import { InventoryView } from '@/components/InventoryView';
import { TasksView } from '@/components/TasksView';
import { ProductsView } from '@/components/ProductsView';
import { AuditView } from '@/components/AuditView';

// Modals
import { LeadModal } from '@/components/LeadModal';
import { QuoteModal } from '@/components/QuoteModal';
import { QuotationViewModal } from '@/components/QuotationViewModal';
import { StockMovementModal } from '@/components/StockMovementModal';
import { PriceUpdateModal } from '@/components/PriceUpdateModal';
import { PaymentModal } from '@/components/PaymentModal';
import { TaskModal } from '@/components/TaskModal';

import { INITIAL_USERS } from '@/lib/initial-data';
import { Sun } from 'lucide-react';

export default function SolarCrmApp() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setForceRender] = useState(0);

  useEffect(() => {
    setCurrentUser(crmStorage.getCurrentUser());
    setMounted(true);
  }, []);

  // Modal triggers
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [quoteViewModalOpen, setQuoteViewModalOpen] = useState(false);

  // Active items for modals
  const [initialLeadForQuote, setInitialLeadForQuote] = useState<Lead | null>(null);
  const [activeProductForStock, setActiveProductForStock] = useState<Product | null>(null);
  const [activeProductForPrice, setActiveProductForPrice] = useState<Product | null>(null);
  const [activeOrderForPayment, setActiveOrderForPayment] = useState<Order | null>(null);
  const [activeTaskToView, setActiveTaskToView] = useState<Task | null>(null);
  const [activeQuoteToView, setActiveQuoteToView] = useState<Quotation | null>(null);

  // Reactive listener for storage updates across components
  useEffect(() => {
    function handleStorageChange() {
      setForceRender((prev) => prev + 1);
    }
    window.addEventListener('systomech_crm_storage_change', handleStorageChange);
    return () => window.removeEventListener('systomech_crm_storage_change', handleStorageChange);
  }, []);

  const handleUserChange = (newUser: User) => {
    crmStorage.setCurrentUser(newUser);
    setCurrentUser(newUser);
    // If current tab is restricted for new role, switch to dashboard
    if (newUser.role === 'store_field' && ['leads', 'calculator', 'quotations', 'audit'].includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (newUser.role === 'sales' && ['inventory', 'tasks', 'audit'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  };

  const handleOpenQuoteForLead = (lead: Lead) => {
    setInitialLeadForQuote(lead);
    setQuoteModalOpen(true);
  };

  const handleQuoteCreated = (newQuote: Quotation) => {
    setActiveQuoteToView(newQuote);
    setQuoteViewModalOpen(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#10233F] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F4B740] to-[#D99B26] flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
          <Sun className="w-7 h-7 text-[#10233F] stroke-[2.5]" />
        </div>
        <h2 className="text-lg font-bold tracking-tight">SYSTOMECH ENGINEERS</h2>
        <p className="text-xs text-slate-400 mt-1">Initializing Solar CRM Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Application Header */}
      <Navbar
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onOpenLeadModal={() => setLeadModalOpen(true)}
        onOpenQuoteModal={() => {
          setInitialLeadForQuote(null);
          setQuoteModalOpen(true);
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex">
        {/* Left Responsive Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'calculator') {
              setInitialLeadForQuote(null);
              setQuoteModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          role={currentUser.role}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        {/* Main Operational View Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {activeTab === 'dashboard' && (
            <DashboardView
              role={currentUser.role}
              setActiveTab={setActiveTab}
              onOpenQuoteModal={() => {
                setInitialLeadForQuote(null);
                setQuoteModalOpen(true);
              }}
              onOpenLeadModal={() => setLeadModalOpen(true)}
              onOpenStockModal={() => {
                setActiveProductForStock(null);
                setStockModalOpen(true);
              }}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsView
              role={currentUser.role}
              onOpenLeadModal={() => setLeadModalOpen(true)}
              onOpenQuoteForLead={handleOpenQuoteForLead}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationsView
              role={currentUser.role}
              onOpenQuoteModal={() => {
                setInitialLeadForQuote(null);
                setQuoteModalOpen(true);
              }}
              onSelectQuoteToView={(quote) => {
                setActiveQuoteToView(quote);
                setQuoteViewModalOpen(true);
              }}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              role={currentUser.role}
              onOpenPaymentModal={(order) => {
                setActiveOrderForPayment(order);
                setPaymentModalOpen(true);
              }}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              role={currentUser.role}
              onOpenStockModal={(prod) => {
                setActiveProductForStock(prod || null);
                setStockModalOpen(true);
              }}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              role={currentUser.role}
              onSelectTask={(task) => {
                setActiveTaskToView(task);
                setTaskModalOpen(true);
              }}
              onRefresh={() => setForceRender((p) => p + 1)}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              role={currentUser.role}
              onOpenPriceModal={(prod) => {
                setActiveProductForPrice(prod);
                setPriceModalOpen(true);
              }}
            />
          )}

          {activeTab === 'audit' && <AuditView role={currentUser.role} />}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        onLeadCreated={(lead) => {
          setActiveTab('leads');
          setForceRender((p) => p + 1);
        }}
      />

      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialLead={initialLeadForQuote}
        onQuoteCreated={handleQuoteCreated}
      />

      <QuotationViewModal
        quote={activeQuoteToView}
        onClose={() => setQuoteViewModalOpen(false)}
        userRole={currentUser.role}
        onOrderCreated={() => {
          setActiveTab('orders');
          setForceRender((p) => p + 1);
        }}
        onRevisionCreated={(revised) => {
          setActiveQuoteToView(revised);
          setForceRender((p) => p + 1);
        }}
      />

      <StockMovementModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        product={activeProductForStock}
        onMovementComplete={() => setForceRender((p) => p + 1)}
      />

      <PriceUpdateModal
        isOpen={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        product={activeProductForPrice}
        onPriceUpdated={() => setForceRender((p) => p + 1)}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        order={activeOrderForPayment}
        onPaymentLogged={() => setForceRender((p) => p + 1)}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={activeTaskToView}
        onTaskUpdated={() => setForceRender((p) => p + 1)}
      />
    </div>
  );
}
