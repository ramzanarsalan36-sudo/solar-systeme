'use client';

import React, { useState, useEffect } from 'react';
import { soundManager } from '@/lib/sound';
import { crmStorage } from '@/lib/storage';
import { Order, PaymentRecord } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import { X, CreditCard, ArrowLeft } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPaymentLogged: () => void;
}

export function PaymentModal({ isOpen, onClose, order, onPaymentLogged }: PaymentModalProps) {
  const [amount, setAmount] = useState<number>(order ? Math.min(order.balanceDue, Math.round(order.totalOrderValue * 0.2)) : 50000);
  const [method, setMethod] = useState<PaymentRecord['method']>('upi');
  const [stage, setStage] = useState<PaymentRecord['stage']>('advance_booking');
  const [referenceNumber, setReferenceNumber] = useState<string>('UPI/');
  const [notes, setNotes] = useState<string>('');

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

  if (!isOpen || !order) return null;

  const handleReturn = () => {
    soundManager.playSoftClick();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Payment amount must be greater than zero');
      return;
    }
    if (amount > order.balanceDue) {
      if (!confirm(`Amount ₹${amount.toLocaleString('en-IN')} exceeds current balance due ₹${order.balanceDue.toLocaleString('en-IN')}. Proceed anyway?`)) {
        return;
      }
    }

    const currentUser = crmStorage.getCurrentUser();
    crmStorage.recordPayment(order.id, {
      amount: Number(amount),
      date: new Date().toISOString(),
      method,
      referenceNumber: referenceNumber || 'REF-TBD',
      stage,
      status: 'verified',
      notes,
      recordedBy: currentUser.id,
      recordedByName: currentUser.name,
    });

    // Play Paytm Soundbox celebration chime!
    soundManager.playPaytmChime();

    onPaymentLogged();
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleReturn();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#002E6E]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-[#E1EBF5] w-full max-w-md overflow-hidden my-6">
        {/* Standardized Modal Header with Back / Return Option */}
        <div className="px-5 py-3.5 border-b border-[#E1EBF5] flex items-center justify-between shrink-0 bg-[#F4F7FC]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReturn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#002E6E] hover:text-[#00BAF2] bg-white hover:bg-[#E8F8FE] border border-[#E1EBF5] shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Cancel & Return (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00BAF2]" />
              <span>Back</span>
              <span className="text-[10px] text-[#5B6E88] font-mono hidden sm:inline">(Esc)</span>
            </button>

            <div className="h-5 w-px bg-[#E1EBF5] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E7F9F0] border border-[#B7ECCF] text-[#00AC4F] flex items-center justify-center font-bold shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#002E6E] tracking-tight leading-snug">
                  Record Milestone Payment
                </h3>
                <p className="text-[11px] text-[#5B6E88] font-normal">
                  Order: {order.orderNumber} &bull; {order.customerName}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReturn}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5B6E88] hover:text-[#002E6E] hover:bg-white transition-colors cursor-pointer"
            title="Close (Esc)"
            aria-label="Close"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E1EBF5] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#5B6E88] block">Total Order Value</span>
              <span className="font-semibold text-[#002E6E]">{formatIndianCurrency(order.totalOrderValue)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#5B6E88] block">Current Balance Due</span>
              <span className="font-bold text-[#FFA400]">{formatIndianCurrency(order.balanceDue)}</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#0F1E36] mb-1">Payment Milestone Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36]"
            >
              <option value="advance_booking">Token Advance (20% Booking)</option>
              <option value="dispatch_panels">Dispatch Payment (60% Material)</option>
              <option value="final_commissioning">Commissioning &amp; Net-Metering (20%)</option>
              <option value="subsidy_disbursed">PM Surya Ghar Subsidy DBT Disbursed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#0F1E36] mb-1">Amount (₹)</label>
              <input
                type="number"
                min="1000"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden text-[#002E6E] font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-[#0F1E36] mb-1">Payment Mode</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden bg-white text-[#0F1E36]"
              >
                <option value="upi">UPI / QR Code (Paytm/GPay)</option>
                <option value="neft">NEFT / RTGS</option>
                <option value="cheque">Bank Cheque</option>
                <option value="cash">Cash Receipt</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#0F1E36] mb-1">Transaction Ref / UTR / Cheque No.</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UPI-HDFC-982348 or UTR-2026-001"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden text-[#0F1E36]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#0F1E36] mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received via customer HDFC Bank app. Net-metering application dispatched."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1EBF5] focus:border-[#00BAF2] focus:ring-2 focus:ring-[#00BAF2]/20 focus:outline-hidden text-[#0F1E36] placeholder:text-slate-400"
            />
          </div>

          {/* Standardized Modal Footer with Paytm Green Confirm button */}
          <div className="pt-3 border-t border-[#E1EBF5] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReturn}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#002E6E] hover:text-[#00BAF2] bg-white hover:bg-[#E8F8FE] border border-[#E1EBF5] rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00BAF2]" />
              <span>Cancel &amp; Return</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#00AC4F] hover:bg-[#009644] active:bg-[#00823A] rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>Record Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
