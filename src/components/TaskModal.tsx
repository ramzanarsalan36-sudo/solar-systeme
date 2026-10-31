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
      setPhotos(
        task.proofPhotos && task.proofPhotos.length > 0 ? task.proofPhotos : [DEMO_SOLAR_PHOTOS[0]]
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
    const nextPhoto = DEMO_SOLAR_PHOTOS[photos.length % DEMO_SOLAR_PHOTOS.length];
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-medium">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  {task.taskNumber}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  Field Operations
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Assigned Tech: {task.assignedToName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
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
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            </div>
          </div>

          {/* Installation Stage Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Installation Stage (Tap to Update)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INSTALLATION_STAGES.map((stage) => {
                const Icon = stage.icon;
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
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-normal'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs truncate">{stage.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Proof Section (with Fallback to Prevent Broken Images) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                <span>Site Photos ({photos.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-medium"
              >
                + Add Demo Photo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {photos.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden h-24 border border-slate-200 bg-slate-100">
                  <img
                    src={url}
                    alt={`Site installation ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEMO_SOLAR_PHOTOS[0];
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <label className="h-24 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50/70 hover:bg-amber-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-500 hover:text-amber-700">
                <Camera className="w-5 h-5 mb-1 text-slate-400" />
                <span className="text-[10px] font-medium">Upload Photo</span>
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

          {/* Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Field Verification Checklist
              </span>
              <span className="text-[11px] font-medium text-slate-600">
                {completedCount}/{task.checklist.length} ({progressPercent}%)
              </span>
            </div>

            <div className="space-y-1.5">
              {task.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                    item.done
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-xs ${item.done ? 'line-through text-slate-500' : 'font-normal'}`}>
                    {item.label}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      item.done
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              ))}
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
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:outline-hidden bg-white text-slate-800"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Update Task Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}