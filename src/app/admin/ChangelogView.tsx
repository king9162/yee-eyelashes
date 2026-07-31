"use client";
import { useState } from "react";

type Tag = "new" | "fix" | "improve";
type Change = { tag: Tag; text: string };
type Day = { date: string; label: string; changes: Change[] };

const TAG_STYLES: Record<Tag, string> = {
  new:     "bg-[#1C1C1C] text-white",
  fix:     "bg-red-50 text-red-500 border border-red-200",
  improve: "bg-amber-50 text-amber-600 border border-amber-200",
};
const TAG_LABEL: Record<Tag, string> = { new: "NEW", fix: "FIX", improve: "+" };

const DAYS: Day[] = [
  {
    date: "Jul 30, 2026 (Part 5)", label: "2026-07-30e",
    changes: [
      { tag: "new", text: "Members admin 新增 Edit 功能：點擊會員詳細頁右上角 Edit 按鈕，可修改姓名、Email、電話、生日、會員編號。電話號碼更新後登入用的 auth email 自動同步更新。Member Number 輸入 '1' 會自動格式化為 YEE-00001。" },
    ],
  },
  {
    date: "Jul 30, 2026 (Part 4)", label: "2026-07-30d",
    changes: [
      { tag: "improve", text: "移除「Sign in with email instead →」連結：登入頁面不再顯示 email 登入入口，以手機號+密碼為唯一主要登入方式" },
      { tag: "new",     text: "建立帳號加入手機驗證碼：步驟一輸入手機號→收到 6 位數 SMS 驗證碼，步驟二填入驗證碼＋姓名/生日/Email/密碼，伺服器驗證碼後才建立帳號，有效期 10 分鐘，支援重新發送" },
      { tag: "improve", text: "忘記密碼支援電話或 Email：可輸入手機號或 Email 任一項，系統自動判斷並寄送重設連結到對應的 Email" },
    ],
  },
  {
    date: "Jul 30, 2026 (Part 3)", label: "2026-07-30c",
    changes: [
      { tag: "improve", text: "Bookings 視圖改為下拉式群組：第一層為月份（如 July 2026），第二層為每天日期（如 Jul 30 · Wed），點日期才展開當天所有預約，適用 UPCOMING 和 ALL 兩個分頁" },
      { tag: "fix",     text: "修復 Bookings 時間排序錯誤：同一天內的預約改依時間由早到晚排序（原本字串比較導致 1:30 PM 排在 9:45 AM 前面）" },
    ],
  },
  {
    date: "Jul 30, 2026 (Part 2)", label: "2026-07-30b",
    changes: [
      { tag: "new",     text: "會員登入改為電話+密碼：移除 OTP 簡訊驗證和 Email/Google 登入標籤，改為電話號碼＋密碼，不需收簡訊驗證碼" },
      { tag: "new",     text: "會員註冊收集姓名、生日、Email（選填）：建立帳號後自動同步更新 clients 資料表對應的客人資料（以電話匹配）" },
      { tag: "improve", text: "會員登入電話兼容性：無論客人輸入 +1(516)902-2205 或純 5169022205，均正規化為相同帳號（取末 10 碼）；Admin 系統電話維持 +1XXXXXXXXXX 格式" },
      { tag: "new",     text: "Members admin 新增刪除會員功能：在客人詳細資料右上角新增 Delete 按鈕，點擊後確認並刪除帳號（軟刪除 profile + 刪除 auth user）" },
      { tag: "new",     text: "Members admin 若登入頁填寫的姓名/Email，自動更新 clients 資料庫中對應電話的客人資料" },
      { tag: "fix",     text: "修復 Square 取消預約仍出現在 My Clients 的 bug：Square Sync 後現在會同步刪除 clients 表中取消預約對應的紀錄，不再計入當日到訪人數" },
    ],
  },
  {
    date: "Jul 30, 2026", label: "2026-07-30",
    changes: [
      { tag: "improve", text: "Points 機制完全移除：改為每 5 次到訪自動發 20% off 優惠券，不再計點、不顯示點數餘額" },
      { tag: "improve", text: "VIP 等級改為訪問次數：Silver=5次、Gold=10次、Diamond=20次（不再以消費金額計算）" },
      { tag: "improve", text: "Member Dashboard 更新：主卡片改顯示 5 格進度條（X/5 到下一張 20% off），移除點數、消費金額欄位與點數明細區塊" },
      { tag: "improve", text: "TierBenefitsCard 更新：移除所有 pts 描述，改為 '每 5 次到訪 → 20% off 優惠券'" },
      { tag: "improve", text: "Referral 卡片文案更新：移除「+200 pts / +100 pts」，改為友善推薦說明" },
      { tag: "improve", text: "Admin 側欄重整：Member Club 獨立成一個 section（Member Checkout / Members / Coupon Templates / Referrals），Customers 僅保留 My Clients / Elly's Clients / 3x Package，Points Ledger 移除" },
      { tag: "improve", text: "Admin Dashboard 會員統計：移除「Pts in Circulation」，改顯示「Referrals Done」（已完成推薦數）" },
      { tag: "new",     text: "Email 登入新增 Forgot Password / Reset Password 流程：寄發重設連結 → 點連結開啟新密碼設定頁，設定後自動導向 Dashboard" },
      { tag: "improve", text: "vercel.json 清理：移除 expire-points 和 member-points-expiry-warning 兩個已廢棄的 cron" },
    ],
  },
  {
    date: "Jul 29, 2026 (Part 5)", label: "2026-07-29e",
    changes: [
      { tag: "fix",     text: "listUsers 分頁修正：member-blast 和 Square Sync 改為迴圈抓取（perPage: 1000），超過 500 會員後仍正常運作" },
      { tag: "new",     text: "Unsubscribe 連結：每封 member-blast 郵件底部自動加上個人化退訂連結（HMAC 驗簽）；/member/unsubscribe 頁面處理確認，直接更新 notif_marketing=false" },
      { tag: "new",     text: "Referral Code URL 帶入：訪問 /member?ref=CODE 或 /member/login?ref=CODE，Onboarding 自動填入推薦碼（OAuth 期間透過 sessionStorage 保留）" },
      { tag: "new",     text: "點數到期前警告 Email：每月 25 日 10:00 UTC 自動偵測 11 個月前舊點數，寄送即將到期提醒給受影響會員，告知幾號到期、剩餘幾點、可以如何保留" },
      { tag: "new",     text: "主站 Nav 加入 Member Club 連結：桌機版和手機版 Nav 均顯示「✦ Member Club」，金色字體區隔，連結至 /member（自動導向登入或 Dashboard）" },
    ],
  },
  {
    date: "Jul 29, 2026 (Part 4)", label: "2026-07-29d",
    changes: [
      { tag: "new",     text: "Member Email Blast UI：在 Automations 頁面新增會員 Email 群發面板，支援 Preview Recipients（只看不寄）、HTML body 加 {{name}} 個人化、確認後寄給所有 notif_marketing=true 的會員" },
    ],
  },
  {
    date: "Jul 29, 2026 (Part 3)", label: "2026-07-29c",
    changes: [
      { tag: "new",     text: "Admin Points Ledger：查看所有會員的點數流水帳，支援按類型篩選、姓名搜尋、分頁" },
      { tag: "new",     text: "Auto-Expire Coupons Cron：每天 3am UTC 自動把過期優惠券標為 expired（vercel.json 已設定）" },
      { tag: "new",     text: "Square Sync 自動綁定會員：每次 Sync Square 時，自動把有電話/Email 的預約比對並綁定會員帳號" },
      { tag: "new",     text: "Member Referral 狀態顯示：Dashboard 推薦卡片顯示已推薦幾人、Pending/Completed 分列" },
      { tag: "fix",     text: "TXN_LABELS 補上 referral_bonus：之前點數明細顯示 raw type string，現在正確顯示「Referral Bonus」" },
      { tag: "new",     text: "Member Referrals API：/api/member/referrals 回傳自己推薦的所有紀錄與狀態" },
    ],
  },
  {
    date: "Jul 29, 2026 (Part 2)", label: "2026-07-29b",
    changes: [
      { tag: "new",     text: "會員歡迎 Email：Onboarding 完成後自動寄出，顯示個人推薦碼、點數規則、VIP 等級說明" },
      { tag: "new",     text: "Admin Referrals 頁面：查看所有推薦紀錄、狀態（Pending / Completed）、推薦人、被推薦人，支援搜尋與 Tab 篩選" },
      { tag: "new",     text: "Dashboard Member Club 統計：顯示會員總人數、流通點數、有效優惠券數、待完成推薦數" },
      { tag: "new",     text: "預約前一天提醒 Email（會員）：每天 6pm UTC 自動寄明日有會員預約的提醒（cron 已設定）" },
      { tag: "new",     text: "Admin Member Stats API：/api/admin/member-stats 彙整會員數據供 Dashboard 使用" },
    ],
  },
  {
    date: "Jul 29, 2026", label: "2026-07-29",
    changes: [
      { tag: "new",     text: "Member Club 上線：Google 登入、點數、VIP 等級、優惠券、預約記錄一站查看（/member）" },
      { tag: "new",     text: "點數自動累積：Revenue 記錄金額後自動換算點數（$1 = 1 pt），直接寫入會員帳戶" },
      { tag: "new",     text: "VIP 等級自動升級：Silver $500、Gold $1,000、Diamond $2,000（以消費總額計）" },
      { tag: "new",     text: "生日優惠自動發放：生日當月進入 Dashboard 自動領取 30% off 優惠券，當月有效" },
      { tag: "new",     text: "Admin Member Checkout 面板：搜尋客人名字或電話，一鍵查看點數/優惠券，直接核銷或兌換點數折扣" },
      { tag: "new",     text: "Lash Passport：Admin 可記錄每次服務的睫毛規格（Material / Style / Curl / Length），客人在 /member 查看歷史" },
      { tag: "new",     text: "Admin 會員詳情：Lash Record 紀錄、Re-link Bookings 按鈕、優惠券核銷" },
      { tag: "new",     text: "Coupon Templates 管理頁面：新增自訂範本、啟用/停用、Seed 預設 4 種" },
      { tag: "new",     text: "Referral 推薦系統：每位會員有專屬推薦碼，Dashboard 顯示，Onboarding 可輸入推薦碼" },
      { tag: "new",     text: "推薦完成自動發點數：被推薦人首次消費時，推薦人 +200 pts、被推薦人 +100 pts，並各自收到 Email 通知" },
      { tag: "new",     text: "購買點數 Email 通知：每次消費自動發 Email 告知本次獲得點數、新餘額、目前等級" },
      { tag: "new",     text: "推薦獎勵 Email 通知：推薦完成時雙方各收到 Email，顯示獎勵點數及新餘額" },
      { tag: "new",     text: "Expire Points Cron：每月 1 日自動過期超過 12 個月的點數（vercel.json 已設定）" },
      { tag: "new",     text: "會員通知設定：Profile 頁面可開關生日優惠、補充提醒、行銷訊息" },
      { tag: "new",     text: "Revenue 點數標籤：已自動發點數的記錄旁顯示 ✦ Xpts 金色標籤" },
      { tag: "new",     text: "預約連結：現有 Square 預約按電話/Email 自動比對，歷史紀錄自動綁定會員帳號" },
      { tag: "improve", text: "Refill 倒數計時卡片：Dashboard 顯示距上次來訪天數、推薦補充類型、進度條" },
    ],
  },
  {
    date: "Jul 22, 2026", label: "2026-07-22",
    changes: [
      { tag: "new",     text: "Revenue 多付款方式：付款方式按鈕改為多選，同一筆可同時選 Cash + Card，各自輸入金額（例：現金 $60 + 刷卡 $19），合計自動加總" },
      { tag: "improve", text: "Revenue 拆分付款顯示：多付款記錄直接在欄位顯示每種方式與金額（💵 Cash $60　💳 Card $19），一目了然" },
      { tag: "fix",     text: "Revenue 改期自動搬移：預約改期後，舊日期的 $0 佔位自動刪除，新日期自動新增（例：Eleni 7/31 → 7/29，Revenue 跟著同步）" },
      { tag: "fix",     text: "Revenue 全面對齊：每次載入 / 點 Sync Square，自動比對所有已確認預約，多餘的 $0 佔位（改期殘留、取消殘留）一律清除" },
      { tag: "fix",     text: "Revenue 編輯 Bug：修復每次 Edit 存檔都會覆蓋記帳人名字的問題" },
    ],
  },
  {
    date: "Jul 21, 2026", label: "2026-07-21",
    changes: [
      { tag: "new",     text: "Revenue 填表人：Add / Edit / Delete 時彈窗詢問是誰操作，自動記住上次填寫的名字" },
      { tag: "new",     text: "Revenue History：新增歷史紀錄面板，顯示所有新增／修改／刪除記錄，包含操作人、時間、金額變化" },
      { tag: "new",     text: "Revenue Delete 確認：刪除前顯示確認橫幅，防止誤刪" },
      { tag: "new",     text: "Revenue Groupon (GP) 付款方式：新增 Groupon 按鈕，完整顯示 Groupon 名稱" },
      { tag: "improve", text: "Revenue Package 圖示改為「3×」，更直覺" },
      { tag: "improve", text: "Revenue 填表人顯示在付款方式圖示左側：粗體大字黑色（Betty · 💛 Zelle $45）" },
      { tag: "new",     text: "Services 新增 Brow Lamination 眉毛燙染服務：+Tinting+Shaping $130、+Shaping $110" },
      { tag: "new",     text: "Services Wax 獨立分類：Eyebrow $10、Cheeks $15、Chin $20、Upper Lip $10、Lower Lip $10" },
      { tag: "improve", text: "Services 價格更新：Lash Lift $79、Tinting $20、Lift+Tinting Combo $99、Color Lash Ext $25" },
      { tag: "improve", text: "3× Package Session 日期改為短格式（4 Jun），滑鼠移過去顯示完整日期" },
    ],
  },
  {
    date: "Jul 20, 2026", label: "2026-07-20",
    changes: [
      { tag: "new",     text: "Revenue 營業額追蹤上線：Zelle / 現金 / 刷卡三種付款方式，可手動記帳，按日展開查看明細" },
      { tag: "new",     text: "Revenue 獨立為側欄項目，位於 Dashboard 與 Report 之間" },
      { tag: "new",     text: "Revenue 同步 Square：未來預約自動匯入為 $0 待填，Square 付款後自動更新金額" },
      { tag: "new",     text: "Revenue 跨裝置同步：每 30 秒自動刷新，任何裝置新增記錄立即同步" },
      { tag: "improve", text: "Revenue 數字欄位對齊：服務費 / 小費 / 合計三欄統一排版" },
      { tag: "improve", text: "Revenue 付款方式顯示在金額左側（💛 Zelle $45）" },
      { tag: "improve", text: "Revenue 按月份分組，七月在上八月在下，每月內由舊到新排列，今天高亮顯示" },
      { tag: "improve", text: "Revenue 加入 Package 為第四種付款方式" },
      { tag: "improve", text: "Appointments 側欄移除 Calendar，只保留 Bookings" },
    ],
  },
  {
    date: "Jul 19, 2026", label: "2026-07-19",
    changes: [
      { tag: "new",     text: "Version History — Apple Store 風格版本更新日誌上線，在側欄獨立成一區" },
      { tag: "fix",     text: "生日通知重複發送修復：同電話或 Email 的客人現在只收到一次" },
      { tag: "fix",     text: "Admin 新增預約不再重複寄確認信" },
      { tag: "fix",     text: "Review/Refill SMS 預設改為關閉，需要在 Automations 手動開啟" },
      { tag: "fix",     text: "Square 付款後不再產生重複 Google Calendar 事件（先刪舊的再建新的）" },
      { tag: "fix",     text: "預覽發送名單現在正確過濾黑名單客人" },
      { tag: "fix",     text: "Google Review 連結統一修正為正確短網址" },
      { tag: "fix",     text: "Automations 頁面 Review Email 標籤改為「同預約當天發送」" },
    ],
  },
  {
    date: "Jul 17, 2026", label: "2026-07-17",
    changes: [
      { tag: "new",     text: "Betty 改期通知 Email：Square 預約改期時自動發信給 Betty，顯示新舊時間對比" },
      { tag: "new",     text: "Admin 登入記錄：每次登入自動記錄時間、裝置型號、IP 位置，顯示在側欄" },
      { tag: "improve", text: "Activity Log 整合進 Dashboard，同時在側欄保留精簡版登入記錄" },
      { tag: "fix",     text: "側欄客戶計數修正（顯示全部 active，非搜尋後的數字）" },
      { tag: "fix",     text: "Admin 導覽列補回遺失的 Calendar / Bookings 項目" },
      { tag: "fix",     text: "刪除備忘項目防止誤刪尚未儲存的新項目（new_ 前綴判斷）" },
      { tag: "fix",     text: "Desktop 表格欄位 colSpan 修正" },
    ],
  },
  {
    date: "Jul 15, 2026", label: "2026-07-15",
    changes: [
      { tag: "new",     text: "退款政策頁面上線：顯示在服務頁面底部，格式為行內橫幅" },
      { tag: "fix",     text: "Send History 日期顯示與排序修正" },
      { tag: "fix",     text: "已改期的預約不再觸發當天的 Review 自動發送" },
      { tag: "improve", text: "退款政策橫幅版面調整：移入服務區塊內部，字體放大" },
    ],
  },
  {
    date: "Jul 8, 2026", label: "2026-07-08",
    changes: [
      { tag: "new",     text: "封鎖所有訊息（Block All Messages）：個別客人設定，封鎖後不收任何自動訊息" },
      { tag: "fix",     text: "首頁星期幾顯示、預約頁時間顯示改用紐約時區（修正時差問題）" },
    ],
  },
  {
    date: "Jul 4, 2026", label: "2026-07-04",
    changes: [
      { tag: "improve", text: "假日群發：預覽清單恆常顯示，Send Now 按鈕跳過今天已發送的客人" },
      { tag: "improve", text: "假日群發：發送後繼續顯示收件人列表，可確認發送結果" },
      { tag: "improve", text: "假日群發：新增搜尋列，可快速找到特定客人" },
      { tag: "fix",     text: "假日群發：修復不明名字顯示為「Unknown」的問題" },
      { tag: "fix",     text: "假日群發：修復因取消預約排除邏輯導致真實客人不出現的問題" },
      { tag: "fix",     text: "假日群發：修復 NULL owner 客人被排除在外的問題" },
      { tag: "fix",     text: "假日群發：修復只有 last name 的客人 A-Z 排序錯誤" },
    ],
  },
  {
    date: "Jul 3, 2026", label: "2026-07-03",
    changes: [
      { tag: "new",     text: "假日/廣播 SMS 群發：可選節日範本（獨立紀念日、感恩節、聖誕節等），一鍵發送全部客人" },
      { tag: "new",     text: "全選 / 取消全選：群發時可勾選或取消全部客人" },
      { tag: "improve", text: "Automations 發送名單每 30 秒自動刷新，執行結果即時顯示" },
      { tag: "fix",     text: "取消預約的客人不再出現在 Review/Refill 自動發送名單" },
      { tag: "fix",     text: "客人名單按電話/Email 去重，與 My Clients 邏輯完全一致" },
      { tag: "fix",     text: "沒有名字的客人記錄（Square 同步問題）跳過不發送" },
      { tag: "fix",     text: "No Auto Review/Refill 設定日期格式修正" },
    ],
  },
  {
    date: "Jul 2, 2026", label: "2026-07-02",
    changes: [
      { tag: "new",     text: "Automations 預覽名單：執行前可預覽今天會發送給哪些客人" },
      { tag: "new",     text: "發送 Log：Automations 頁面顯示過去的執行記錄" },
      { tag: "new",     text: "生日功能整合至 Automations（小工具）" },
      { tag: "new",     text: "SMS 退訂管理（Unsubscribe）：記錄退訂客人，自動跳過" },
      { tag: "new",     text: "CSV 匯出：按電話/Email 去重後匯出，包含所有訪問日期" },
      { tag: "new",     text: "自動發送狀態顯示：客人卡片顯示 Review/Refill 自動發送時間" },
      { tag: "new",     text: "No Auto Review：個別客人可設定不接收自動 Review" },
      { tag: "new",     text: "No Auto Refill：個別客人可設定不接收自動 Refill 提醒" },
      { tag: "new",     text: "Reset Auto-Sent 按鈕：可重置已發送狀態" },
      { tag: "new",     text: "Review Given 勾選後自動開啟「No Auto Review」" },
      { tag: "improve", text: "Review Send 按鈕在 Review Given 勾選後變灰無法點擊" },
      { tag: "improve", text: "Review SMS 模板統一：手動發送與 Cron 自動發送文字相同" },
      { tag: "improve", text: "發送歷史記錄：顯示所有類型，每筆可單獨刪除" },
      { tag: "fix",     text: "全站日期改用紐約時區（src/lib/date.ts）" },
      { tag: "fix",     text: "Refill Cron 去重：手動已發送會阻擋當天的自動發送" },
      { tag: "fix",     text: "Cron 修正：排程改為晚上 8:30（EDT），電話號碼更新" },
      { tag: "fix",     text: "生日 SMS 預約連結修正（原連結 404）" },
      { tag: "fix",     text: "Review SMS 顯示真實 Google Review 連結" },
      { tag: "fix",     text: "跨裝置日期格式不一致問題修正" },
      { tag: "fix",     text: "Cron 跳過 phone/email 為空的客人問題修正" },
      { tag: "fix",     text: "Session 過期時間修正" },
    ],
  },
  {
    date: "Jul 1, 2026", label: "2026-07-01",
    changes: [
      { tag: "new",     text: "聯絡表單加入 SMS 同意選項（Twilio 合規要求）" },
      { tag: "fix",     text: "Analytics 報告修正：統計全月數據而非只到今天" },
    ],
  },
  {
    date: "Jun 30, 2026", label: "2026-06-30",
    changes: [
      { tag: "improve", text: "隱私政策更新：SMS 同意聲明符合 Square Appointments 流程（Twilio 合規）" },
    ],
  },
  {
    date: "Jun 29, 2026", label: "2026-06-29",
    changes: [
      { tag: "new",     text: "生日 Email/SMS 發送按鈕加入 Admin 客人操作面板（桌面版）" },
      { tag: "new",     text: "生日功能：20% off 優惠 Email/SMS 模板、Admin 發送按鈕" },
      { tag: "improve", text: "電話號碼更新至 516-984-3859（全站及 Automations 模板）" },
      { tag: "fix",     text: "Betty 重複通知修復：Square App 預約才發通知，網站預約已有另外通知" },
    ],
  },
  {
    date: "Jun 28, 2026", label: "2026-06-28",
    changes: [
      { tag: "new",     text: "Dashboard 每日問候彈窗：Betty 登入後看到今天天氣、提醒帶傘、喝水提示" },
      { tag: "improve", text: "彈窗動畫優化：信封開啟效果、彈跳動畫、手機版從底部滑入" },
      { tag: "improve", text: "星期天顯示 10 句輪流的下班提醒語錄" },
    ],
  },
  {
    date: "Jun 26, 2026", label: "2026-06-26",
    changes: [
      { tag: "new",     text: "SEO 落地頁：新增 4 個服務專頁（睫毛嫁接、紋眉等）提升 Google 搜尋" },
      { tag: "new",     text: "Gallery 更新：新照片、影片、Hero 圖片更新" },
      { tag: "improve", text: "SEO Pages 管理頁面可捲動" },
      { tag: "fix",     text: "取消訪問從所有計數中排除：客戶卡片 badge、CSV 匯出、Dashboard 計數" },
    ],
  },
  {
    date: "May 12, 2026", label: "2026-05-12",
    changes: [
      { tag: "improve", text: "SEO/GEO Schema 強化：FAQ、WebSite、BreadcrumbList、Offer schema 加入首頁" },
    ],
  },
  {
    date: "May 11, 2026", label: "2026-05-11",
    changes: [
      { tag: "improve", text: "SEO 全面優化：canonical、robots.txt、hreflang、sitemap、alt text 修正" },
      { tag: "new",     text: "第二支電話號碼 516-984-3859 加入頁尾和聯絡區塊" },
    ],
  },
  {
    date: "May 10, 2026", label: "2026-05-10",
    changes: [
      { tag: "new",     text: "About Us 頁面上線，加入導覽列" },
      { tag: "new",     text: "彈窗改為新客戶 30% off 優惠（取代母親節活動）" },
      { tag: "improve", text: "服務預覽更新：睫毛嫁接、3D 睫毛、補充護理三大項" },
    ],
  },
  {
    date: "May 9, 2026", label: "2026-05-09",
    changes: [
      { tag: "improve", text: "FAQ 整理：移除 Elly 相關條目，全部按字母 A-Z 排序" },
    ],
  },
  {
    date: "May 8, 2026", label: "2026-05-08",
    changes: [
      { tag: "improve", text: "聯絡頁面：加入停車說明，聯絡資訊間距統一" },
      { tag: "improve", text: "Premium/Cashmere Refill 價格更新（+$10）" },
      { tag: "improve", text: "移除 Waxing、Lash Lift & Tint 服務" },
    ],
  },
  {
    date: "May 7, 2026", label: "2026-05-07",
    changes: [
      { tag: "new",     text: "FAQ 頁面上線，加入導覽列，針對 Manhasset 在地關鍵字優化" },
      { tag: "new",     text: "3D Lashes 服務卡片新增（140pcs）" },
      { tag: "improve", text: "手機版 UX 全面優化：Hero 裁切、頁尾 CTA、版面間距" },
      { tag: "improve", text: "服務卡片完整可點擊，連結到服務頁面" },
    ],
  },
  {
    date: "May 5, 2026", label: "2026-05-05",
    changes: [
      { tag: "new", text: "Google Ads 轉換追蹤（AW-18136114188）" },
    ],
  },
  {
    date: "May 4, 2026", label: "2026-05-04",
    changes: [
      { tag: "improve", text: "Premium/Cashmere 價格更新" },
      { tag: "new",     text: "/booking 重新導向至 Square Appointments" },
    ],
  },
  {
    date: "May 3, 2026", label: "2026-05-03",
    changes: [
      { tag: "new", text: "Design Style Lashes 服務新增：固定 $140，4 欄服務格局" },
    ],
  },
  {
    date: "May 2, 2026", label: "2026-05-02",
    changes: [
      { tag: "new",     text: "Square Appointments 取代自建預約系統：所有「立即預約」按鈕導向 Square" },
      { tag: "improve", text: "服務卡片照片全面更換（Real Mink、Premium、Care & PMU）" },
      { tag: "improve", text: "Hero 照片更換，新增禮品袋照片作為第三張輪播" },
      { tag: "improve", text: "手機版 Hero 高度、裁切方式優化" },
      { tag: "improve", text: "Real Mink 更名；服務時間更新（1hr / 1hr 30min）" },
      { tag: "fix",     text: "Google Analytics ID 更新" },
    ],
  },
  {
    date: "May 1, 2026", label: "2026-05-01",
    changes: [
      { tag: "improve", text: "網站大改版：Hero 全屏照片輪播（無文字），Services 三欄卡片設計" },
      { tag: "new",     text: "Gallery 上線：5 張工作室照片" },
      { tag: "new",     text: "母親節彈窗：享五折優惠" },
      { tag: "new",     text: "Admin 改期功能：直接在後台改期，自動同步 Google Calendar + Square" },
      { tag: "new",     text: "取消同步：取消預約自動同步 Supabase、Google Calendar、Square" },
      { tag: "fix",     text: "Square Service ID 更新配合新方案目錄" },
    ],
  },
  {
    date: "Apr 30, 2026", label: "2026-04-30",
    changes: [
      { tag: "new",     text: "確認信加入自助取消/改期連結，客人可直接操作" },
      { tag: "new",     text: "網站預約自動同步到 Square Appointments 行事曆" },
      { tag: "improve", text: "域名遷移：yeelashesny.com → yeeeyelashes.com（全站連結更新）" },
      { tag: "fix",     text: "確認信從 ICS 附件改為 Google Calendar 連結" },
      { tag: "fix",     text: "修復 Email 寄件人設定問題" },
    ],
  },
  {
    date: "Apr 29, 2026", label: "2026-04-29",
    changes: [
      { tag: "improve", text: "SEO meta description 更新（三大核心服務）" },
      { tag: "new",     text: "Google Search Console 驗證完成" },
    ],
  },
  {
    date: "Apr 27, 2026", label: "2026-04-27",
    changes: [
      { tag: "new",     text: "優惠券（Coupon）頁面上線，加入導覽列" },
      { tag: "improve", text: "Logo 位置與大小調整" },
    ],
  },
  {
    date: "Apr 26, 2026", label: "2026-04-26",
    changes: [
      { tag: "improve", text: "OG 分享圖片重新設計：黑底金框、Logo + 文字分欄版面" },
    ],
  },
  {
    date: "Apr 21, 2026", label: "2026-04-21",
    changes: [
      { tag: "new",     text: "Hero 照片輪播：高解析度工作室照片，左右箭頭切換" },
      { tag: "new",     text: "真實 Google 評論上線，取代佔位評論" },
      { tag: "improve", text: "服務重新命名：Mink/Silk + Premium/Cashmere，加入 Refill 下拉選項" },
      { tag: "improve", text: "營業時間更新：9:30 AM – 7:00 PM" },
      { tag: "improve", text: "服務時間格式統一（1.5 hr）、Contact 地圖放大" },
      { tag: "fix",     text: "Refill 價格與時間修正（3 Week Refill、PC 180pcs）" },
    ],
  },
  {
    date: "Apr 16, 2026", label: "2026-04-16",
    changes: [
      { tag: "new",     text: "Google Analytics 上線（G-V65FBEY2NK）" },
      { tag: "improve", text: "移除所有 Pexels 佔位圖片" },
    ],
  },
  {
    date: "Apr 15, 2026", label: "2026-04-15",
    changes: [
      { tag: "new", text: "🎉 Yee Eyelashes 網站正式上線" },
      { tag: "new", text: "完整線上預約系統：選擇服務、日期、時間，即時 Email 確認" },
      { tag: "new", text: "Google Calendar 整合：每筆預約自動建立行事曆事件" },
      { tag: "new", text: "Admin 管理面板：客戶名單、預約日曆" },
    ],
  },
  {
    date: "Apr 9, 2026", label: "2026-04-09",
    changes: [
      { tag: "new", text: "專案初始化" },
    ],
  },
];

