import React from 'react';
import { Clock, Coffee, Check, X, AlertCircle } from 'lucide-react';

const SlotGrid = ({ slotData, onSelectSlot, selectedSlot }) => {
  if (!slotData) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-pulse" />
        <p className="text-slate-500 text-sm">Select a doctor and date to view available appointment slots.</p>
      </div>
    );
  }

  if (!slotData.isWorkingDay) {
    return (
      <div className="text-center py-12 bg-amber-50/50 rounded-xl border border-amber-200 p-6">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-amber-900 mb-1">Doctor Not Available</h4>
        <p className="text-amber-700 text-sm max-w-md mx-auto">
          {slotData.message || 'The doctor has no scheduled working hours for this date.'}
        </p>
      </div>
    );
  }

  // Group slots by sessionName
  const sessionsMap = {};
  for (const slot of slotData.slots || []) {
    const session = slot.sessionName || 'Regular Session';
    if (!sessionsMap[session]) {
      sessionsMap[session] = [];
    }
    sessionsMap[session].push(slot);
  }

  const sessionNames = Object.keys(sessionsMap);

  return (
    <div className="space-y-6">
      {/* Legend & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500"></span>
            <span className="text-slate-700">Available ({slotData.availableSlotsCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></span>
            <span className="text-slate-500">Booked ({slotData.bookedSlotsCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300"></span>
            <span className="text-amber-700">Break Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200"></span>
            <span className="text-slate-400">Past Slot</span>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Slot Duration: <strong className="text-slate-800">{slotData.slotDuration} mins</strong>
        </div>
      </div>

      {/* Break Info Banner if configured */}
      {slotData.breaks && slotData.breaks.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 rounded-lg border border-amber-200/80 text-xs text-amber-800">
          <Coffee className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Scheduled Breaks:{' '}
            {slotData.breaks.map((b) => `${b.breakName} (${b.startTime} - ${b.endTime})`).join(', ')}
          </span>
        </div>
      )}

      {/* Sessions Grid */}
      {sessionNames.map((sessionName) => (
        <div key={sessionName} className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-hospital-600" />
            {sessionName}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {sessionsMap[sessionName].map((slot) => {
              const isSelected = selectedSlot?.startAt === slot.startAt;
              const isAvailable = slot.status === 'available';
              const isBooked = slot.status === 'booked';
              const isPast = slot.status === 'past';

              let buttonStyle = 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed';
              if (isAvailable) {
                buttonStyle = isSelected
                  ? 'bg-hospital-600 text-white border-hospital-600 ring-2 ring-hospital-400 shadow-md font-semibold'
                  : 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 font-medium cursor-pointer shadow-sm hover:scale-[1.02] transition-all';
              } else if (isBooked) {
                buttonStyle = 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed';
              } else if (isPast) {
                buttonStyle = 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed';
              }

              return (
                <button
                  key={slot.startAt}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onSelectSlot && onSelectSlot(slot)}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg border text-xs transition-all ${buttonStyle}`}
                >
                  <span className="font-semibold text-sm">{slot.startTimeString}</span>
                  <span className="text-[10px] opacity-80 mt-0.5">
                    {isAvailable ? 'Available' : isBooked ? 'Reserved' : 'Past'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlotGrid;
