import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  AlertCircle,
  Wrench,
  CheckCircle2,
  CalendarDays,
  ListOrdered,
  Plus,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { getCalendarEvents, getWorkOrders } from '../services/maintenanceService';

export const MaintenanceCalendarPage = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'technician'
  const [events, setEvents] = useState([]);
  const [technicianTasks, setTechnicianTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Event Modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [calData, woData] = await Promise.all([
        getCalendarEvents(),
        getWorkOrders({ limit: 50 }),
      ]);
      setEvents(calData.events || []);
      setTechnicianTasks(woData.workOrders || []);
    } catch (err) {
      console.error('Failed to load maintenance calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calendar Date Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Group events by day of month
  const getEventsForDay = (day) => {
    return events.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  };

  // Filter tasks for technician queue
  const myQueue = technicianTasks.filter((t) => {
    if (user?.role === 'Technician') {
      return t.assignedTechnician?._id === user._id || !t.assignedTechnician;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Building maintenance dispatch schedule..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Maintenance Calendar & Technician Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Planned preventive maintenance, critical interventions, and work dispatch
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === 'month'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 inline mr-1" />
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('technician')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === 'technician'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 inline mr-1" />
              Technician Queue ({myQueue.length})
            </button>
          </div>

          <button
            onClick={() => navigate('/planning')}
            className="px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors"
          >
            Open Kanban Board &rarr;
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                {monthNames[month]} {year}
              </h3>
              <button
                onClick={today}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
              >
                Today
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={prevMonth}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200/60"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200/60"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider py-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[560px]">
            {/* Leading empty days */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-slate-50/30 p-2 min-h-[90px]" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${day}`}
                  className={`p-2 min-h-[90px] flex flex-col justify-between transition-colors hover:bg-orange-50/20 ${
                    isToday ? 'bg-orange-50/40 ring-1 ring-orange-500 inset-0' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center'
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 my-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`px-1.5 py-1 rounded text-[10px] font-semibold truncate cursor-pointer shadow-2xs border ${
                          event.priority === 'Emergency'
                            ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            : event.priority === 'Urgent'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                        }`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-bold block text-center">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Technician Queue View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Assigned Maintenance Queue ({myQueue.length} Work Orders)
            </h3>
            <span className="text-xs text-slate-500">Sorted by Priority & Scheduled Execution</span>
          </div>

          {myQueue.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-12">
              No tasks currently pending in your maintenance queue.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {myQueue.map((task) => (
                <div
                  key={task._id}
                  onClick={() => navigate(`/planning`)}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">
                        {task.workOrderNumber}
                      </span>
                      <StatusBadge status={task.status} />
                      <span className="text-xs font-semibold text-slate-400">
                        {task.assetId?.name} ({task.assetId?.assetCode})
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                    <p className="text-xs text-slate-500">{task.description}</p>
                  </div>

                  <div className="text-right sm:shrink-0 text-xs space-y-1">
                    <div className="font-semibold text-slate-700">
                      {task.scheduledDate
                        ? new Date(task.scheduledDate).toLocaleDateString()
                        : 'Unscheduled'}
                    </div>
                    <div className="text-slate-400">
                      Est. Downtime: {task.expectedDowntimeHours} hrs
                    </div>
                    <span className="inline-block text-[11px] font-bold text-orange-600 hover:text-orange-800">
                      View in Planning Board &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          subtitle={`Scheduled Date: ${new Date(selectedEvent.date).toLocaleDateString()}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 font-semibold">Target Asset</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedEvent.assetName} ({selectedEvent.assetCode})
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Assigned Technician</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedEvent.technician}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Priority</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedEvent.priority}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Expected Downtime</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedEvent.expectedDowntimeHours} Hours
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => navigate('/planning')}
                className="px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
              >
                Open in Kanban Board
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MaintenanceCalendarPage;
