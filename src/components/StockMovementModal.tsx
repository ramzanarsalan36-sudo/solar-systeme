'use client';

import React, { useState, useEffect } from 'react';
import { crmStorage } from '@/lib/storage';
import { Product, MovementType } from '@/types/crm';
import { X, Warehouse, AlertCircle, ArrowLeft } from 'lucide-react';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onMovementComplete: () => void;
}

export function StockMovementModal({ isOpen, onClose, product, onMovementComplete }: StockMovementModalProps) {
  const products = crmStorage.getProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>(product?.id || products[0]?.id || '');
  const [type, setType] = useState<MovementType>('IN');
  const [quantity, setQuantity] = useState<number>(10);
  const [referenceType, setReferenceType] = useState<'PO' | 'DISPATCH_ORDER' | 'STOCK_AUDIT' | 'SITE_RETURN'>('PO');
  const [referenceId, setReferenceId] = useState<string>('PO-2026-');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (quantity <= 0) {
      setErrorMessage('Please enter a valid quantity greater than zero');
      return;
    }

    const result = crmStorage.recordStockMovement({
      productId: currentProduct.id,
      type,
      quantity: Number(quantity),
      referenceType,
      referenceId: referenceId || 'REF-GENERAL',
      notes,
    });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    onMovementComplete();
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
                <Warehouse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight leading-snug">
                  Record Stock Movement
                </h3>
                <p className="text-[11px] text-slate-500 font-normal">
                  Warehouse &bull; Inward / Outward / Return
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
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Item / SKU</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden bg-white text-slate-800"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Available: {p.stock} {p.uom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Movement Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'IN', label: 'Inward (+)' },
                { id: 'OUT', label: 'Outward (-)' },
                { id: 'ADJUSTMENT', label: 'Audit Adj' },
                { id: 'RETURN', label: 'Site Return' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setType(m.id as MovementType)}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    type === m.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Quantity ({currentProduct?.uom || 'Nos'})
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Ref Document</label>
              <select
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden bg-white text-slate-800"
              >
                <option value="PO">Purchase Order (PO)</option>
                <option value="DISPATCH_ORDER">Project Dispatch</option>
                <option value="SITE_RETURN">Site Return</option>
                <option value="STOCK_AUDIT">Stock Audit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reference Number</label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. PO-WAAREE-091 or ORD-2026-003"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notes / Reason</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received container delivery from factory / Dispatched for Baner site"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden text-slate-900 placeholder:text-slate-400"
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
              <span>Confirm Movement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
