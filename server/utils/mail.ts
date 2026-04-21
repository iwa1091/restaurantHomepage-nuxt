import { Resend } from 'resend'

// ── ブランドカラー ─────────────────────────────────────────
const PRIMARY = '#1b2838'
const ACCENT = '#c6a355'
const BG = '#fafaf8'
const MUTED = '#6b7280'

// ── 共通レイアウト ────────────────────────────────────────
function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif;">
  <div style="max-width:560px;margin:2rem auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <!-- ヘッダー -->
    <div style="background:${PRIMARY};padding:1.5rem 2rem;">
      <p style="margin:0;color:${ACCENT};font-size:0.75rem;letter-spacing:0.12em;">SUSHI KAPPO</p>
      <h1 style="margin:0.25rem 0 0;color:#fff;font-size:1.2rem;font-weight:600;">${title}</h1>
    </div>
    <!-- 本文 -->
    <div style="padding:1.75rem 2rem;">
      ${body}
    </div>
    <!-- フッター -->
    <div style="background:${BG};border-top:1px solid #e5e7eb;padding:1rem 2rem;text-align:center;">
      <p style="margin:0;font-size:0.78rem;color:${MUTED};">すし割烹 いづ浦</p>
      <p style="margin:0.25rem 0 0;font-size:0.78rem;color:${MUTED};">〒850-0058 長崎県長崎市大黒町9-18 ／ TEL: 095-225-2255</p>
      <p style="margin:0.5rem 0 0;font-size:0.72rem;color:#9ca3af;">このメールは自動送信されています。返信はできません。</p>
    </div>
  </div>
</body>
</html>`
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:0.45rem 0;font-size:0.88rem;color:${MUTED};white-space:nowrap;width:8rem;">${label}</td>
    <td style="padding:0.45rem 0;font-size:0.88rem;color:${PRIMARY};font-weight:500;">${value}</td>
  </tr>`
}

function table(rows: string): string {
  return `<table style="width:100%;border-collapse:collapse;margin:0.75rem 0 1.25rem;">${rows}</table>`
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:0.7rem 1.75rem;background:${ACCENT};color:#fff;border-radius:999px;text-decoration:none;font-size:0.9rem;font-weight:600;">${label}</a>`
}

// ── メーラー ─────────────────────────────────────────────
function getResend() {
  const config = useRuntimeConfig()
  return new Resend(config.resendApiKey)
}

function from() {
  const config = useRuntimeConfig()
  return `すし割烹 いづ浦 <${config.mailFromAddress || 'noreply@izuura.com'}>`
}

function adminTo(): string {
  const config = useRuntimeConfig()
  return config.mailAdminAddress || 'admin@izuura.com'
}

// メール送信（失敗してもリクエストを止めない）
async function send(options: { to: string | string[]; subject: string; html: string }) {
  try {
    const resend = getResend()
    await resend.emails.send({ from: from(), ...options })
  }
  catch (err) {
    console.error('[mail] 送信エラー:', err)
  }
}

