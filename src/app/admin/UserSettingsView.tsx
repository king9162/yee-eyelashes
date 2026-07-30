"use client";
import { useState, useEffect } from "react";

const FIXED_NAMES: Record<1 | 2, string> = { 1: "Betty", 2: "Chloe" };

function UserCard({ slot, hasPin, adminKey, onSaved }: {
  slot: 1 | 2; hasPin: boolean; adminKey: string; onSaved: () => void;
}) {
  const name = FIXED_NAMES[slot];
  const [editing,    setEditing]    = useState(false);
  const [oldPin,     setOldPin]     = useState("");
  const [newPin,     setNewPin]     = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);

  function resetForm() {
    setEditing(false); setOldPin(""); setNewPin(""); setConfirmPin(""); setError("");
  }

  async function save() {
    setError("");
    if (!newPin) { setError("請輸入新密碼"); return; }
    if (newPin.length < 4) { setError("密碼至少 4 位"); return; }
    if (newPin !== confirmPin) { setError("兩次新密碼不一致"); return; }
    if (hasPin && !oldPin) { setError("請輸入舊密碼"); return; }

    setSaving(true);
    const body: Record<string, unknown> = { slot, name, pin: newPin };
    if (hasPin) body.current_pin = oldPin;
    const res = await fetch("/api/admin/user-settings", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "儲存失敗，請重試");
      return;
    }
    setSuccess(true);
    onSaved();
    resetForm();
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[20px] font-bold text-[#1C1C1C]">{name}</p>
        <div className="flex items-center gap-2">
          {success && <span className="text-[12px] text-green-600 font-semibold">已儲存 ✓</span>}
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="px-3 py-1.5 border border-neutral-200 text-[12px] font-semibold text-neutral-500 rounded-lg hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all">
              {hasPin ? "修改密碼" : "設定密碼"}
            </button>
          )}
        </div>
      </div>
      <p className="text-[12px] text-neutral-400 mb-4">{hasPin ? "密碼已設定" : "尚未設定密碼"}</p>

      {editing && (
        <div className="space-y-3 border-t border-neutral-100 pt-4">
          {hasPin && (
            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">舊密碼</label>
              <input value={oldPin} onChange={e => setOldPin(e.target.value)} placeholder="輸入目前密碼"
                type="password" maxLength={20} autoFocus
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">
              {hasPin ? "新密碼" : "設定密碼"}
            </label>
            <input value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="4位以上數字或英文"
              type="password" maxLength={20} autoFocus={!hasPin}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">確認新密碼</label>
            <input value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="再輸入一次"
              type="password" maxLength={20}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
          </div>
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="px-3 py-1.5 text-[12px] text-neutral-400 hover:text-neutral-600">取消</button>
            <button onClick={save} disabled={saving}
              className="px-4 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
              {saving ? "儲存中…" : "儲存"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserSettingsView({ adminKey }: { adminKey: string }) {
  const [state, setState] = useState<{ u1HasPin: boolean; u2HasPin: boolean } | null>(null);

  async function load() {
    const res = await fetch("/api/admin/user-settings", { headers: { Authorization: `Bearer ${adminKey}` } });
    const d = await res.json();
    setState({ u1HasPin: !!d.user1?.hasPin, u2HasPin: !!d.user2?.hasPin });
  }

  useEffect(() => { load(); }, [adminKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div>
        <h2 className="text-[17px] font-bold text-[#1C1C1C]">User Settings</h2>
        <p className="text-[12px] text-neutral-400 mt-1">
          每位使用者設定自己的密碼，在 Revenue 存檔時輸入密碼，系統自動記錄是誰操作的。
        </p>
      </div>

      {!state ? (
        <p className="text-[13px] text-neutral-400">載入中…</p>
      ) : (
        <div className="space-y-3">
          <UserCard slot={1} hasPin={state.u1HasPin} adminKey={adminKey} onSaved={load} />
          <UserCard slot={2} hasPin={state.u2HasPin} adminKey={adminKey} onSaved={load} />
        </div>
      )}
    </div>
  );
}
