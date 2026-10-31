'use client';

import React, { useState, useEffect } from 'react';
import { crmStorage } from '@/lib/storage';
import { Product } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import { X, Tag, ArrowLeft } from 'lucide-react';

interface PriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onPriceUpdated: () => void;
}

export function PriceUpdateModal({ isOpen, onClose, product, onPriceUpdated }: PriceUpdateModalProps) {
  const [newPrice, setNewPrice] = useState<number>(product?.price || 0);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrice <= 0) {
      alert('Price must be greater than zero');
      return;
    }
    if (!reason.trim()) {
      alert('Please provide an administrative reason for this price change (audit requirement)');
      return;
    }

    const updated = { ...product, price: Number(newPrice) };
    crmStorage.updateProduct(updated, reason);
    onPriceUpdated();
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-md overflow-hidden my-6">
        {/* Standardized Modal Header with Back / Return Option */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Cancel & Return (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">(Esc)</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center font-medium shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight leading-snug">
                  Update Catalog Price
                </h3>
                <p className="text-[11px] text-slate-500 font-normal">
                  Admin Master Price &bull; Audit Logged
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Close (Esc)"
            aria-label="Close"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-semibold text-slate-900 text-xs">{product.name}</h4>
            <div className="flex items-center justify-between text-slate-500 pt-1">
              <span>SKU: <strong className="font-mono text-slate-700">{product.sku}</strong></span>
              <span>Current Price: <strong className="text-slate-900">{formatIndianCurrency(product.price)}</strong> / {product.uom}</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              New Approved Rate (₹ per {product.uom})
            </label>
            <input
              type="number"
              min="1"
              step="10"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Reason for Price Revision (Audit requirement)
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Q4 vendor price reduction / Raw steel price hike for mounting structures"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Standardized Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancel &amp; Return</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Save &amp; Update Price</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
