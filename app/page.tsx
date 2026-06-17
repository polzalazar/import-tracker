'use client'

import { useEffect, useRef, useState } from 'react'
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
    'Pedido confirmado':    { color: '#64748b', bg: 'rgba(100,116,139,0.1)', dot: '#64748b' },
    'En fabricación':      { color: '#d97706', bg: 'rgba(217,119,6,0.1)',   dot: '#d97706' },
    'Listo para embarcar': { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', dot: '#7c3aed' },
    'Embarcado':           { color: '#4f46e5', bg: 'rgba(79,70,229,0.1)',   dot: '#4f46e5' },
    'En tránsito':         { color: '#0891b2', bg: 'rgba(8,145,178,0.1)',   dot: '#0891b2' },
    'Arribado':            { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  dot: '#f97316' },
    'En aduana':           { color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   dot: '#dc2626' },
    'Nacionalizado':       { color: '#0891b2', bg: 'rgba(8,145,178,0.1)',   dot: '#0891b2' },
    'En depósito':         { color: '#0d9488', bg: 'rgba(13,148,136,0.1)', dot: '#0d9488' },
    'Disponible':          { color: '#16a34a', bg: 'rgba(22,163,74,0.1)',   dot: '#16a34a' },
    'Cerrado':             { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', dot: '#94a3b8' },
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
  const [bnaRate, setBnaRate] = useState<{ venta: number; fecha: string } | null>(null)

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
    fetch('https://dolarapi.com/v1/dolares/oficial')
      .then(r => r.json())
      .then(d => setBnaRate({ venta: d.venta, fecha: d.fechaActualizacion?.slice(0, 10) || '' }))
      .catch(() => {})
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const total = data.length
  const active = data.filter(i => i.status !== 'Cerrado').length
  const nextDeliveries = data.filter(i => i.possible_delivery_date).length

  const arcaRate = bnaRate?.venta || 0

  // ARCA viene de imports.arca_usd (lo mismo que muestran las tarjetas)
  const arcaArs = arcaRate > 0
    ? data.filter(i => i.status !== 'Cerrado' && i.arca_usd).reduce((t, i) => t + Number(i.arca_usd || 0) * arcaRate, 0)
    : 0

  const usdPayments = payments.filter(p => p.currency === 'USD')
  const arsNativePayments = payments.filter(p => p.currency === 'ARS')

  const usdCommitted = usdPayments.reduce((t, p) => t + Number(p.amount || 0), 0)
  const usdPaid      = usdPayments.filter(p => p.status === 'Pagado').reduce((t, p) => t + Number(p.amount || 0), 0)
  const usdPending   = usdCommitted - usdPaid

  const arsPendingNative = arsNativePayments.filter(p => p.status !== 'Pagado').reduce((t, p) => t + Number(p.amount || 0), 0)
  const arsPending   = arcaArs + arsPendingNative

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
          <span style={{ color: '#0891b2', fontFamily: 'monospace', fontSize: 18, letterSpacing: 4 }}>CARGANDO SISTEMA</span>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page} className="itp-main">
      {/* HEADER */}
      <header style={styles.header} className="itp-header">
        <div style={styles.logoWrap}>
          <span style={styles.logoAccent}>▸</span>
          <span style={styles.logoText}>IMPORT TRACKER</span>
          <span style={styles.logoBadge}>v2</span>
        </div>
        <nav style={styles.nav}>
          <a href="/new-import" style={styles.btnPrimary}>+ Nueva importación</a>
          <a href="/documents" style={{ ...styles.btnGhost, color: '#7c3aed', borderColor: 'rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.06)' }}>Documentos</a>
          <a href="/payments" style={{ ...styles.btnGhost, color: '#d97706', borderColor: 'rgba(217,119,6,0.4)', background: 'rgba(217,119,6,0.06)' }}>Pagos</a>
          <button onClick={logout} style={{ ...styles.btnGhost, cursor: 'pointer', borderColor: 'rgba(220,38,38,0.4)', color: '#dc2626', background: 'rgba(220,38,38,0.06)' }}>
            Salir
          </button>
        </nav>
      </header>
      {bnaRate
        ? <div style={{ fontSize: 11, color: '#16a34a', fontFamily: 'monospace', marginBottom: 8, marginTop: -12 }}>TC BNA: $ {bnaRate.venta.toLocaleString('es-AR')} ({bnaRate.fecha})</div>
        : <div style={{ fontSize: 11, color: '#dc2626', fontFamily: 'monospace', marginBottom: 8, marginTop: -12 }}>TC BNA: no disponible — reintentando…</div>
      }

      {/* KPI STRIP */}
      <section style={styles.kpiStrip}>
        <KpiCard label="Total importaciones" value={total} accent="#0891b2" icon="▦" />
        <KpiCard label="Activas" value={active} accent="#16a34a" icon="◉" />
        <KpiCard label="Con delivery estimado" value={nextDeliveries} accent="#7c3aed" icon="◎" />
        <KpiCard
          label="Pagos vencidos"
          value={overduePayments}
          accent={overduePayments > 0 ? '#dc2626' : '#16a34a'}
          icon={overduePayments > 0 ? '⚠' : '✓'}
          alert={overduePayments > 0}
        />
      </section>

      {/* FINANCIAL SUMMARY */}
      <section style={styles.section}>
        <SectionTitle>Resumen financiero</SectionTitle>
        <div style={styles.finGrid}>
          <FinCard label="USD PAGADO"    amount={money(usdPaid, 'USD')}    accent="#16a34a" />
          <FinCard label="USD PENDIENTE" amount={money(usdPending, 'USD')} accent="#f97316" />
          <FinCard label="ARS PENDIENTE" amount={money(arsPending, 'ARS')} accent="#dc2626" />
        </div>
      </section>

      {/* UPCOMING PAYMENTS + MONTHLY CHART */}
      <section style={styles.section}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {upcomingPayments.length > 0 && (
            <div style={{ flex: '0 0 auto' }}>
              <SectionTitle>Próximos vencimientos</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcomingPayments.map((payment: any) => {
                  const importCode = data.find(i => i.id === payment.import_id)?.code || '—'
                  const isArca = payment.concept === 'ARCA'
                  const amount = isArca && arcaRate
                    ? money(Math.round(Number(payment.amount) * arcaRate), 'ARS')
                    : payment.currency === 'USD' ? money(payment.amount, 'USD') : money(payment.amount, 'ARS')
                  const amountColor = isArca || payment.currency === 'ARS' ? '#dc2626' : '#0891b2'
                  return (
                    <div key={payment.id} style={styles.upcomingRow} className="itp-upcoming-row">
                      <span className="itp-upcoming-date" style={{ color: '#d97706', fontFamily: 'monospace', fontSize: 18, fontWeight: 700, minWidth: 150, letterSpacing: 1 }}>
                        {new Date(payment.due_date + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                      </span>
                      <span className="itp-upcoming-code" style={{ color: '#0891b2', fontFamily: 'monospace', fontSize: 18, fontWeight: 700, minWidth: 110 }}>{importCode}</span>
                      <span className="itp-upcoming-concept" style={{ color: '#475569', fontFamily: 'monospace', fontSize: 18, flex: 1 }}>{payment.concept}</span>
                      <span className="itp-upcoming-amount" style={{ color: amountColor, fontFamily: 'monospace', fontSize: 18, fontWeight: 700 }}>{amount}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <div className="itp-chart-card" style={{ flex: '0 0 420px', minWidth: 300, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <SectionTitle>Pagos pendientes / mes</SectionTitle>
            <MonthlyPaymentsChart payments={payments} imports={data} bnaRate={bnaRate} />
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section style={styles.section}>
        <SectionTitle>Importaciones</SectionTitle>
        <div style={styles.filterBar}>
          <div style={styles.searchWrap}>
            <span style={{ color: '#94a3b8', fontSize: 17, marginRight: 8 }}>⌕</span>
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
      <div style={styles.cardsGrid} className="itp-cards-grid">
        {filteredData.map(item => <ImportCard key={item.id} item={item} today={today} bnaRate={bnaRate} />)}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
        input::placeholder { color: #94a3b8; }
        option { background: #ffffff; color: #0f172a; }

        @media (max-width: 640px) {
          .itp-main { padding-left: 12px !important; padding-right: 12px !important; }
          .itp-header { flex-wrap: wrap; gap: 10px; padding-bottom: 14px; }
          .itp-cards-grid { grid-template-columns: 1fr !important; }
          .itp-chart-card { flex: 1 1 100% !important; min-width: 0 !important; }
          .itp-upcoming-row { flex-wrap: wrap !important; gap: 4px 12px !important; padding: 10px 12px !important; }
          .itp-upcoming-date { font-size: 13px !important; min-width: 0 !important; width: 100%; }
          .itp-upcoming-code { font-size: 13px !important; min-width: 0 !important; }
          .itp-upcoming-concept { font-size: 13px !important; flex: unset !important; }
          .itp-upcoming-amount { font-size: 13px !important; margin-left: auto; }
        }
      `}</style>
    </main>
  )
}

/* ─── SUB-COMPONENTS ─────────────────────────────────────────────────────── */

function KpiCard({ label, value, accent, icon, alert = false }: any) {
  return (
    <div style={{
      ...styles.kpiCard,
      borderColor: alert ? 'rgba(220,38,38,0.4)' : '#e2e8f0',
      background: alert ? 'rgba(220,38,38,0.03)' : '#ffffff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: 2, fontFamily: 'monospace' }}>{label}</span>
        <span style={{ fontSize: 18, color: accent, opacity: 0.8 }}>{icon}</span>
      </div>
      <span style={{ fontSize: 42, fontWeight: 700, fontFamily: 'monospace', color: accent, letterSpacing: -1, lineHeight: 1 }}>{value}</span>
    </div>
  )
}

function FinCard({ label, amount, accent }: any) {
  return (
    <div style={styles.finCard}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8, display: 'block', fontFamily: 'monospace' }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'monospace', color: accent }}>{amount}</span>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />
    </div>
  )
}

function SectionTitle({ children }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <span style={{ color: '#0891b2', fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>◈ {children}</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(8,145,178,0.3), transparent)' }} />
    </div>
  )
}

function printCard(el: HTMLElement) {
  const clone = el.cloneNode(true) as HTMLElement
  clone.querySelectorAll('button').forEach(b => { if (b.textContent?.includes('Imprimir')) b.remove() })
  // expandir al ancho completo de la hoja
  clone.style.width = '100%'
  clone.style.maxWidth = 'none'
  clone.style.boxSizing = 'border-box'
  clone.style.boxShadow = 'none'
  clone.style.borderRadius = '4px'
  const overlay = document.createElement('div')
  overlay.id = '__print_overlay__'
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#fff;z-index:9999;padding:0;box-sizing:border-box;overflow:auto;'
  overlay.appendChild(clone)
  document.body.appendChild(overlay)
  document.body.classList.add('printing-card')
  const cleanup = () => {
    document.body.removeChild(overlay)
    document.body.classList.remove('printing-card')
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
}

function ImportCard({ item, today, bnaRate }: any) {
  const cardRef = useRef<HTMLDivElement>(null)
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

  const etaColor = etaDiff === null ? '#94a3b8'
    : etaDiff < 0 ? '#f97316'
    : etaDiff <= 7 ? '#dc2626'
    : '#0891b2'

  const st = statusConfig(item.status)

  const orderPct = (() => {
    if (!item.order_date || !item.possible_delivery_date) return null
    const start = new Date(item.order_date              + 'T00:00:00').getTime()
    const end   = new Date(item.possible_delivery_date  + 'T00:00:00').getTime()
    const now   = new Date().getTime()
    if (end <= start) return null
    return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100))
  })()

  const sailingPct = (() => {
    if (!item.sailing_date || !item.eta_port) return null
    const sail = new Date(item.sailing_date + 'T00:00:00').getTime()
    const eta  = new Date(item.eta_port   + 'T00:00:00').getTime()
    const now  = new Date().getTime()
    if (eta <= sail) return null
    return Math.max(0, Math.min(100, ((now - sail) / (eta - sail)) * 100))
  })()

  const semaphoreConfig = {
    alert: { color: '#dc2626', label: 'Acción requerida', char: '⚠' },
    warn:  { color: '#d97706', label: 'Próximo vencimiento', char: '◉' },
    ok:    { color: '#16a34a', label: 'Todo al día', char: '✓' },
  }[semaphore]

  const pendingForCard = itemPayments
    .filter((p: any) => p.status !== 'Pagado')
    .sort((a: any, b: any) => a.due_date?.localeCompare(b.due_date ?? '') ?? 0)
    .slice(0, 2)

  return (
    <div ref={cardRef} style={styles.importCard}>
      {/* Card header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: 1 }}>{item.code}</span>
          <div style={{ marginTop: 6 }}>
            <span style={{ fontSize: 13, color: semaphoreConfig.color, background: `${semaphoreConfig.color}12`, border: `1px solid ${semaphoreConfig.color}30`, borderRadius: 3, padding: '3px 10px', fontFamily: 'monospace', letterSpacing: 1 }}>
              {semaphoreConfig.char} {semaphoreConfig.label.toUpperCase()}
            </span>
          </div>
        </div>
        <span style={{ fontSize: 13, color: st.color, background: st.bg, border: `1px solid ${st.color}40`, borderRadius: 3, padding: '4px 12px', fontFamily: 'monospace', letterSpacing: 1, whiteSpace: 'nowrap' }}>
          {item.status}
        </span>
      </div>

      {/* Order progress bar */}
      {orderPct !== null && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontFamily: 'monospace', color: '#94a3b8', letterSpacing: 1 }}>
            <span>📋 {formatDate(item.order_date)}</span>
            <span style={{ color: orderPct >= 100 ? '#dc2626' : '#f97316', fontWeight: 700 }}>PRODUCCIÓN &nbsp;{Math.round(orderPct)}%</span>
            <span>📦 {formatDate(item.possible_delivery_date)}</span>
          </div>
          <div style={{ position: 'relative', height: 12, background: 'rgba(249,115,22,0.1)', borderRadius: 6, overflow: 'visible' }}>
            <div style={{ position: 'absolute', left: 0, width: `${orderPct}%`, height: '100%', background: 'linear-gradient(90deg,#f97316,#fbbf24)', borderRadius: 6, transition: 'width 0.3s' }} />
            <div style={{ position: 'absolute', left: `${Math.min(orderPct, 99)}%`, top: -4, width: 4, height: 20, background: '#dc2626', borderRadius: 2, boxShadow: '0 0 6px rgba(220,38,38,0.5)' }} />
          </div>
        </div>
      )}

      {/* Maritime progress bar */}
      {sailingPct !== null && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontFamily: 'monospace', color: '#94a3b8', letterSpacing: 1 }}>
            <span>⚓ {formatDate(item.sailing_date)}</span>
            <span style={{ color: sailingPct >= 100 ? '#f97316' : '#0891b2', fontWeight: 700 }}>TRÁNSITO &nbsp;{Math.round(sailingPct)}%</span>
            <span>🏁 {formatDate(item.eta_port)}</span>
          </div>
          <div style={{ position: 'relative', height: 12, background: 'rgba(8,145,178,0.1)', borderRadius: 6, overflow: 'visible' }}>
            <div style={{ position: 'absolute', left: 0, width: `${sailingPct}%`, height: '100%', background: sailingPct >= 100 ? 'linear-gradient(90deg,#6366f1,#f97316)' : 'linear-gradient(90deg,#6366f1,#06b6d4)', borderRadius: 6, transition: 'width 0.3s' }} />
            <div style={{ position: 'absolute', left: `${Math.min(sailingPct, 99)}%`, top: -4, width: 4, height: 20, background: '#dc2626', borderRadius: 2, boxShadow: '0 0 6px rgba(220,38,38,0.5)' }} />
          </div>
        </div>
      )}

      {/* Product + ETA */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginBottom: 12 }}>
        <DataRow label="Producto" value={item.main_product || '—'} />
        <DataRow label="ETA Puerto" value={formatDate(item.eta_port)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'monospace', letterSpacing: 1 }}>ESTADO ETA</span>
          <span style={{ fontSize: 15, color: etaColor, fontFamily: 'monospace', fontWeight: 700 }}>{etaLabel}</span>
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
        <div style={{ background: 'rgba(217,119,6,0.04)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: 6, padding: '12px 14px', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#d97706', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'monospace', display: 'block', marginBottom: 10 }}>◈ Próximos pagos</span>
          {pendingForCard.map((p: any) => {
            const isUrgent = Math.ceil((new Date(p.due_date + 'T00:00:00').getTime() - new Date().getTime()) / 86400000) <= 7
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, fontSize: 15, marginBottom: 6, background: isUrgent ? 'rgba(220,38,38,0.04)' : 'transparent', borderRadius: 3, padding: '4px 6px' }}>
                <span style={{ color: '#475569', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.concept}</span>
                <span style={{ color: '#d97706', fontFamily: 'monospace', fontWeight: 700, textAlign: 'right' }}>
                  {p.currency === 'USD' ? `U$S ${Number(p.amount||0).toLocaleString('es-AR')}` : `$ ${Number(p.amount||0).toLocaleString('es-AR')}`}
                </span>
                <span style={{ color: isUrgent ? '#dc2626' : '#94a3b8', fontFamily: 'monospace', textAlign: 'right' }}>{formatDate(p.due_date)}</span>
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
          <DataRow label="Pagado" value={money(paidTotal, 'USD')} small accent="#16a34a" />
          <DataRow label="Pendiente" value={money(Number(item.manufacturer_cost||0)-paidTotal, 'USD')} small accent="#dc2626" />
        </div>
        <div style={styles.miniBlock}>
          <span style={styles.miniBlockTitle}>ARCA</span>
          {item.arca_usd ? (
            <>
              <DataRow label="USD" value={`U$S ${Number(item.arca_usd).toLocaleString('es-AR')}`} small />
              {bnaRate ? (
                <>
                  <DataRow label="ARS est." value={`$ ${Math.round(Number(item.arca_usd) * bnaRate.venta).toLocaleString('es-AR')}`} small accent="#f97316" />
                  <DataRow label="TC BNA" value={`$ ${bnaRate.venta.toLocaleString('es-AR')}`} small />
                </>
              ) : (
                <DataRow label="ARS est." value="..." small />
              )}
            </>
          ) : (
            <DataRow label="Estimado" value={money(item.arca_estimated, 'ARS')} small />
          )}
          <DataRow label="Pago" value={formatDate(item.arca_payment_date)} small />
          <DataRow label="Estado" value={item.arca_status || 'Pendiente'} small />
        </div>
      </div>

      {/* Notes */}
      {item.notes && (
        <p style={{ fontSize: 15, color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 10, marginBottom: 12, fontStyle: 'italic' }}>{item.notes}</p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
        <a href={`/imports/${item.id}`} style={styles.actionBtn}>Editar</a>
        <a href={`/imports/${item.id}/documents`} style={styles.actionBtnDocs}>Documentos</a>
        <a href={`/payments?importId=${item.id}`} style={styles.actionBtnPayments}>Pagos</a>
        <button onClick={() => cardRef.current && printCard(cardRef.current)} style={{ flex: 1, background: 'rgba(100,116,139,0.08)', color: '#64748b', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 6, padding: '8px 10px', fontFamily: 'monospace', fontSize: 13, letterSpacing: 1, textDecoration: 'none', textAlign: 'center', cursor: 'pointer' }}>Imprimir</button>
      </div>
    </div>
  )
}

function DataRow({ label, value, small = false, accent }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
      <span style={{ fontSize: small ? 13 : 15, color: '#94a3b8', fontFamily: 'monospace', letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: small ? 13 : 15, color: accent || '#475569', fontFamily: 'monospace', fontWeight: accent ? 700 : 400 }}>{value}</span>
    </div>
  )
}

function MiniStat({ label, value }: any) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
      <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: '#0891b2', display: 'block' }}>{value}</span>
      <span style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'monospace' }}>{label}</span>
    </div>
  )
}

function MonthlyPaymentsChart({ payments, imports, bnaRate }: { payments: any[], imports: any[], bnaRate: { venta: number; fecha: string } | null }) {
  const today = new Date()
  const MONTH_NAMES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']

  const pending = payments.filter(p => p.status !== 'Pagado' && p.due_date)

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
    return { label: MONTH_NAMES[d.getMonth()], key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
  })

  const usdByMonth: Record<string, number> = {}
  const arsByMonth: Record<string, number> = {}
  months.forEach(m => { usdByMonth[m.key] = 0; arsByMonth[m.key] = 0 })

  // Pagos USD/ARS de la tabla payments
  pending.forEach(p => {
    const key = p.due_date.slice(0, 7)
    if (key in usdByMonth) {
      if (p.currency === 'USD') usdByMonth[key] += Number(p.amount || 0)
      else arsByMonth[key] += Number(p.amount || 0)
    }
  })

  // ARCA de imports.arca_usd, usando eta_port como mes de referencia
  if (bnaRate) {
    imports.filter(i => i.status !== 'Cerrado' && i.arca_usd && i.eta_port).forEach(i => {
      const key = i.eta_port.slice(0, 7)
      if (key in arsByMonth) arsByMonth[key] += Number(i.arca_usd) * bnaRate.venta
    })
  }

  const maxUsd = Math.max(...Object.values(usdByMonth), 1)
  const maxArs = Math.max(...Object.values(arsByMonth), 1)

  const W = 420, PL = 46, PR = 8, PT = 16, PB = 24
  const TRACK_H = 88, GAP = 18
  const USD_TOP = PT, ARS_TOP = PT + TRACK_H + GAP
  const H = ARS_TOP + TRACK_H + PB
  const STEP = (W - PL - PR) / 6
  const BAR_W = Math.floor(STEP * 0.52)
  const todayKey = months[0].key

  const barX = (i: number) => PL + i * STEP + (STEP - BAR_W) / 2

  const fmtUsd = (n: number) => n >= 1000000 ? `U$S ${(n/1000000).toFixed(1)}M` : `U$S ${n.toLocaleString('es-AR')}`
  const fmtArs = (n: number) => n >= 1000000 ? `$ ${(n/1000000).toFixed(1)}M` : `$ ${n.toLocaleString('es-AR')}`

  if (pending.length === 0) {
    return <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Sin pagos pendientes</div>
  }

  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* current month column highlight */}
        <rect x={PL} y={USD_TOP} width={STEP} height={TRACK_H * 2 + GAP} fill="rgba(8,145,178,0.04)" rx={2} />

        {/* USD track */}
        <text x={PL - 4} y={USD_TOP + TRACK_H / 2 + 5} textAnchor="end" fill="#0891b2" fontSize={14} fontFamily="monospace" opacity={0.8}>USD</text>
        <line x1={PL} y1={USD_TOP + TRACK_H} x2={W - PR} y2={USD_TOP + TRACK_H} stroke="#e2e8f0" strokeWidth={1} />
        {months.map((m, i) => {
          const val = usdByMonth[m.key]
          if (!val) return null
          const h = Math.max(5, (val / maxUsd) * TRACK_H * 0.82)
          const x = barX(i)
          const y = USD_TOP + TRACK_H - h
          const isOverdue = m.key < todayKey
          const color = isOverdue ? '#ef4444' : '#0891b2'
          return (
            <g key={m.key}>
              <rect x={x} y={y} width={BAR_W} height={h} fill={`${color}20`} rx={2} />
              <rect x={x} y={y} width={BAR_W} height={2} fill={color} rx={1} />
              <text x={x + BAR_W / 2} y={y - 5} textAnchor="middle" fill={color} fontSize={12} fontFamily="monospace">{fmtUsd(val)}</text>
            </g>
          )
        })}

        {/* ARS track */}
        <text x={PL - 4} y={ARS_TOP + TRACK_H / 2 + 5} textAnchor="end" fill="#f97316" fontSize={14} fontFamily="monospace" opacity={0.8}>ARS</text>
        <line x1={PL} y1={ARS_TOP + TRACK_H} x2={W - PR} y2={ARS_TOP + TRACK_H} stroke="#e2e8f0" strokeWidth={1} />
        {months.map((m, i) => {
          const val = arsByMonth[m.key]
          if (!val) return null
          const h = Math.max(5, (val / maxArs) * TRACK_H * 0.82)
          const x = barX(i)
          const y = ARS_TOP + TRACK_H - h
          const isOverdue = m.key < todayKey
          const color = isOverdue ? '#ef4444' : '#f97316'
          return (
            <g key={m.key}>
              <rect x={x} y={y} width={BAR_W} height={h} fill={`${color}20`} rx={2} />
              <rect x={x} y={y} width={BAR_W} height={2} fill={color} rx={1} />
              <text x={x + BAR_W / 2} y={y - 5} textAnchor="middle" fill={color} fontSize={12} fontFamily="monospace">{fmtArs(val)}</text>
            </g>
          )
        })}

        {/* Month labels */}
        {months.map((m, i) => (
          <text key={m.key} x={PL + i * STEP + STEP / 2} y={H - 4} textAnchor="middle" fill={m.key === todayKey ? '#0891b2' : '#cbd5e1'} fontSize={14} fontFamily="monospace">{m.label}</text>
        ))}
      </svg>
    </div>
  )
}

/* ─── STYLES ─────────────────────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f0f4f8',
    padding: '0 32px 60px',
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  loadingWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 16, height: '100vh',
  },
  loadingDot: {
    width: 8, height: 8, borderRadius: '50%', background: '#0891b2',
    animation: 'pulse 1s ease-in-out infinite',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 0 20px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: 20,
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logoAccent: { color: '#0891b2', fontSize: 22 },
  logoText: {
    fontFamily: 'monospace', fontSize: 22, fontWeight: 700,
    color: '#0f172a', letterSpacing: 4,
  },
  logoBadge: {
    fontSize: 13, color: '#0891b2', background: 'rgba(8,145,178,0.1)',
    border: '1px solid rgba(8,145,178,0.3)', borderRadius: 3,
    padding: '2px 6px', fontFamily: 'monospace', letterSpacing: 2,
  },
  nav: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  btnPrimary: {
    background: '#0891b2', color: '#ffffff',
    border: '1px solid #0891b2', borderRadius: 6,
    padding: '9px 20px', fontSize: 15, fontFamily: 'monospace',
    letterSpacing: 1, textDecoration: 'none', cursor: 'pointer',
  },
  btnGhost: {
    background: '#ffffff', color: '#475569',
    border: '1px solid #e2e8f0', borderRadius: 6,
    padding: '9px 18px', fontSize: 15, fontFamily: 'monospace',
    letterSpacing: 1, textDecoration: 'none', cursor: 'pointer',
  },
  kpiStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12, marginBottom: 20,
  },
  kpiCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10, padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column' as const, gap: 2,
  },
  section: { marginBottom: 20 },
  finGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12,
  },
  finCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10, padding: '16px 18px',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  upcomingRow: {
    display: 'flex', alignItems: 'center', gap: 32,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '12px 18px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  filterBar: {
    display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
  },
  searchWrap: {
    flex: 1, minWidth: 200, display: 'flex', alignItems: 'center',
    background: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '0 14px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#0f172a', fontFamily: 'monospace', fontSize: 16, padding: '10px 0',
  },
  select: {
    background: '#ffffff', border: '1px solid #e2e8f0',
    color: '#475569', fontFamily: 'monospace', fontSize: 15,
    borderRadius: 6, padding: '10px 14px', outline: 'none', cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
    gap: 16,
  },
  importCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  },
  miniBlock: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '12px 14px',
  },
  miniBlockTitle: {
    fontSize: 12, color: '#94a3b8', letterSpacing: 3,
    textTransform: 'uppercase' as const, fontFamily: 'monospace',
    display: 'block' as const, marginBottom: 8,
  },
  actionBtn: {
    flex: 1, background: 'rgba(8,145,178,0.08)', color: '#0891b2',
    border: '1px solid rgba(8,145,178,0.3)', borderRadius: 6,
    padding: '8px 0', fontSize: 14, fontFamily: 'monospace',
    letterSpacing: 1, textDecoration: 'none', textAlign: 'center' as const,
    cursor: 'pointer',
  },
  actionBtnDocs: {
    flex: 1, background: 'rgba(124,58,237,0.08)', color: '#7c3aed',
    border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6,
    padding: '8px 0', fontSize: 14, fontFamily: 'monospace',
    letterSpacing: 1, textDecoration: 'none', textAlign: 'center' as const,
    cursor: 'pointer',
  },
  actionBtnPayments: {
    flex: 1, background: 'rgba(217,119,6,0.08)', color: '#d97706',
    border: '1px solid rgba(217,119,6,0.3)', borderRadius: 6,
    padding: '8px 0', fontSize: 14, fontFamily: 'monospace',
    letterSpacing: 1, textDecoration: 'none', textAlign: 'center' as const,
    cursor: 'pointer',
  },
}