export default function ChangelogView() {
  const [openDays, setOpenDays] = useState<Set<string>>(new Set([DAYS[0].label]));

  function toggle(label: string) {
    setOpenDays(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  const totalChanges = DAYS.reduce((s, d) => s + d.changes.length, 0);

  return (
    <div className="flex-1 overflow-auto bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-6 py-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-[12px] bg-[#1C1C1C] flex items-center justify-center shrink-0">
          <span className="text-[#C9A84C] text-[18px] font-bold">Y</span>
        </div>
        <div>
          <h1 className="text-[18px] font-bold text-[#1C1C1C]">Version History</h1>
          <p className="text-[12px] text-neutral-400 mt-0.5">{DAYS.length} days · {totalChanges} updates · Since Apr 2026</p>
        </div>
      </div>

      {/* Tag legend */}
      <div className="bg-white border-b border-neutral-100 px-6 py-3 flex gap-3 flex-wrap">
        {(["new","improve","fix"] as Tag[]).map(t => (
          <span key={t} className={`text-[9px] font-bold tracking-[0.12em] px-2 py-0.5 rounded ${TAG_STYLES[t]}`}>
            {t === "new" ? "NEW  新功能" : t === "improve" ? "+ 優化" : "FIX 修復"}
          </span>
        ))}
      </div>

      {/* Day list */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-2">
        {DAYS.map((day, idx) => {
          const isOpen   = openDays.has(day.label);
          const isLatest = idx === 0;
          return (
            <div key={day.label}
              className={`bg-white rounded-2xl overflow-hidden border ${isLatest ? "border-[#C9A84C]/50" : "border-neutral-200"}`}>
              <button onClick={() => toggle(day.label)}
                className="w-full px-5 py-3.5 flex items-center gap-3 text-left">
                {/* Date badge */}
                <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full tabular-nums ${isLatest ? "bg-[#1C1C1C] text-white" : "bg-neutral-100 text-neutral-500"}`}>
                  {day.date}
                </span>
                {isLatest && (
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#C9A84C] font-bold shrink-0">Latest</span>
                )}
                <span className="flex-1" />
                {/* Count + chevron */}
                <span className="text-[11px] text-neutral-300 shrink-0">{day.changes.length} items</span>
                <span className={`text-neutral-400 text-[15px] transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}>⌄</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 space-y-2.5">
                  <div className="h-px bg-neutral-100 mb-3" />
                  {day.changes.map((c, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className={`shrink-0 mt-0.5 text-[9px] font-bold tracking-[0.1em] px-1.5 py-0.5 rounded ${TAG_STYLES[c.tag]}`}>
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

        <p className="text-center text-[11px] text-neutral-300 py-4">— 從 2026 年 4 月 9 日開始 —</p>
      </div>
    </div>
  );
}
