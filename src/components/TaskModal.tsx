'use client';

import React, { useState, useEffect } from 'react';
import { crmStorage } from '@/lib/storage';
import { Task, TaskStatus } from '@/types/crm';
import {
  X,
  Wrench,
  CheckSquare,
  Square,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Camera,
  UploadCloud,
  Trash2,
  Check,
  ShieldCheck,
  Sun,
  Zap,
  ArrowLeft,
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskUpdated: () => void;
}

const INSTALLATION_STAGES: {
  id: NonNullable<Task['stage']>;
  label: string;
  icon: string;
}[] = [
  { id: 'survey_done', label: 'Survey Done', icon: '📐' },
  { id: 'structure_installed', label: 'Structure Installed', icon: '🏗️' },
  { id: 'panels_wired', label: 'Panels Wired', icon: '☀️' },
  { id: 'inverter_setup', label: 'Inverter Setup', icon: '⚡' },
  { id: 'net_meter_applied', label: 'Net-Meter Applied', icon: '🔌' },
  { id: 'commissioned', label: 'Commissioned', icon: '✅' },
];

export function TaskModal({ isOpen, onClose, task, onTaskUpdated }: TaskModalProps) {
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'pending');
  const [currentStage, setCurrentStage] = useState<Task['stage']>(task?.stage || 'survey_done');
  const [siteNotes, setSiteNotes] = useState<string>(task?.siteNotes || '');
  const [photos, setPhotos] = useState<string[]>(
    task?.proofPhotos && task.proofPhotos.length > 0
      ? task.proofPhotos
      : [
          'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
        ]
  );

  React.useEffect(() => {
    if (task) {
      setStatus(task.status);
      setCurrentStage(task.stage || 'survey_done');
      setSiteNotes(task.siteNotes || '');
      setPhotos(
        task.proofPhotos && task.proofPhotos.length > 0
          ? task.proofPhotos
          : [
              'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
            ]
      );
    }
  }, [task]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleToggleChecklist = (checkId: string) => {
    crmStorage.toggleTaskChecklist(task.id, checkId);
    onTaskUpdated();
  };

  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=600&q=80', // Structure
      'https://images.unsplash.com/photo-1548611716-ad982b6b553e?auto=format&fit=crop&w=600&q=80', // Inverter
      'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=600&q=80', // ACDB/DCDB
    ];
    const nextPhoto = samplePhotos[photos.length % samplePhotos.length];
    setPhotos([...photos, nextPhoto]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos([...photos, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    crmStorage.updateTaskStatus(task.id, status, siteNotes, currentStage, photos);
    onTaskUpdated();
    onClose();
  };

  const completedCount = task.checklist.filter((c) => c.done).length;
  const progressPercent =
    task.checklist.length > 0 ? Math.round((completedCount / task.checklist.length) * 100) : 0;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden my-6 flex flex-col">
        {/* Modal Header with Prominent Back Option */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#0F172A] text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Return (or press Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Back</span>
            </button>

            <div className="h-5 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">{task.taskNumber}</h3>
                  <span className="text-[10px] px-2 py-0.2 rounded font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                    Field Ops
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Engineer: {task.assignedToName}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs flex-1 overflow-y-auto">
          {/* Title & Customer Information */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                <p className="text-slate-600 text-xs mt-0.5">{task.description}</p>
              </div>
              <a
                href={`tel:${task.customerPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{task.siteAddress}, {task.city}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Target Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            </div>
          </div>

          {/* QUICK-TAP INSTALLATION STAGE CARDS (Prompt Requirement) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
              Live Site Installation Stage (Tap to Update)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INSTALLATION_STAGES.map((stage) => {
                const isSelected = currentStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      setCurrentStage(stage.id);
                      if (stage.id === 'commissioned') setStatus('completed');
                      else setStatus('in_progress');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-sm scale-102 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{stage.icon}</span>
                    <span className="text-xs">{stage.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PHOTO UPLOAD PLACEHOLDER FOR PROOF OF INSTALLATION (Prompt Requirement) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                <span>Site Installation Photo Proof ({photos.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="text-[10px] text-amber-700 hover:underline font-semibold"
              >
                + Add Demo Photo
              </button>
            </div>

            {/* Photos Grid & Upload Button */}
            <div className="grid grid-cols-3 gap-3">
              {photos.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden h-24 border border-slate-200">
                  <img src={url} alt={`Site proof ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Upload Trigger Placeholder */}
              <label className="h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/40 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-500 hover:text-amber-800">
                <Camera className="w-6 h-6 mb-1 text-slate-400 group-hover:text-amber-600" />
                <span className="text-[10px] font-bold">Snap / Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Field Checklist */}
          <div>
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Field Verification Checklist ({completedCount}/{task.checklist.length})
              </span>
              <span className="font-bold text-[#0A1128]">{progressPercent}%</span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-1.5">
              {task.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`p-2 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                    item.done
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.done ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={item.done ? 'line-through text-slate-500 font-medium' : 'font-medium'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Site Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Field Site Notes / Observations / DISCOM Net-Meter Update
            </label>
            <textarea
              rows={2}
              value={siteNotes}
              onChange={(e) => setSiteNotes(e.target.value)}
              placeholder="e.g. Structure anchored to RCC slab with chemical fastener. Inverter earth resistance: 1.4 Ohms. Ready for Discom inspection."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-[#0A1128] bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors shadow-md shadow-amber-400/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Update Site Execution Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
