'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Product } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import { X, Tag, ShieldAlert, CheckCircle } from 'lucide-react';

interface PriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onPriceUpdated: () => void;
}

export function PriceUpdateModal({ isOpen, onClose, product, onPriceUpdated }: PriceUpdateModalProps) {
  const [newPrice, setNewPrice] = useState<number>(product?.price || 0);
  const [reason, setReason] = useState<string>('');

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-6">
        <div className="px-5 py-3.5 bg-[#10233F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F4B740] text-[#10233F] flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Update Approved Catalog Price</h3>
              <p className="text-[10px] text-slate-300">Admin Price Master Authority</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-[#1b355d]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <p className="font-bold">Critical Data Consistency Rule:</p>
              <p className="text-amber-800 mt-0.5">
                This change updates the central price catalog for all <strong>new quotations</strong>. Existing and previously issued quotations will strictly <strong>retain their historical snapshot prices</strong> to preserve quotation integrity.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-0.5">Product</label>
            <p className="font-bold text-slate-900 text-sm">{product.name}</p>
            <p className="text-slate-500 text-[11px]">{product.sku} &bull; {product.spec}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Current Selling Price</span>
              <span className="font-bold text-sm text-slate-800">{formatIndianCurrency(product.price)}</span>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">New Approved Price (₹) *</label>
              <input
                type="number"
                min="1"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Audit Reason for Price Revision *
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Manufacturer price drop passed on / Q4 festive discount update"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-bold text-[#10233F] bg-[#F4B740] hover:bg-[#D99B26] rounded-lg shadow-xs"
            >
              Approve &amp; Log Price Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