// ── 曜日フォーマット ───────────────────────────────────────
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`
}

const SEAT_LABELS: Record<string, string> = {
  counter: 'カウンター席',
  table: 'テーブル席',
  tatami: 'お座敷'
}

// ── 1. 会員登録ウェルカムメール ────────────────────────────
export async function sendWelcomeMail(to: string, name: string) {
  const html = layout('会員登録が完了しました', `
    <p style="margin:0 0 1rem;font-size:0.95rem;color:${PRIMARY};">${name} 様、<br>会員登録ありがとうございます。</p>
    <p style="margin:0 0 1.5rem;font-size:0.88rem;color:${MUTED};line-height:1.7;">
      マイページより予約履歴の確認・キャンセルが行えます。<br>
      今後ともすし割烹 いづ浦をよろしくお願いいたします。
    </p>
    <p style="text-align:center;">${btn('https://izuura.com/mypage', 'マイページを開く')}</p>
  `)
  await send({ to, subject: '【いづ浦】会員登録が完了しました', html })
}

// ── 2. 予約確認メール（お客様宛） ──────────────────────────
export interface ReservationMailData {
  name: string
  email: string
  date: string
  startTime: string
  endTime: string
  partySize: number | null
  seatType: string | null
  notes: string | null
  reservationCode: string
}

export async function sendReservationConfirmed(data: ReservationMailData) {
  const html = layout('ご予約を承りました', `
    <p style="margin:0 0 1rem;font-size:0.95rem;color:${PRIMARY};">${data.name} 様、<br>ご予約ありがとうございます。以下の内容で承りました。</p>
    ${table([
      row('日付', fmtDate(data.date)),
      row('時間', `${data.startTime} 〜 ${data.endTime}`),
      row('人数', `${data.partySize ?? '-'}名`),
      row('席タイプ', data.seatType ? (SEAT_LABELS[data.seatType] ?? data.seatType) : '-'),
      row('予約コード', `<strong style="color:${ACCENT};">${data.reservationCode}</strong>`),
      ...(data.notes ? [row('ご要望', data.notes)] : [])
    ].join(''))}
    <p style="margin:0 0 1rem;font-size:0.85rem;color:${MUTED};line-height:1.7;">
      予約内容はマイページよりご確認いただけます。<br>
      キャンセルのご連絡はお電話（095-225-2255）またはマイページより承ります。
    </p>
    <p style="text-align:center;">${btn('https://izuura.com/mypage/reservations', '予約履歴を確認')}</p>
  `)
  await send({ to: data.email, subject: '【いづ浦】ご予約を承りました', html })
}

// ── 3. 新規予約通知（管理者宛） ────────────────────────────
export async function sendAdminReservationNotice(data: ReservationMailData) {
  const html = layout('新規予約が入りました', `
    <p style="margin:0 0 1rem;font-size:0.95rem;color:${PRIMARY};">新しいご予約が登録されました。</p>
    ${table([
      row('予約コード', data.reservationCode),
      row('お客様名', data.name),
      row('メール', data.email),
      row('日付', fmtDate(data.date)),
      row('時間', `${data.startTime} 〜 ${data.endTime}`),
      row('人数', `${data.partySize ?? '-'}名`),
      row('席タイプ', data.seatType ? (SEAT_LABELS[data.seatType] ?? data.seatType) : '-'),
      ...(data.notes ? [row('ご要望', data.notes)] : [])
    ].join(''))}
    <p style="text-align:center;">${btn('https://izuura.com/admin/reservations', '管理画面で確認')}</p>
  `)
  await send({ to: adminTo(), subject: `【いづ浦管理】新規予約: ${data.name} 様 ${fmtDate(data.date)}`, html })
}

// ── 4. キャンセル確認メール（お客様宛） ───────────────────
export interface CancelMailData {
  name: string
  email: string
  date: string
  startTime: string
  reservationCode: string
  cancelReason: string | null
}

export async function sendReservationCancelled(data: CancelMailData) {
  const html = layout('ご予約のキャンセルを受け付けました', `
    <p style="margin:0 0 1rem;font-size:0.95rem;color:${PRIMARY};">${data.name} 様、<br>以下のご予約のキャンセルを承りました。</p>
    ${table([
      row('予約コード', data.reservationCode),
      row('日付', fmtDate(data.date)),
      row('時間', data.startTime),
      ...(data.cancelReason ? [row('キャンセル理由', data.cancelReason)] : [])
    ].join(''))}
    <p style="margin:0;font-size:0.85rem;color:${MUTED};line-height:1.7;">
      またのご来店を心よりお待ちしております。
    </p>
  `)
  await send({ to: data.email, subject: '【いづ浦】ご予約のキャンセルを承りました', html })
}

// ── 5. お問い合わせ通知（管理者宛） ──────────────────────
export interface ContactMailData {
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
}

export async function sendContactMail(data: ContactMailData) {
  const html = layout('お問い合わせが届きました', `
    <p style="margin:0 0 1rem;font-size:0.95rem;color:${PRIMARY};">ウェブサイトからお問い合わせが届きました。</p>
    ${table([
      row('お名前', data.name),
      row('メール', data.email),
      ...(data.phone ? [row('電話', data.phone)] : []),
      ...(data.subject ? [row('件名', data.subject)] : [])
    ].join(''))}
    <div style="margin:0.5rem 0 1.25rem;padding:0.9rem;background:${BG};border-radius:8px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 0.35rem;font-size:0.8rem;color:${MUTED};">お問い合わせ内容</p>
      <p style="margin:0;font-size:0.9rem;color:${PRIMARY};white-space:pre-wrap;">${escapeHtml(data.message)}</p>
    </div>
    <p style="text-align:center;">${btn(`mailto:${data.email}`, '返信する')}</p>
  `)
  await send({ to: adminTo(), subject: `【いづ浦】お問い合わせ: ${data.name} 様`, html })
}

// ── 6. 宴会問い合わせ通知（管理者宛） ────────────────────
export interface BanquetMailData {
  name: string
  email: string
  phone: string | null
  date: string | null
  partySize: number | null
  budget: string | null
  message: string
  id: number
}

export async function sendBanquetInquiryMail(data: BanquetMailData) {
  const html = layout('宴会問い合わせが届きました', `
    <p style="margin:0 0 1rem;font-size:0.95rem;color:${PRIMARY};">宴会のお問い合わせが届きました。</p>
    ${table([
      row('お名前', data.name),
      row('メール', data.email),
      ...(data.phone ? [row('電話', data.phone)] : []),
      ...(data.date ? [row('希望日程', fmtDate(data.date))] : []),
      ...(data.partySize ? [row('人数', `${data.partySize}名`)] : []),
      ...(data.budget ? [row('ご予算', data.budget)] : [])
    ].join(''))}
    <div style="margin:0.5rem 0 1.25rem;padding:0.9rem;background:${BG};border-radius:8px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 0.35rem;font-size:0.8rem;color:${MUTED};">ご要望</p>
      <p style="margin:0;font-size:0.9rem;color:${PRIMARY};white-space:pre-wrap;">${escapeHtml(data.message)}</p>
    </div>
    <p style="text-align:center;">${btn(`https://izuura.com/admin/banquet-inquiries/${data.id}`, '管理画面で確認')}</p>
  `)
  await send({ to: adminTo(), subject: `【いづ浦管理】宴会問い合わせ: ${data.name} 様`, html })
}

// ── ユーティリティ ────────────────────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
