'use client';

import React, { useState, useEffect } from 'react';
import { crmStorage } from '@/lib/storage';
import { Task, TaskStatus } from '@/types/crm';
import {
  X,
  Wrench,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Camera,
  Trash2,
  Check,
  Sun,
  Layers,
  Zap,
  Plug,
  ShieldCheck,
  Plus,
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
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'survey_done', label: 'Survey Done', icon: Sun },
  { id: 'structure_installed', label: 'Structure Mounted', icon: Layers },
  { id: 'panels_wired', label: 'Panels Wired', icon: Sun },
  { id: 'inverter_setup', label: 'Inverter Setup', icon: Zap },
  { id: 'net_meter_applied', label: 'Net-Meter Applied', icon: Plug },
  { id: 'commissioned', label: 'Commissioned', icon: ShieldCheck },
];

// Clean inline SVG mock site photos to prevent broken image icons
const DEMO_SOLAR_PHOTOS = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231e293b'/%3E%3Crect x='40' y='50' width='320' height='180' rx='8' fill='%230f172a' stroke='%2338bdf8' stroke-width='2'/%3E%3Cline x1='40' y1='110' x2='360' y2='110' stroke='%2338bdf8' stroke-width='1.5'/%3E%3Cline x1='40' y1='170' x2='360' y2='170' stroke='%2338bdf8' stroke-width='1.5'/%3E%3Cline x1='120' y1='50' x2='120' y2='230' stroke='%2338bdf8' stroke-width='1.5'/%3E%3Cline x1='200' y1='50' x2='200' y2='230' stroke='%2338bdf8' stroke-width='1.5'/%3E%3Cline x1='280' y1='50' x2='280' y2='230' stroke='%2338bdf8' stroke-width='1.5'/%3E%3Ctext x='200' y='270' fill='%23f59e0b' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle'%3EModule Array String %231%3C/text%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%230f172a'/%3E%3Crect x='100' y='40' width='200' height='200' rx='12' fill='%23e2e8f0' stroke='%2364748b' stroke-width='3'/%3E%3Ccircle cx='200' cy='120' r='35' fill='%2310b981'/%3E%3Ctext x='200' y='180' fill='%230f172a' font-family='sans-serif' font-size='13' font-weight='bold' text-anchor='middle'%3EGrowatt 3.0kW On-Grid%3C/text%3E%3Ctext x='200' y='270' fill='%2310b981' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle'%3EInverter Wall Mounting OK%3C/text%3E%3C/svg%3E",
];

export function TaskModal({ isOpen, onClose, task, onTaskUpdated }: TaskModalProps) {
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'pending');
  const [currentStage, setCurrentStage] = useState<Task['stage']>(task?.stage || 'survey_done');
  const [siteNotes, setSiteNotes] = useState<string>(task?.siteNotes || '');
  const [photos, setPhotos] = useState<string[]>(
    task?.proofPhotos && task.proofPhotos.length > 0 ? task.proofPhotos : [DEMO_SOLAR_PHOTOS[0]]
  );

  React.useEffect(() => {
    if (task) {
      setStatus(task.status);
      setCurrentStage(task.stage || 'survey_done');
      setSiteNotes(task.siteNotes || '');
      setPhotos(task.proofPhotos && task.proofPhotos.length > 0 ? task.proofPhotos : [DEMO_SOLAR_PHOTOS[0]]);
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

  const handleStageSelect = (stageId: Task['stage']) => {
    setCurrentStage(stageId);
    if (stageId === 'commissioned') {
      setStatus('completed');
    } else {
      setStatus('in_progress');
    }
  };

  const handleAddPhoto = () => {
    const nextPhoto = DEMO_SOLAR_PHOTOS[photos.length % DEMO_SOLAR_PHOTOS.length];
    setPhotos([...photos, nextPhoto]);
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    crmStorage.updateTaskStatus(task.id, status, siteNotes, currentStage, photos);
    onTaskUpdated();
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 no-print animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
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
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 tracking-tight leading-snug">
                    {task.taskNumber}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Field Operations
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Assigned Tech: {task.assignedToName}
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

        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs flex-1 overflow-y-auto">
          {/* Customer & Site Details Card */}
          <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{task.title}</h4>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{task.description}</p>
              </div>
              <a
                href={`tel:${task.customerPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{task.siteAddress}, {task.city}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Target Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            </div>
          </div>

          {/* Interactive Milestone Stages */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Live Site Installation Stage (Tap to Update)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INSTALLATION_STAGES.map((s) => {
                const Icon = s.icon;
                const isCurrent = currentStage === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStageSelect(s.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-white' : 'text-blue-600'}`} />
                    <span className="text-xs font-semibold leading-tight">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Site Installation Proof Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Site Installation Photo Proof ({photos.length})
              </label>
              <button
                type="button"
                onClick={handleAddPhoto}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                + Add Demo Photo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {photos.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3">
                  <img
                    src={url}
                    alt={`Site proof ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEMO_SOLAR_PHOTOS[0];
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddPhoto}
                className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center p-3 text-slate-500 hover:text-blue-600 aspect-4/3 transition-colors cursor-pointer"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">Snap / Upload</span>
              </button>
            </div>
          </div>

          {/* Field Notes */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Field Site Notes / DISCOM Observations
            </label>
            <textarea
              rows={2}
              value={siteNotes}
              onChange={(e) => setSiteNotes(e.target.value)}
              placeholder="e.g. Earthing pit resistance 1.4 Ohms. Ready for Discom net-meter inspection."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden bg-white text-slate-800 transition-colors"
            />
          </div>
        </form>

        {/* Standardized Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Cancel &amp; Return</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <span>Update Task Status</span>
          </button>
        </div>
      </div>
    </div>
  );
}
