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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-600" />
            <span>Field Operations &amp; Site Tasks</span>
          </h1>
          <p className="text-xs text-slate-500">
            Mobile-optimized for field technicians &bull; Site surveys, structure erection, wiring &amp; net-meter testing
          </p>
        </div>

        <button
          onClick={() => setNewTaskModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#10233F] hover:bg-[#1b355d] text-white transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-[#F4B740]" />
          <span>Assign New Field Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by title, customer, site city, or #..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'pending', 'in_progress', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-[#10233F] text-white shadow-xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          const doneCount = task.checklist.filter((c) => c.done).length;
          const totalCount = task.checklist.length;
          const pct = Math.round((doneCount / (totalCount || 1)) * 100);

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-4 space-y-3 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {task.taskNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      task.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      task.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-xs text-slate-900 leading-snug">{task.title}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>

                {/* Customer & Location */}
                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-[11px] text-slate-700">
                  <div className="flex items-center justify-between font-semibold">
                    <span>{task.customerName}</span>
                    <a
                      href={`tel:${task.customerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-amber-700 hover:text-amber-900 flex items-center gap-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{task.siteAddress}, {task.city}</span>
                  </div>
                </div>
              </div>

              {/* Checklist & Progress */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Checklist ({doneCount}/{totalCount})</span>
                  <span className="font-bold text-slate-800">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Due: {task.dueDate}</span>
                  <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                    Open Task <ChevronRight className="w-3 h-3" />
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
