'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function money(value: any, currency: 'USD' | 'ARS') {
  const number = Number(value || 0)
  if (currency === 'USD') return `U$S ${number.toLocaleString('es-AR')}`
  return `$ ${number.toLocaleString('es-AR')}`
}

function formatDate(date: string) {
  if (!date) return '—'
  return new Date(date + 'T00:00:00').toLocaleDateString('es-AR')
}

function statusConfig(status: string) {
  const map: Record<string, { color: string; bg: string; dot: string }> = {
    'Pedido confirmado': { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', dot: '#94a3b8' },
    'En fabricación':   { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  dot: '#fbbf24' },
    'Listo para embarcar': { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', dot: '#a78bfa' },
    'Embarcado':        { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', dot: '#818cf8' },
    'En tránsito':      { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  dot: '#38bdf8' },
    'Arribado':         { color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  dot: '#fb923c' },
    'En aduana':        { color: '#f87171', bg: 'rgba(248,113,113,0.1)', dot: '#f87171' },
    'Nacionalizado':    { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',  dot: '#22d3ee' },
    'En depósito':      { color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)',  dot: '#2dd4bf' },
    'Disponible':       { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  dot: '#4ade80' },
    'Cerrado':          { color: '#475569', bg: 'rgba(71,85,105,0.1)',   dot: '#475569' },
  }
  return map[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', dot: '#94a3b8' }
}

const STATUS_ORDER = [
  'Pedido confirmado','En fabricación','Listo para embarcar','Embarcado',
  'En tránsito','Arribado','En aduana','Nacionalizado','En depósito','Disponible','Cerrado'
]

export default function Home() {
  const [data, setData] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Estado')

  useEffect(() => {
    async function loadData() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { window.location.href = '/login'; return }

      const { data, error } = await supabase.from('imports').select(`*, payments (*), documents (*)`)
      const { data: paymentsData } = await supabase.from('payments').select(`*, imports (code)`)

      if (error) { alert(error.message); return }
      setData(data || [])
      setPayments(paymentsData || [])
      setLoading(false)
    }
    loadData()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const total = data.length
  const active = data.filter(i => i.status !== 'Cerrado').length
  const nextDeliveries = data.filter(i => i.possible_delivery_date).length

  const usdPayments = payments.filter(p => p.currency === 'USD')
  const usdCommitted = usdPayments.reduce((t, p) => t + Number(p.amount || 0), 0)
  const usdPaid = usdPayments.filter(p => p.status === 'Pagado').reduce((t, p) => t + Number(p.amount || 0), 0)
  const usdPending = usdCommitted - usdPaid

  const arsPayments = payments.filter(p => p.currency === 'ARS')
  const arsCommitted = arsPayments.reduce((t, p) => t + Number(p.amount || 0), 0)
  const arsPaid = arsPayments.filter(p => p.status === 'Pagado').reduce((t, p) => t + Number(p.amount || 0), 0)
  const arsPending = arsCommitted - arsPaid

  const today = new Date().toISOString().split('T')[0]
  const overduePayments = payments.filter(p => p.status !== 'Pagado' && p.due_date && p.due_date < today).length
  const upcomingPayments = payments
    .filter(p => p.status !== 'Pagado' && p.due_date && p.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 3)

  const filteredData = data
    .filter(item => {
      const matchesSearch = item.code?.toLowerCase().includes(search.toLowerCase()) || item.main_product?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'Estado' || item.status?.toLowerCase() === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (!a.eta_port) return 1
      if (!b.eta_port) return -1
      return a.eta_port.localeCompare(b.eta_port)
    })

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingWrap}>
          <div style={styles.loadingDot} />
          <span style={{ color: '#22d3ee', fontFamily: 'monospace', fontSize: 18, letterSpacing: 4 }}>CARGANDO SISTEMA</span>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logoWrap}>
          <span style={styles.logoAccent}>▸</span>
          <span style={styles.logoText}>IMPORT TRACKER</span>
          <span style={styles.logoBadge}>v2</span>
        </div>
        <nav style={styles.nav}>
          <a href="/new-import" style={styles.btnPrimary}>+ Nueva importación</a>
          <a href="/documents" style={styles.btnGhost}>Documentos</a>
          <a href="/payments" style={styles.btnGhost}>Pagos</a>
          <button onClick={logout} style={{ ...styles.btnGhost, cursor: 'pointer', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171', background: 'rgba(248,113,113,0.05)' }}>
            Salir
          </button>
        </nav>
      </header>

      {/* KPI STRIP */}
      <section style={styles.kpiStrip}>
        <KpiCard label="Total importaciones" value={total} accent="#38bdf8" icon="▦" />
        <KpiCard label="Activas" value={active} accent="#4ade80" icon="◉" />
        <KpiCard label="Con delivery estimado" value={nextDeliveries} accent="#a78bfa" icon="◎" />
        <KpiCard
          label="Pagos vencidos"
          value={overduePayments}
          accent={overduePayments > 0 ? '#f87171' : '#4ade80'}
          icon={overduePayments > 0 ? '⚠' : '✓'}
          alert={overduePayments > 0}
        />
      </section>

      {/* FINANCIAL SUMMARY */}
      <section style={styles.section}>
        <SectionTitle>Resumen financiero</SectionTitle>
        <div style={styles.finGrid}>
          <FinCard label="USD PAGADO"    amount={money(usdPaid, 'USD')}    accent="#4ade80" />
          <FinCard label="USD PENDIENTE" amount={money(usdPending, 'USD')} accent="#fb923c" />
          <FinCard label="ARS PENDIENTE" amount={money(arsPending, 'ARS')} accent="#f87171" />
        </div>
      </section>

      {/* UPCOMING PAYMENTS + MONTHLY CHART */}
      <section style={styles.section}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {upcomingPayments.length > 0 && (
            <div style={{ flex: '0 0 auto' }}>
              <SectionTitle>Próximos vencimientos</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcomingPayments.map((payment: any) => {
                  const importCode = data.find(i => i.id === payment.import_id)?.code || '—'
                  const amount = payment.currency === 'USD' ? money(payment.amount, 'USD') : money(payment.amount, 'ARS')
                  return (
                    <div key={payment.id} style={styles.upcomingRow}>
                      <span style={{ color: '#fdba74', fontFamily: 'monospace', fontSize: 21, fontWeight: 700, minWidth: 150, letterSpacing: 1 }}>
                        {new Date(payment.due_date + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                      </span>
                      <span style={{ color: '#22d3ee', fontFamily: 'monospace', fontSize: 21, fontWeight: 700, minWidth: 110 }}>{importCode}</span>
                      <span style={{ color: '#cbd5e1', fontFamily: 'monospace', fontSize: 21, flex: 1 }}>{payment.concept}</span>
                      <span style={{ color: '#f87171', fontFamily: 'monospace', fontSize: 21, fontWeight: 700 }}>{amount}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <div style={{ flex: '0 0 460px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(34,211,238,0.08)', borderRadius: 8, padding: '14px 18px' }}>
            <SectionTitle>Pagos pendientes / mes</SectionTitle>
            <MonthlyPaymentsChart payments={payments} />
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section style={styles.section}>
        <SectionTitle>Importaciones</SectionTitle>
        <div style={styles.filterBar}>
          <div style={styles.searchWrap}>
            <span style={{ color: '#475569', fontSize: 17, marginRight: 8 }}>⌕</span>
            <input
              style={styles.searchInput}
              placeholder="Buscar por código o producto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            style={styles.select}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option>Estado</option>
            {STATUS_ORDER.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </section>

      {/* IMPORT CARDS */}
      <div style={styles.cardsGrid}>
        {filteredData.map(item => <ImportCard key={item.id} item={item} today={today} />)}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        input::placeholder { color: #334155; }
        option { background: #0f172a; color: #94a3b8; }
      `}</style>
    </main>
  )
}

/* ─── SUB-COMPONENTS ─────────────────────────────────────────────────────── */

function KpiCard({ label, value, accent, icon, alert = false }: any) {
  return (
    <div style={{
      ...styles.kpiCard,
      borderColor: alert ? 'rgba(248,113,113,0.5)' : 'rgba(34,211,238,0.12)',
      background: alert ? 'rgba(248,113,113,0.05)' : 'rgba(15,23,42,0.8)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: 2 }}>{label}</span>
        <span style={{ fontSize: 18, color: accent, opacity: 0.7 }}>{icon}</span>
      </div>
      <span style={{ fontSize: 42, fontWeight: 700, fontFamily: 'monospace', color: accent, letterSpacing: -1, lineHeight: 1 }}>{value}</span>
    </div>
  )
}

function FinCard({ label, amount, accent }: any) {
  return (
    <div style={styles.finCard}>
      <span style={{ fontSize: 16, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8, display: 'block' }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'monospace', color: accent }}>{amount}</span>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }} />
    </div>
  )
}

function SectionTitle({ children }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <span style={{ color: '#22d3ee', fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace' }}>◈ {children}</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(34,211,238,0.3), transparent)' }} />
    </div>
  )
}

function ImportCard({ item, today }: any) {
  const itemPayments = item.payments || []
  const paidTotal = itemPayments.filter((p: any) => p.status?.toLowerCase() === 'pagado').reduce((t: number, p: any) => t + Number(p.amount || 0), 0)
  const pendingPayments = itemPayments.filter((p: any) => p.status?.toLowerCase() !== 'pagado')
  const overdueItemPayments = pendingPayments.filter((p: any) => p.due_date && p.due_date < today)
  const next7DaysPayments = pendingPayments.filter((p: any) => {
    if (!p.due_date) return false
    const diffDays = Math.ceil((new Date(p.due_date + 'T00:00:00').getTime() - new Date().getTime()) / 86400000)
    return diffDays >= 0 && diffDays <= 7
  })
  const semaphore = overdueItemPayments.length > 0 ? 'alert' : next7DaysPayments.length > 0 ? 'warn' : 'ok'

  const etaDiff = item.eta_port
    ? Math.ceil((new Date(item.eta_port + 'T00:00:00').getTime() - new Date().getTime()) / 86400000)
    : null

  const etaLabel = etaDiff === null ? 'Sin ETA'
    : etaDiff < 0 ? `Llegó hace ${Math.abs(etaDiff)}d`
    : etaDiff === 0 ? 'Arriba hoy'
    : etaDiff <= 7 ? `Arriba en ${etaDiff}d`
    : `Faltan ${etaDiff}d`

  const etaColor = etaDiff === null ? '#475569'
    : etaDiff < 0 ? '#fb923c'
    : etaDiff <= 7 ? '#f87171'
    : '#22d3ee'

  const st = statusConfig(item.status)

  // Order progress bar (order payment → possible delivery)
  const orderPct = (() => {
    if (!item.order_date || !item.possible_delivery_date) return null
    const start = new Date(item.order_date              + 'T00:00:00').getTime()
    const end   = new Date(item.possible_delivery_date  + 'T00:00:00').getTime()
    const now   = new Date().getTime()
    if (end <= start) return null
    return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100))
  })()

  // Maritime progress bar
  const sailingPct = (() => {
    if (!item.sailing_date || !item.eta_port) return null
    const sail = new Date(item.sailing_date + 'T00:00:00').getTime()
    const eta  = new Date(item.eta_port   + 'T00:00:00').getTime()
    const now  = new Date().getTime()
    if (eta <= sail) return null
    return Math.max(0, Math.min(100, ((now - sail) / (eta - sail)) * 100))
  })()

  const semaphoreConfig = {
    alert: { color: '#f87171', label: 'Acción requerida', char: '⚠' },
    warn:  { color: '#fbbf24', label: 'Próximo vencimiento', char: '◉' },
    ok:    { color: '#4ade80', label: 'Todo al día', char: '✓' },
  }[semaphore]

  const pendingForCard = itemPayments
    .filter((p: any) => p.status !== 'Pagado')
    .sort((a: any, b: any) => a.due_date?.localeCompare(b.due_date ?? '') ?? 0)
    .slice(0, 2)

  return (
    <div style={styles.importCard}>
      {/* Card header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <span style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 700, color: '#e2e8f0', letterSpacing: 1 }}>{item.code}</span>
          <div style={{ marginTop: 6 }}>
            <span style={{ fontSize: 14, color: semaphoreConfig.color, background: `${semaphoreConfig.color}15`, border: `1px solid ${semaphoreConfig.color}30`, borderRadius: 3, padding: '3px 10px', fontFamily: 'monospace', letterSpacing: 1 }}>
              {semaphoreConfig.char} {semaphoreConfig.label.toUpperCase()}
            </span>
          </div>
        </div>
        <span style={{ fontSize: 14, color: st.color, background: st.bg, border: `1px solid ${st.color}40`, borderRadius: 3, padding: '4px 12px', fontFamily: 'monospace', letterSpacing: 1, whiteSpace: 'nowrap' }}>
          {item.status}
        </span>
      </div>

      {/* Order progress bar */}
      {orderPct !== null && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, fontFamily: 'monospace', color: '#94a3b8', letterSpacing: 1 }}>
            <span>📋 {formatDate(item.order_date)}</span>
            <span style={{ color: orderPct >= 100 ? '#f87171' : '#fb923c', fontWeight: 700 }}>PRODUCCIÓN &nbsp;{Math.round(orderPct)}%</span>
            <span>📦 {formatDate(item.possible_delivery_date)}</span>
          </div>
          <div style={{ position: 'relative', height: 12, background: 'rgba(251,146,60,0.08)', borderRadius: 6, overflow: 'visible' }}>
            <div style={{ position: 'absolute', left: 0, width: `${orderPct}%`, height: '100%', background: 'linear-gradient(90deg,#f97316,#fbbf24)', borderRadius: 6, transition: 'width 0.3s' }} />
            <div style={{ position: 'absolute', left: `${Math.min(orderPct, 99)}%`, top: -4, width: 4, height: 20, background: '#f87171', borderRadius: 2, boxShadow: '0 0 8px #f87171' }} />
          </div>
        </div>
      )}

      {/* Maritime progress bar */}
      {sailingPct !== null && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, fontFamily: 'monospace', color: '#94a3b8', letterSpacing: 1 }}>
            <span>⚓ {formatDate(item.sailing_date)}</span>
            <span style={{ color: sailingPct >= 100 ? '#fb923c' : '#22d3ee', fontWeight: 700 }}>TRÁNSITO &nbsp;{Math.round(sailingPct)}%</span>
            <span>🏁 {formatDate(item.eta_port)}</span>
          </div>
          <div style={{ position: 'relative', height: 12, background: 'rgba(34,211,238,0.08)', borderRadius: 6, overflow: 'visible' }}>
            <div style={{ position: 'absolute', left: 0, width: `${sailingPct}%`, height: '100%', background: sailingPct >= 100 ? 'linear-gradient(90deg,#818cf8,#fb923c)' : 'linear-gradient(90deg,#818cf8,#22d3ee)', borderRadius: 6, transition: 'width 0.3s' }} />
            <div style={{ position: 'absolute', left: `${Math.min(sailingPct, 99)}%`, top: -4, width: 4, height: 20, background: '#f87171', borderRadius: 2, boxShadow: '0 0 8px #f87171' }} />
          </div>
        </div>
      )}

      {/* Product + ETA */}
      <div style={{ borderTop: '1px solid rgba(34,211,238,0.08)', paddingTop: 12, marginBottom: 12 }}>
        <DataRow label="Producto" value={item.main_product || '—'} />
        <DataRow label="ETA Puerto" value={formatDate(item.eta_port)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 16, color: '#475569', fontFamily: 'monospace', letterSpacing: 1 }}>ESTADO ETA</span>
          <span style={{ fontSize: 17, color: etaColor, fontFamily: 'monospace', fontWeight: 700 }}>{etaLabel}</span>
        </div>
        <DataRow label="Delivery posible" value={formatDate(item.possible_delivery_date)} />
      </div>

      {/* Counts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <MiniStat label="Pagos" value={item.payments?.length || 0} />
        <MiniStat label="Documentos" value={item.documents?.length || 0} />
      </div>

      {/* Próximos pagos */}
      {pendingForCard.length > 0 && (
        <div style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: 6, padding: '12px 14px', marginBottom: 12 }}>
          <span style={{ fontSize: 15, color: '#fbbf24', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'monospace', display: 'block', marginBottom: 10 }}>◈ Próximos pagos</span>
          {pendingForCard.map((p: any) => {
            const isUrgent = Math.ceil((new Date(p.due_date + 'T00:00:00').getTime() - new Date().getTime()) / 86400000) <= 7
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, fontSize: 17, marginBottom: 6, background: isUrgent ? 'rgba(248,113,113,0.06)' : 'transparent', borderRadius: 3, padding: '4px 6px' }}>
                <span style={{ color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.concept}</span>
                <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: 700, textAlign: 'right' }}>
                  {p.currency === 'USD' ? `U$S ${Number(p.amount||0).toLocaleString('es-AR')}` : `$ ${Number(p.amount||0).toLocaleString('es-AR')}`}
                </span>
                <span style={{ color: isUrgent ? '#f87171' : '#475569', fontFamily: 'monospace', textAlign: 'right' }}>{formatDate(p.due_date)}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Fabricación + ARCA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={styles.miniBlock}>
          <span style={styles.miniBlockTitle}>Fabricación</span>
          <DataRow label="Costo" value={money(item.manufacturer_cost, 'USD')} small />
          <DataRow label="Pagado" value={money(paidTotal, 'USD')} small accent="#4ade80" />
          <DataRow label="Pendiente" value={money(Number(item.manufacturer_cost||0)-paidTotal, 'USD')} small accent="#f87171" />
        </div>
        <div style={styles.miniBlock}>
          <span style={styles.miniBlockTitle}>ARCA</span>
          <DataRow label="Estimado" value={money(item.arca_estimated, 'ARS')} small />
          <DataRow label="Pago" value={formatDate(item.arca_payment_date)} small />
          <DataRow label="Estado" value={item.arca_status || 'Pendiente'} small />
        </div>
      </div>

      {/* Notes */}
      {item.notes && (
        <p style={{ fontSize: 17, color: '#475569', borderTop: '1px solid rgba(34,211,238,0.08)', paddingTop: 10, marginBottom: 12, fontStyle: 'italic' }}>{item.notes}</p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, borderTop: '1px solid rgba(34,211,238,0.08)', paddingTop: 14 }}>
        <a href={`/imports/${item.id}`} style={styles.actionBtn}>Editar</a>
        <a href={`/imports/${item.id}/documents`} style={styles.actionBtnDocs}>Documentos</a>
        <a href={`/payments?importId=${item.id}`} style={styles.actionBtnPayments}>Pagos</a>
      </div>
    </div>
  )
}

function DataRow({ label, value, small = false, accent }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
      <span style={{ fontSize: small ? 15 : 17, color: '#475569', fontFamily: 'monospace', letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: small ? 15 : 17, color: accent || '#94a3b8', fontFamily: 'monospace', fontWeight: accent ? 700 : 400 }}>{value}</span>
    </div>
  )
}

function MiniStat({ label, value }: any) {
  return (
    <div style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.1)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
      <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: '#22d3ee', display: 'block' }}>{value}</span>
      <span style={{ fontSize: 15, color: '#475569', textTransform: 'uppercase', letterSpacing: 2 }}>{label}</span>
    </div>
  )
}

function MonthlyPaymentsChart({ payments }: { payments: any[] }) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const pending = payments
    .filter(p => p.status !== 'Pagado' && p.due_date)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))

  const MONTH_NAMES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']

  if (pending.length === 0) {
    return <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Sin pagos pendientes</div>
  }

  // X axis: today → 6 months out
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 6, 0)
  const spanDays = (end.getTime() - start.getTime()) / 86400000

  const W = 420, PL = 40, PR = 12, PT = 62, PB = 36
  const chartW = W - PL - PR
  const USD_Y = PT + 44, ARS_Y = PT + 130
  const H = ARS_Y + 52 + PB

  const dateX = (d: string) => {
    const days = (new Date(d + 'T00:00:00').getTime() - start.getTime()) / 86400000
    return PL + Math.max(0, Math.min(1, days / spanDays)) * chartW
  }
  const todayX = dateX(todayStr)

  // Month tick positions
  const ticks: { x: number; label: string }[] = []
  for (let i = 0; i <= 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
    if (d <= end) ticks.push({ x: dateX(d.toISOString().split('T')[0]), label: MONTH_NAMES[d.getMonth()] })
  }

  const fmtUsd = (n: number) => `U$S ${Number(n).toLocaleString('es-AR')}`
  const fmtArs = (n: number) => `$ ${Number(n).toLocaleString('es-AR')}`

  // Stagger labels vertically to avoid overlap (alternate -18 / -30)
  const labelOffset = (_arr: any[], idx: number) => idx % 2 === 0 ? -18 : -38

  const usdPayments = pending.filter(p => p.currency === 'USD')
  const arsPayments = pending.filter(p => p.currency !== 'USD')

  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Month gridlines */}
        {ticks.map(({ x, label }, i) => (
          <g key={i}>
            <line x1={x} y1={PT} x2={x} y2={ARS_Y + 14} stroke="rgba(71,85,105,0.25)" strokeWidth={1} strokeDasharray="2,4" />
            <text x={x} y={H - 4} textAnchor="middle" fill="#334155" fontSize={18} fontFamily="monospace">{label}</text>
          </g>
        ))}

        {/* Today marker */}
        <line x1={todayX} y1={PT} x2={todayX} y2={ARS_Y + 14} stroke="rgba(248,113,113,0.45)" strokeWidth={1.5} />
        <text x={todayX} y={PT - 5} textAnchor="middle" fill="#f87171" fontSize={16} fontFamily="monospace">HOY</text>

        {/* USD track */}
        <text x={PL - 4} y={USD_Y + 6} textAnchor="end" fill="#22d3ee" fontSize={18} fontFamily="monospace" opacity={0.7}>USD</text>
        <line x1={PL} y1={USD_Y} x2={W - PR} y2={USD_Y} stroke="rgba(34,211,238,0.18)" strokeWidth={1.5} />
        {usdPayments.map((p, i) => {
          const x = dateX(p.due_date)
          const isOverdue = p.due_date < todayStr
          const color = isOverdue ? '#f87171' : '#22d3ee'
          return (
            <g key={p.id}>
              <circle cx={x} cy={USD_Y} r={8} fill={color} opacity={0.9} />
              <text x={x} y={USD_Y + labelOffset(usdPayments, i)} textAnchor="middle" fill={color} fontSize={17} fontFamily="monospace">{fmtUsd(p.amount)}</text>
            </g>
          )
        })}

        {/* ARS track */}
        <text x={PL - 4} y={ARS_Y + 6} textAnchor="end" fill="#fb923c" fontSize={18} fontFamily="monospace" opacity={0.7}>ARS</text>
        <line x1={PL} y1={ARS_Y} x2={W - PR} y2={ARS_Y} stroke="rgba(251,146,60,0.18)" strokeWidth={1.5} />
        {arsPayments.map((p, i) => {
          const x = dateX(p.due_date)
          const isOverdue = p.due_date < todayStr
          const color = isOverdue ? '#f87171' : '#fb923c'
          return (
            <g key={p.id}>
              <circle cx={x} cy={ARS_Y} r={8} fill={color} opacity={0.9} />
              <text x={x} y={ARS_Y + labelOffset(arsPayments, i)} textAnchor="middle" fill={color} fontSize={17} fontFamily="monospace">{fmtArs(p.amount)}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ─── STYLES ─────────────────────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#060d1a',
    backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.06) 0%, transparent 60%), linear-gradient(180deg, #060d1a 0%, #0a1628 100%)',
    padding: '0 32px 60px',
    color: '#e2e8f0',
  },
  loadingWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 16, height: '100vh',
  },
  loadingDot: {
    width: 8, height: 8, borderRadius: '50%', background: '#22d3ee',
    animation: 'pulse 1s ease-in-out infinite',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 0 20px',
    borderBottom: '1px solid rgba(34,211,238,0.1)',
    marginBottom: 20,
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logoAccent: { color: '#22d3ee', fontSize: 22 },
  logoText: {
    fontFamily: 'monospace', fontSize: 22, fontWeight: 700,
    color: '#e2e8f0', letterSpacing: 4,
  },
  logoBadge: {
    fontSize: 13, color: '#22d3ee', background: 'rgba(34,211,238,0.1)',
    border: '1px solid rgba(34,211,238,0.3)', borderRadius: 3,
    padding: '2px 6px', fontFamily: 'monospace', letterSpacing: 2,
  },
  nav: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  btnPrimary: {
    background: 'rgba(34,211,238,0.1)', color: '#22d3ee',
    border: '1px solid rgba(34,211,238,0.4)', borderRadius: 6,
    padding: '9px 20px', fontSize: 15, fontFamily: 'monospace',
    letterSpacing: 1, textDecoration: 'none', cursor: 'pointer',
  },
  btnGhost: {
    background: 'transparent', color: '#475569',
    border: '1px solid rgba(71,85,105,0.4)', borderRadius: 6,
    padding: '9px 18px', fontSize: 15, fontFamily: 'monospace',
    letterSpacing: 1, textDecoration: 'none', cursor: 'pointer',
  },
  kpiStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 10, marginBottom: 20,
  },
  kpiCard: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(34,211,238,0.12)',
    borderRadius: 8, padding: '16px 20px',
    backdropFilter: 'blur(12px)',
    display: 'flex', flexDirection: 'column' as const, gap: 2,
  },
  section: { marginBottom: 20 },
  finGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 10,
  },
  finCard: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(34,211,238,0.1)',
    borderRadius: 8, padding: '16px 18px',
    position: 'relative', overflow: 'hidden',
    backdropFilter: 'blur(8px)',
  },
  upcomingRow: {
    display: 'flex', alignItems: 'center', gap: 32,
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(34,211,238,0.08)',
    borderRadius: 6, padding: '12px 18px',
  },
  filterBar: {
    display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
  },
  searchWrap: {
    flex: 1, minWidth: 200, display: 'flex', alignItems: 'center',
    background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(34,211,238,0.1)',
    borderRadius: 6, padding: '0 14px',
  },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#94a3b8', fontFamily: 'monospace', fontSize: 16, padding: '12px 0',
    letterSpacing: 0.5,
  },
  select: {
    background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(34,211,238,0.1)',
    color: '#94a3b8', fontFamily: 'monospace', fontSize: 16,
    borderRadius: 6, padding: '12px 16px', outline: 'none', cursor: 'pointer',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
    gap: 16,
  },
  importCard: {
    background: 'rgba(10,22,40,0.9)',
    border: '1px solid rgba(34,211,238,0.1)',
    borderRadius: 10, padding: '22px',
    backdropFilter: 'blur(16px)',
    transition: 'border-color 0.2s',
  },
  miniBlock: {
    background: 'rgba(34,211,238,0.02)',
    border: '1px solid rgba(34,211,238,0.07)',
    borderRadius: 6, padding: '12px 14px',
  },
  miniBlockTitle: {
    fontSize: 15, color: '#22d3ee', letterSpacing: 3,
    textTransform: 'uppercase' as const, fontFamily: 'monospace',
    display: 'block' as const, marginBottom: 10,
  },
  actionBtn: {
    background: 'rgba(34,211,238,0.1)', color: '#22d3ee',
    border: '1px solid rgba(34,211,238,0.3)', borderRadius: 5,
    padding: '8px 16px', fontSize: 17, fontFamily: 'monospace',
    textDecoration: 'none', letterSpacing: 1,
  },
  actionBtnDocs: {
    background: 'rgba(167,139,250,0.1)', color: '#a78bfa',
    border: '1px solid rgba(167,139,250,0.3)', borderRadius: 5,
    padding: '8px 16px', fontSize: 17, fontFamily: 'monospace',
    textDecoration: 'none', letterSpacing: 1,
  },
  actionBtnPayments: {
    background: 'rgba(251,191,36,0.1)', color: '#fbbf24',
    border: '1px solid rgba(251,191,36,0.3)', borderRadius: 5,
    padding: '8px 16px', fontSize: 17, fontFamily: 'monospace',
    textDecoration: 'none', letterSpacing: 1,
  },
}