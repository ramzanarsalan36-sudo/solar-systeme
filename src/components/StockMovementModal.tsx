'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Product, MovementType } from '@/types/crm';
import { X, Warehouse, ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertCircle } from 'lucide-react';

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
      referenceId: referenceId || undefined,
      notes: notes || `Recorded ${type} movement of ${quantity} ${currentProduct.uom}`,
    });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    onMovementComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-6">
        <div className="px-5 py-3.5 bg-[#10233F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F4B740] text-[#10233F] flex items-center justify-center font-bold">
              <Warehouse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Record Stock Movement</h3>
              <p className="text-[10px] text-slate-300">Live Inventory Ledger Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-[#1b355d]">
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
            <label className="block font-medium text-slate-700 mb-1">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Stock: {p.stock} {p.uom}
                </option>
              ))}
            </select>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <span className="text-slate-600">Current Stock Balance:</span>
            <span className={`font-bold ${currentProduct.stock <= currentProduct.minStockAlert ? 'text-rose-600' : 'text-slate-900'}`}>
              {currentProduct.stock} {currentProduct.uom}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('IN');
                setReferenceType('PO');
                setReferenceId('PO-2026-');
              }}
              className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-semibold transition-colors ${
                type === 'IN'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
              <span>Stock In (Receipt)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('OUT');
                setReferenceType('DISPATCH_ORDER');
                setReferenceId('ORD-2026-');
              }}
              className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-semibold transition-colors ${
                type === 'OUT'
                  ? 'bg-rose-50 border-rose-500 text-rose-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4 text-rose-600" />
              <span>Stock Out (Dispatch)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Quantity ({currentProduct.uom})</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Reference Document</label>
              <select
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="PO">Purchase Order (PO)</option>
                <option value="DISPATCH_ORDER">Customer Order Dispatch</option>
                <option value="STOCK_AUDIT">Physical Stock Audit</option>
                <option value="SITE_RETURN">Site Material Return</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reference ID / Challan No.</label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. PO-WAAREE-091 or ORD-2026-003"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notes / Reason</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received container delivery from factory / Dispatched for Baner site"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
              Confirm Movement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
