'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const S = {
  page: { minHeight: '100vh', background: '#f0f4f8', padding: '0 32px 60px', color: '#0f172a', fontFamily: 'monospace' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 28 } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: 2, fontFamily: 'monospace' } as React.CSSProperties,
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '24px 28px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as React.CSSProperties,
  label: { display: 'block', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 5, marginTop: 14 } as React.CSSProperties,
  input: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, color: '#0f172a', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  select: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, color: '#0f172a', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' } as React.CSSProperties,
  btnPrimary: { background: '#0891b2', color: '#ffffff', border: '1px solid #0891b2', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
  btnGhost: { background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 20px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, textDecoration: 'none', cursor: 'pointer', display: 'inline-block' } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } as React.CSSProperties,
  groupTitle: { fontSize: 12, color: '#0891b2', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace' } as React.CSSProperties,
  divider: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(8,145,178,0.3), transparent)' } as React.CSSProperties,
}

const MONTHS = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
function formatDate(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${Number(day)} ${MONTHS[Number(m) - 1]} ${y}`
}

function conceptColor(concept: string) {
  const map: Record<string, { color: string; bg: string }> = {
    'ANTICIPO FABRICANTE': { color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    'SALDO FABRICANTE':    { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    'FLETE MARÍTIMO':      { color: '#0891b2', bg: 'rgba(8,145,178,0.1)' },
    'ARCA':                { color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    'TERMINAL PORTUARIA':  { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
    'DESPACHANTE':         { color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
    'CAMIÓN':              { color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  }
  return map[concept] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)' }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [imports, setImports] = useState<any[]>([])
  const [importId, setImportId] = useState('')
  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('Pendiente')
  const [historyFilter, setHistoryFilter] = useState<'Todos' | 'Pendiente' | 'Pagado'>('Todos')

  useEffect(() => {
    const importIdFromUrl = new URLSearchParams(window.location.search).get('importId')
    if (importIdFromUrl) setImportId(importIdFromUrl)
    loadData()
  }, [])

  async function loadData() {
    const importIdFromUrl = new URLSearchParams(window.location.search).get('importId')
    let q = supabase.from('payments').select('*, imports (code)').order('created_at', { ascending: false })
    if (importIdFromUrl) q = q.eq('import_id', importIdFromUrl)
    const { data: paymentsData } = await q
    const { data: importsData } = await supabase.from('imports').select('*')
    setPayments(paymentsData || [])
    setImports(importsData || [])
  }

  async function createPayment(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('payments').insert({ import_id: importId, concept, amount: Number(amount), currency, due_date: dueDate || null, status })
    if (error) { alert(error.message); return }
    setConcept(''); setAmount(''); setCurrency('USD'); setDueDate(''); setStatus('Pendiente')
    loadData()
  }

  const filteredPayments = payments
    .filter(p => historyFilter === 'Todos' || p.status === historyFilter)
    .sort((a, b) => {
      if (historyFilter === 'Todos') return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date.localeCompare(b.due_date)
    })

  const filterBtn = (label: 'Todos' | 'Pendiente' | 'Pagado', color: string) => ({
    background: historyFilter === label ? color : '#ffffff',
    color: historyFilter === label ? '#ffffff' : color,
    border: `1px solid ${color}`,
    borderRadius: 6, padding: '6px 16px', fontSize: 13,
    fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer',
  } as React.CSSProperties)

  return (
    <main style={S.page}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        option { background: #ffffff; color: #0f172a; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; }
          .print-header { display: block !important; margin-bottom: 16px; font-family: monospace; font-size: 14px; color: #0f172a; }
        }
        .print-header { display: none; }
      `}</style>

      <header style={S.header} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#d97706', fontSize: 20 }}>▸</span>
          <span style={S.title}>PAGOS</span>
        </div>
        <a href="/" style={S.btnGhost}>← Volver</a>
      </header>

      <div style={{ maxWidth: 780 }}>
        {/* Nuevo pago - oculto al imprimir */}
        <div style={S.card} className="no-print">
          <div style={S.sectionTitle}>
            <span style={S.groupTitle}>◈ Nuevo pago</span>
            <div style={S.divider} />
          </div>
          <form onSubmit={createPayment}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={S.label}>Importación</label>
                <select style={S.select} value={importId} onChange={e => setImportId(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {imports.map(i => <option key={i.id} value={i.id}>{i.code}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Concepto</label>
                <select style={S.select} value={concept} onChange={e => {
                  const v = e.target.value; setConcept(v)
                  setCurrency(v === 'ARCA' ? 'ARS' : 'USD')
                }}>
                  <option value="">Seleccionar concepto</option>
                  <option>ANTICIPO FABRICANTE</option>
                  <option>SALDO FABRICANTE</option>
                  <option>FLETE MARÍTIMO</option>
                  <option>DESPACHANTE</option>
                  <option>CAMIÓN</option>
                  <option>ARCA</option>
                  <option>TERMINAL PORTUARIA</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Monto</label>
                <input style={S.input} type="number" step="0.01" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Moneda</label>
                <select style={S.select} value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option>USD</option>
                  <option>ARS</option>
                  <option>EUR</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Fecha de vencimiento</label>
                <input type="date" style={S.input} value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Estado</label>
                <select style={S.select} value={status} onChange={e => setStatus(e.target.value)}>
                  <option>Pendiente</option>
                  <option>Pagado</option>
                  <option>Vencido</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <button type="submit" style={S.btnPrimary}>Guardar pago</button>
            </div>
          </form>
        </div>

        {/* Historial */}
        <div style={{ ...S.sectionTitle, justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={S.groupTitle}>◈ Historial ({filteredPayments.length})</span>
            <div style={S.divider} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="no-print">
            <button style={filterBtn('Todos', '#475569')} onClick={() => setHistoryFilter('Todos')}>Todos</button>
            <button style={filterBtn('Pendiente', '#d97706')} onClick={() => setHistoryFilter('Pendiente')}>Pendiente</button>
            <button style={filterBtn('Pagado', '#16a34a')} onClick={() => setHistoryFilter('Pagado')}>Pagado</button>
            <button
              style={{ ...S.btnGhost, padding: '6px 16px', fontSize: 13, marginLeft: 8 }}
              onClick={() => window.print()}
            >🖨 Imprimir</button>
          </div>
        </div>

        {/* Encabezado para impresión */}
        <div className="print-header">
          <strong>IMPORT TRACKER — HISTORIAL DE PAGOS</strong>
          {historyFilter !== 'Todos' && <span> · Filtro: {historyFilter}</span>}
          <span style={{ float: 'right' }}>{new Date().toLocaleDateString('es-AR')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredPayments.map(p => {
            const cc = conceptColor(p.concept)
            const isPaid = p.status === 'Pagado'
            return (
              <div key={p.id} style={{ ...S.card, marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: cc.color, background: cc.bg, border: `1px solid ${cc.color}40`, borderRadius: 4, padding: '2px 10px', letterSpacing: 1, fontFamily: 'monospace' }}>{p.concept}</span>
                    <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>{p.imports?.code}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 15, color: '#94a3b8' }}>
                    <span style={{ color: '#0f172a', fontWeight: 700, fontFamily: 'monospace' }}>{p.currency === 'USD' ? `U$S ${Number(p.amount||0).toLocaleString('es-AR')}` : `$ ${Number(p.amount||0).toLocaleString('es-AR')}`}</span>
                    <span style={{ fontFamily: 'monospace' }}>Vence: {formatDate(p.due_date)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: isPaid ? '#16a34a' : '#d97706', background: isPaid ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)', border: `1px solid ${isPaid ? 'rgba(22,163,74,0.3)' : 'rgba(217,119,6,0.3)'}`, borderRadius: 4, padding: '3px 10px', fontFamily: 'monospace' }}>{p.status}</span>
                  <a href={`/payments/${p.id}`} style={{ ...S.btnGhost, padding: '6px 14px', fontSize: 13 }} className="no-print">Editar</a>
                </div>
              </div>
            )
          })}
          {filteredPayments.length === 0 && (
            <div style={{ ...S.card, color: '#94a3b8', textAlign: 'center', padding: '32px', marginBottom: 0 }}>
              No hay pagos {historyFilter !== 'Todos' ? `con estado "${historyFilter}"` : ''}.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
