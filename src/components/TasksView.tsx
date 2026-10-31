'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Task, TaskPriority, TaskStatus, TaskType, UserRole } from '@/types/crm';
import {
  Wrench,
  Search,
  PlusCircle,
  Clock,
  Phone,
  MapPin,
  CheckSquare,
  Square,
  AlertTriangle,
  ChevronRight,
  X,
  Sun,
  Layers,
  Zap,
  Plug,
  ShieldCheck,
} from 'lucide-react';

interface TasksViewProps {
  role: UserRole;
  onSelectTask: (task: Task) => void;
  onRefresh: () => void;
}

const STAGE_STEPS: { id: NonNullable<Task['stage']>; label: string; num: number }[] = [
  { id: 'survey_done', label: '1. Survey', num: 1 },
  { id: 'structure_installed', label: '2. Structure', num: 2 },
  { id: 'panels_wired', label: '3. Panels', num: 3 },
  { id: 'inverter_setup', label: '4. Inverter', num: 4 },
  { id: 'net_meter_applied', label: '5. Net-Meter', num: 5 },
  { id: 'commissioned', label: '6. Live', num: 6 },
];

export function TasksView({ role, onSelectTask, onRefresh }: TasksViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('site_survey');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [dueDate, setDueDate] = useState('');

  React.useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setDueDate(d.toISOString().split('T')[0]);
  }, []);

  const tasks = crmStorage.getTasks();

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.taskNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerName.trim()) {
      alert('Please fill in Task Title and Customer Name');
      return;
    }

    const currentUser = crmStorage.getCurrentUser();
    crmStorage.addTask({
      title: title.trim(),
      description: description.trim(),
      taskType,
      priority,
      status: 'pending',
      assignedTo: 'user-field-1',
      assignedToName: 'Amit Patil',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '+91 98220 00000',
      siteAddress: siteAddress.trim() || 'Site Address TBD',
      city: city.trim() || 'Pune',
      dueDate,
      checklist: [
        { id: `c-1`, label: 'Site structural integrity & roof dimensions verified', done: false },
        { id: `c-2`, label: 'Mounting brackets & torque specs inspected', done: false },
        { id: `c-3`, label: 'Earthing resistance checked (< 2.0 Ohms)', done: false },
        { id: `c-4`, label: 'Discom & Net-meter synchronization completed', done: false },
      ],
      createdBy: currentUser.id,
    });

    setNewTaskModalOpen(false);
    onRefresh();
  };

  const handleQuickStageUpdate = (taskId: string, stageId: NonNullable<Task['stage']>, e: React.MouseEvent) => {
    e.stopPropagation();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newStatus = stageId === 'commissioned' ? 'completed' : 'in_progress';
    crmStorage.updateTaskStatus(taskId, newStatus, task.siteNotes, stageId, task.proofPhotos);
    onRefresh();
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-medium">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Field Operations &amp; Installation
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Rooftop solar milestones &bull; Site surveys &bull; DISCOM net-meter inspection checklist
            </p>
          </div>
        </div>

        <button
          onClick={() => setNewTaskModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Assign Field Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, customer, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:outline-hidden text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 overflow-x-auto">
          {['all', 'pending', 'in_progress', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize shrink-0 transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const doneCount = task.checklist.filter((c) => c.done).length;
          const totalCount = task.checklist.length;
          const pct = Math.round((doneCount / (totalCount || 1)) * 100);
          const currentStage = task.stage || 'survey_done';
          const photos = task.proofPhotos || [];

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all p-4 cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header: ID, Priority, Status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {task.taskNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        task.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : task.priority === 'high'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        task.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium'
                          : task.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-slate-900 leading-snug">{task.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>
                </div>

                {/* Customer Contact & Site Address */}
                <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{task.customerName}</span>
                    <a
                      href={`tel:${task.customerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-medium"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                    <span className="truncate">{task.siteAddress}, {task.city}</span>
                  </div>
                </div>

                {/* Stage Progress Pills */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Installation Stage:
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {STAGE_STEPS.map((s) => {
                      const isCurrent = currentStage === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={(e) => handleQuickStageUpdate(task.id, s.id, e)}
                          className={`px-1.5 py-1 rounded-md text-[10px] text-center truncate transition-colors border ${
                            isCurrent
                              ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Checklist & Progress */}
              <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Checklist ({doneCount}/{totalCount})</span>
                  <span className="font-medium text-slate-700">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Due: {task.dueDate}</span>
                  <span className="text-amber-700 font-medium flex items-center gap-0.5">
                    View &amp; Photos <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No field tasks match search filters.
          </div>
        )}
      </div>

      {/* Assign New Task Modal */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Assign Field Task</h3>
              <button
                onClick={() => setNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Structure Erection & Module Alignment"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Task Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-hidden bg-white"
                  >
                    <option value="site_survey">Site Survey &amp; Roof Check</option>
                    <option value="material_dispatch">Material Dispatch</option>
                    <option value="structure_installation">Structure Grouting &amp; Erection</option>
                    <option value="panel_mounting">Panel Mounting &amp; Clamping</option>
                    <option value="wiring_inverter_setup">Inverter &amp; ACDB Wiring</option>
                    <option value="net_meter_inspection">Net Metering Commissioning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-hidden bg-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98220 12345"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Site Instructions</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task instructions and site requirements..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}