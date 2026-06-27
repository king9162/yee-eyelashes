"use client";

import { useState, useEffect } from "react";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const;
type Day = typeof DAYS[number];
const DAY_FULL: Record<Day, string> = {
  Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
  Thu: "Thursday", Fri: "Friday", Sat: "Saturday",
};
type Slot = { start: string; end: string } | null;
type StaffMember = { id: string; name: string; schedule: Record<Day, Slot> };

const DEFAULT_SLOT = { start: "09:30", end: "19:00" } satisfies NonNullable<Slot>;

function defaultStaff(): StaffMember[] {
  return [
    {
      id: "1", name: "Mei Yang",
      schedule: { Sun: null, Mon: null, Tue: null, Wed: null, Thu: null, Fri: null, Sat: null },
    },
    {
      id: "2", name: "Staff 1",
      schedule: {
        Sun: null,
        Mon: { ...DEFAULT_SLOT }, Tue: { ...DEFAULT_SLOT }, Wed: { ...DEFAULT_SLOT },
        Thu: { ...DEFAULT_SLOT }, Fri: { ...DEFAULT_SLOT }, Sat: { ...DEFAULT_SLOT },
      },
    },
    {
      id: "3", name: "Staff 2",
      schedule: {
        Sun: null, Mon: { ...DEFAULT_SLOT }, Tue: null,
        Wed: { ...DEFAULT_SLOT }, Thu: null, Fri: null, Sat: null,
      },
    },
  ];
}

function fmt(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${period}` : `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export default function AvailabilityView() {
  const [staff,    setStaff]    = useState<StaffMember[]>([]);
  const [editing,  setEditing]  = useState<{ staffId: string; day: Day } | null>(null);
  const [editSlot, setEditSlot] = useState<Slot>(null);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("yee_availability");
      setStaff(raw ? JSON.parse(raw) : defaultStaff());
    } catch {
      setStaff(defaultStaff());
    }
  }, []);

  function saveAll() {
    localStorage.setItem("yee_availability", JSON.stringify(staff));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function openEdit(staffId: string, day: Day) {
    if (day === "Sun") return;
    const member = staff.find(s => s.id === staffId)!;
    setEditSlot(member.schedule[day] ? { ...member.schedule[day]! } : { ...DEFAULT_SLOT });
    setEditing({ staffId, day });
  }

  function applyEdit(available: boolean) {
    if (!editing) return;
    setStaff(prev => prev.map(s =>
      s.id === editing.staffId
        ? { ...s, schedule: { ...s.schedule, [editing.day]: available ? editSlot : null } }
        : s
    ));
    setEditing(null);
  }

  function addStaff() {
    const name = prompt("Staff name:");
    if (!name?.trim()) return;
    setStaff(prev => [...prev, {
      id: String(Date.now()), name: name.trim(),
      schedule: { Sun: null, Mon: null, Tue: null, Wed: null, Thu: null, Fri: null, Sat: null },
    }]);
  }

  function removeStaff(id: string) {
    if (!confirm("Remove this staff member?")) return;
    setStaff(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5">
        <h2 className="text-[22px] font-light text-[#1C1C1C] tracking-tight">Availability</h2>
        <div className="flex items-center gap-3">
          {saved && <span className="text-[12px] text-green-600 font-medium">Saved ✓</span>}
          <button onClick={addStaff}
            className="text-[11px] font-semibold px-4 py-2 border border-neutral-300 text-neutral-600 hover:border-neutral-500 tracking-widest transition-colors">
            + STAFF
          </button>
          <button onClick={saveAll}
            className="text-[11px] font-bold px-4 py-2 bg-[#1C1C1C] text-white tracking-widest hover:bg-black transition-colors">
            SAVE
          </button>
        </div>
      </div>

      <div className="border-t border-neutral-200 flex-1 overflow-auto">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left text-[13px] font-normal text-neutral-500 px-8 py-4 w-[200px]">
                  Team member
                </th>
                {DAYS.map(d => (
                  <th key={d} className="text-[13px] font-normal text-neutral-800 py-4 px-4 border-l border-neutral-200 text-left min-w-[120px]">
                    {DAY_FULL[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.id} className="border-b border-neutral-100">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeStaff(member.id)}
                        className="text-neutral-300 hover:text-neutral-500 text-[13px] leading-none transition-colors">
                        ✕
                      </button>
                      <span className="text-[15px] font-bold text-[#1C1C1C]">{member.name}</span>
                      <span className="text-[12px] text-neutral-400 leading-none">⌄</span>
                    </div>
                  </td>
                  {DAYS.map(day => {
                    const slot = member.schedule[day];
                    const isSun = day === "Sun";
                    return (
                      <td key={day} className="py-4 px-3 border-l border-neutral-200 align-middle">
                        {isSun ? (
                          <div className="h-[58px]" />
                        ) : slot ? (
                          <button
                            onClick={() => openEdit(member.id, day)}
                            className="w-full rounded-xl bg-green-50 px-3 py-3.5 text-left hover:bg-green-100 transition-colors">
                            <p className="text-[13px] font-semibold text-[#2d6a4f]">Available</p>
                            <p className="text-[12px] text-[#52b788] mt-0.5 font-normal">
                              {fmt(slot.start)} – {fmt(slot.end)}
                            </p>
                          </button>
                        ) : (
                          <button
                            onClick={() => openEdit(member.id, day)}
                            className="w-full h-[58px] rounded-xl hover:bg-neutral-50 transition-colors group flex items-center justify-center border border-transparent hover:border-neutral-200">
                            <span className="text-[20px] text-neutral-200 group-hover:text-neutral-400 transition-colors leading-none">+</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          onClick={() => setEditing(null)}>
          <div className="bg-white w-full max-w-xs p-6 shadow-2xl rounded-2xl"
            onClick={e => e.stopPropagation()}>
            <p className="text-[15px] font-bold text-[#1C1C1C] mb-5">
              {staff.find(s => s.id === editing.staffId)?.name}
              <span className="text-neutral-400 font-normal"> · {DAY_FULL[editing.day]}</span>
            </p>
            {editSlot && (
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 tracking-wider mb-1.5">
                    START TIME
                  </label>
                  <input type="time" value={editSlot.start}
                    onChange={e => setEditSlot(p => p ? { ...p, start: e.target.value } : p)}
                    className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-black transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 tracking-wider mb-1.5">
                    END TIME
                  </label>
                  <input type="time" value={editSlot.end}
                    onChange={e => setEditSlot(p => p ? { ...p, end: e.target.value } : p)}
                    className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-black transition-all" />
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => applyEdit(true)}
                className="flex-1 py-3 text-[13px] font-bold bg-[#1C1C1C] text-white rounded-xl hover:bg-black transition-colors">
                Set Available
              </button>
              <button onClick={() => applyEdit(false)}
                className="flex-1 py-3 text-[13px] font-medium bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
