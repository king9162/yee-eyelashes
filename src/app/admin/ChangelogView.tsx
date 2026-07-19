"use client";
import { useState } from "react";

type Tag = "new" | "fix" | "improve";
type ChangeItem = { tag: Tag; text: string };
type Version = {
  version: string;
  date: string;
  dateISO: string;
  summary: string;
  changes: ChangeItem[];
};

const TAG_STYLES: Record<Tag, string> = {
  new:     "bg-[#1C1C1C] text-white",
  fix:     "bg-red-50 text-red-500 border border-red-200",
  improve: "bg-amber-50 text-amber-600 border border-amber-200",
};
const TAG_LABEL: Record<Tag, string> = {
  new:     "NEW",
  fix:     "FIX",
  improve: "IMPROVE",
};

const VERSIONS: Version[] = [
  {
    version: "1.8",
    date: "July 18, 2026",
    dateISO: "2026-07-18",
    summary: "全站錯誤修正批次",
    changes: [
      { tag: "fix", text: "生日通知重複發送修復 — 同電話或 Email 的客人現在只收到一次" },
      { tag: "fix", text: "Admin 新增預約不再重複寄確認信" },
      { tag: "fix", text: "Review/Refill SMS 改為手動開啟（預設關閉），需在 Automations 中手動打開" },
      { tag: "fix", text: "Square 付款後不再產生重複 Google Calendar 事件（自動刪除舊的再建立新的）" },
      { tag: "fix", text: "預覽發送名單現在正確過濾黑名單客人" },
      { tag: "fix", text: "Google Review 連結統一為正確的短網址" },
      { tag: "fix", text: "Automations 頁面標籤更正：「Review Email 同預約當天發送」" },
    ],
  },
  {
    version: "1.7",
    date: "July 15–17, 2026",
    dateISO: "2026-07-17",
    summary: "改期通知 · Admin 登入記錄",
    changes: [
      { tag: "new",     text: "Betty 改期通知 — Square 預約改期時自動發 Email 給 Betty，顯示新舊時間對比" },
      { tag: "new",     text: "Admin 登入記錄 — 每次登入自動記錄時間、裝置、IP，顯示在側欄" },
      { tag: "new",     text: "信件開啟時間追蹤 — Betty 開啟信件的時間顯示在 Admin 側欄" },
      { tag: "new",     text: "退款政策頁面上線（服務頁面底部）" },
      { tag: "improve", text: "Activity Log 整合進 Dashboard，移動版也能看到" },
      { tag: "fix",     text: "側欄客戶計數修正" },
      { tag: "fix",     text: "Admin 導覽列補回 Calendar / Bookings 項目" },
      { tag: "fix",     text: "刪除備忘項目時防止誤刪未儲存新項目" },
    ],
  },
  {
    version: "1.6",
    date: "July 3–8, 2026",
    dateISO: "2026-07-08",
    summary: "假日群發 · 封鎖功能 · 自動化強化",
    changes: [
      { tag: "new",     text: "假日/廣播 SMS 群發 — 可選節日（獨立紀念日、感恩節、聖誕節等）範本，一鍵發送給全部客人" },
      { tag: "new",     text: "客人勾選搜尋列表 — 群發時可全選 / 取消全選，或搜尋特定客人" },
      { tag: "new",     text: "封鎖所有訊息（Block All Messages）— 個別客人設定，封鎖後不收任何自動訊息" },
      { tag: "new",     text: "手動執行（Run Now）— Automations 頁面可立即手動觸發 Review/Refill/Birthday 發送" },
      { tag: "improve", text: "自動化發送名單每 30 秒自動刷新，執行結果即時更新" },
      { tag: "fix",     text: "取消預約的客人不再收到自動 Review/Refill 訊息" },
      { tag: "fix",     text: "改期後有新預約的客人跳過 Refill 提醒" },
      { tag: "fix",     text: "客人名單按電話/Email 去重，與 My Clients 邏輯完全一致" },
    ],
  },
  {
    version: "1.5",
    date: "June 26 – July 2, 2026",
    dateISO: "2026-07-02",
    summary: "自動化 CRM · 生日功能 · Analytics",
    changes: [
      { tag: "new",     text: "每日問候語 + 即時天氣卡片 — Dashboard 顯示今天天氣與 Betty 的專屬問候語" },
      { tag: "new",     text: "生日 Email/SMS 自動化 — 生日當天自動發送 20% off 優惠，支援個別發送或自動排程" },
      { tag: "new",     text: "Review 已給設定 — 個別客人可標記「已給 Review」，自動關閉自動 Review 發送" },
      { tag: "new",     text: "不接收自動訊息（No Auto Review/Refill）— 個別客人可設定" },
      { tag: "new",     text: "SMS 退訂管理（Unsubscribe）— 記錄退訂客人，自動略過" },
      { tag: "new",     text: "發送歷史記錄（Send History）— 每筆可單獨刪除，顯示所有類型發送記錄" },
      { tag: "new",     text: "CSV 匯出（Export）— 按電話/Email 去重後匯出，包含所有訪問日期" },
      { tag: "new",     text: "Automations 預覽名單 — 執行前可預覽今天會發送給哪些客人" },
      { tag: "new",     text: "SEO 落地頁 — 4 個服務專頁（睫毛嫁接、紋眉等）提升 Google 搜尋排名" },
      { tag: "improve", text: "Analytics 報告修正：計算全月數據而非只到今天" },
      { tag: "improve", text: "Admin 可刪除個別客人並支援還原（Deleted tab）" },
    ],
  },
  {
    version: "1.4",
    date: "April 30 – May 1, 2026",
    dateISO: "2026-05-01",
    summary: "Square 完整整合 · 改期 · 取消",
    changes: [
      { tag: "new",     text: "Admin 改期功能 — 直接在後台改期，自動同步 Google Calendar 與 Square" },
      { tag: "new",     text: "取消同步 — 取消預約自動同步 Supabase、Google Calendar、Square" },
      { tag: "new",     text: "確認信加入自助連結 — 客人收到確認信後可自行取消或改期" },
      { tag: "new",     text: "網站預約自動同步到 Square Appointments 行事曆" },
      { tag: "fix",     text: "Square Service ID 更新配合新方案目錄" },
    ],
  },
  {
    version: "1.3",
    date: "April 21–27, 2026",
    dateISO: "2026-04-27",
    summary: "真實照片 · 服務更新 · 優惠券",
    changes: [
      { tag: "new",     text: "Hero 輪播上線 — 真實工作室照片，支援左右切換" },
      { tag: "new",     text: "真實 Google 評論 — 取代佔位評論，顯示真實客人好評" },
      { tag: "new",     text: "優惠券（Coupon）頁面 — 新增導覽列入口" },
      { tag: "improve", text: "服務重新命名：Mink/Silk + Premium/Cashmere，加入補充（Refill）下拉選項" },
      { tag: "improve", text: "營業時間更新：9:30 AM – 7:00 PM" },
      { tag: "improve", text: "域名遷移：yeelashesny.com → yeeeyelashes.com" },
    ],
  },
  {
    version: "1.2",
    date: "April 16, 2026",
    dateISO: "2026-04-16",
    summary: "Google Analytics · 照片更新",
    changes: [
      { tag: "new",     text: "Google Analytics 整合 — 追蹤網站流量與訪客行為" },
      { tag: "improve", text: "移除所有佔位圖片，準備上傳真實工作室照片" },
    ],
  },
  {
    version: "1.1",
    date: "April 15, 2026",
    dateISO: "2026-04-15",
    summary: "預約系統 · Email 通知 · Admin 面板",
    changes: [
      { tag: "new", text: "完整線上預約系統 — 選擇服務、日期、時間，即時確認" },
      { tag: "new", text: "自動確認 Email — 預約後立即發送確認信給客人與 Betty" },
      { tag: "new", text: "Google Calendar 整合 — 每筆預約自動建立行事曆事件" },
      { tag: "new", text: "Admin 管理面板 — 客戶名單、預約日曆、Analytics 報告" },
    ],
  },
  {
    version: "1.0",
    date: "April 9, 2026",
    dateISO: "2026-04-09",
    summary: "網站正式上線 🎉",
    changes: [
      { tag: "new", text: "Yee Eyelashes 官網正式上線" },
      { tag: "new", text: "服務介紹、聯絡資訊、地址地圖" },
      { tag: "new", text: "響應式設計 — 手機、平板、電腦完整支援" },
    ],
  },
];

