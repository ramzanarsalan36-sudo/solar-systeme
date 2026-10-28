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
} from 'lucide-react';

interface TasksViewProps {
  role: UserRole;
  onSelectTask: (task: Task) => void;
  onRefresh: () => void;
}

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
    if (!title || !customerName) {
      alert('Please fill in Task Title and Customer Name');
      return;
    }

    const currentUser = crmStorage.getCurrentUser();
    crmStorage.addTask({
      title,
      description,
      taskType,
      priority,
      status: 'pending',
      assignedTo: 'user-field-1',
      assignedToName: 'Amit Patil',
      customerName,
      customerPhone: customerPhone || '+91 98220 00000',
      siteAddress: siteAddress || 'Site Address TBD',
      city,
      dueDate,
      checklist: [
        { id: `c-1`, label: 'Site physical verification & measurements', done: false },
        { id: `c-2`, label: 'Mounting & structural integrity check', done: false },
        { id: `c-3`, label: 'Discom & Net-meter liaison document verification', done: false },
      ],
      createdBy: currentUser.id,
    });

    alert('New task assigned successfully!');
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

  const handleQuickAddPhoto = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const samplePhotos = [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800&auto=format&fit=crop&q=80',
    ];
    const existing = task.proofPhotos || [];
    const nextPhoto = samplePhotos[existing.length % samplePhotos.length];
    crmStorage.updateTaskStatus(taskId, task.status, task.siteNotes, task.stage, [...existing, nextPhoto]);
    onRefresh();
  };

  const STAGE_STEPS: { id: NonNullable<Task['stage']>; num: string; label: string }[] = [
    { id: 'survey_done', num: '1', label: 'Site Survey Done' },
    { id: 'structure_installed', num: '2', label: 'Structure Mounted' },
    { id: 'panels_wired', num: '3', label: 'Panels Fixed' },
    { id: 'inverter_setup', num: '4', label: 'Inverter & Wiring' },
    { id: 'net_meter_applied', num: '5', label: 'Net-Meter Applied' },
    { id: 'commissioned', num: '6', label: 'Commissioned' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner with Real Context Field Photo */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0B1120] text-white p-6 sm:p-7 border border-slate-800 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800&auto=format&fit=crop&q=80")',
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Field Operations &amp; Site Work
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                Plane.so Style
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Optimized for mobile &amp; tablet rooftop crews &bull; 1-tap milestone updates &bull; Real-time photo proof before commissioning
            </p>
          </div>

          <button
            onClick={() => setNewTaskModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Assign New Field Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by title, customer, site city, or #..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'pending', 'in_progress', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize shrink-0 transition-all ${
                statusFilter === st
                  ? 'bg-[#0B1120] text-amber-400 shadow-xs font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
              className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:border-amber-400/50 hover:shadow-lg transition-all duration-200 p-5 space-y-4 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: ID, Priority, Status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {task.taskNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        task.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        task.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold'
                          : task.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{task.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                </div>

                {/* Customer Contact & Site Address */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-900 font-bold">{task.customerName}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${task.customerPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{task.siteAddress}, {task.city}</span>
                  </div>
                </div>

                {/* ONE-TAP PROGRESS BUTTONS (Plane.so Style Requirement) */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    One-Tap Rooftop Progress Stage:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {STAGE_STEPS.map((s) => {
                      const isCurrent = currentStage === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={(e) => handleQuickStageUpdate(task.id, s.id, e)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold text-left transition-all flex items-center gap-1.5 border ${
                            isCurrent
                              ? 'bg-[#0B1120] text-amber-400 border-[#0B1120] shadow-xs font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            isCurrent ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {s.num}
                          </span>
                          <span className="truncate">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Installation Proof Photo Placeholder */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700">Installation Proof:</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {photos.length} Photo{photos.length === 1 ? '' : 's'} Uploaded
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleQuickAddPhoto(task.id, e)}
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    + Add Demo Proof
                  </button>
                </div>
              </div>

              {/* Checklist & Progress */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Site Checklist ({doneCount}/{totalCount})</span>
                  <span className="font-bold text-slate-800">{pct}% Complete</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Target Due: {task.dueDate}</span>
                  <span className="text-amber-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    View Details &amp; Upload Proof <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            No field tasks found. Click "Assign New Field Task" to create one.
          </div>
        )}
      </div>

      {/* Assign New Task Modal */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#10233F] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Assign New Field Task</h3>
              <button onClick={() => setNewTaskModalOpen(false)} className="text-slate-300 hover:text-white">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Structure Erection & Module Alignment"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Task Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  >
                    <option value="site_survey">Site Survey &amp; Measurements</option>
                    <option value="material_dispatch">Material Dispatch / Delivery</option>
                    <option value="structure_installation">Structure Grouting &amp; Erection</option>
                    <option value="panel_mounting">Panel Clamping &amp; Alignment</option>
                    <option value="wiring_inverter_setup">Inverter &amp; ACDB/DCDB Wiring</option>
                    <option value="net_meter_inspection">Net Metering Testing &amp; Commissioning</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
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
                  <label className="block font-medium text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98220 12345"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Site Address &amp; Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task instructions and site requirements..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 bg-white border border-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-[#10233F] bg-[#F4B740] hover:bg-[#D99B26] rounded-lg"
                >
                  Create &amp; Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