export default function ChangelogView() {
  const [expanded, setExpanded] = useState<string | null>(VERSIONS[0].version);
  const latest = VERSIONS[0];

  return (
    <div className="flex-1 overflow-auto bg-neutral-50">
      {/* App header — Apple Store style */}
      <div className="bg-white border-b border-neutral-100 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[14px] bg-[#1C1C1C] flex items-center justify-center shrink-0 shadow-md">
            <span className="text-[#C9A84C] text-[22px] font-bold tracking-tight">Y</span>
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-[#1C1C1C] leading-tight">Yee Eyelashes Admin</h1>
            <p className="text-[13px] text-neutral-400 mt-0.5">版本更新說明</p>
          </div>
        </div>

        {/* Latest version pill */}
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2">
            <span className="text-[11px] font-bold text-[#1C1C1C] tracking-tight">v{latest.version}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span className="text-[11px] text-neutral-400">{latest.date}</span>
          </div>
          <span className="text-[12px] text-neutral-500">{latest.summary}</span>
        </div>
      </div>

      {/* Version list */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        {VERSIONS.map((v, idx) => {
          const isOpen   = expanded === v.version;
          const isLatest = idx === 0;

          return (
            <div
              key={v.version}
              className={`bg-white rounded-2xl overflow-hidden border transition-all ${isLatest ? "border-[#C9A84C]/40 shadow-sm" : "border-neutral-200"}`}
            >
              {/* Version header (always visible) */}
              <button
                onClick={() => setExpanded(isOpen ? null : v.version)}
                className="w-full px-5 py-4 flex items-center gap-3 text-left"
              >
                {/* Version badge */}
                <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${isLatest ? "bg-[#1C1C1C] text-white" : "bg-neutral-100 text-neutral-500"}`}>
                  v{v.version}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[14px] font-semibold text-[#1C1C1C]">{v.summary}</span>
                    {isLatest && (
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#C9A84C] font-bold">最新</span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400">{v.date}</span>
                </div>

                {/* Change count + chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-neutral-300">{v.changes.length} 項</span>
                  <span className={`text-neutral-400 text-[16px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    ⌄
                  </span>
                </div>
              </button>

              {/* Change list */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-2.5">
                  <div className="h-px bg-neutral-100 mb-3" />
                  {v.changes.map((c, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`shrink-0 mt-0.5 text-[9px] font-bold tracking-[0.12em] px-1.5 py-0.5 rounded ${TAG_STYLES[c.tag]}`}>
                        {TAG_LABEL[c.tag]}
                      </span>
                      <p className="text-[13px] text-neutral-700 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-[11px] text-neutral-300">從 2026 年 4 月開始記錄</p>
        </div>
      </div>
    </div>
  );
}
