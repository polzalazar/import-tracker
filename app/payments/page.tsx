'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const S = {
  page: { minHeight: '100vh', background: '#060d1a', backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.06) 0%, transparent 60%)', padding: '0 32px 60px', color: '#e2e8f0', fontFamily: 'monospace' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 20px', borderBottom: '1px solid rgba(34,211,238,0.1)', marginBottom: 28 } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 700, color: '#e2e8f0', letterSpacing: 2, fontFamily: 'monospace' } as React.CSSProperties,
  card: { background: 'rgba(10,22,40,0.9)', border: '1px solid rgba(34,211,238,0.1)', borderRadius: 10, padding: '24px 28px', marginBottom: 16 } as React.CSSProperties,
  label: { display: 'block', fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 5, marginTop: 14 } as React.CSSProperties,
  input: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 6, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  select: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 6, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' } as React.CSSProperties,
  btnPrimary: { background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
  btnGhost: { background: 'transparent', color: '#475569', border: '1px solid rgba(71,85,105,0.4)', borderRadius: 6, padding: '10px 20px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, textDecoration: 'none', cursor: 'pointer', display: 'inline-block' } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } as React.CSSProperties,
  groupTitle: { fontSize: 12, color: '#22d3ee', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace' } as React.CSSProperties,
  divider: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(34,211,238,0.3), transparent)' } as React.CSSProperties,
}

function conceptColor(concept: string) {
  const map: Record<string, { color: string; bg: string }> = {
    'ANTICIPO FABRICANTE': { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    'SALDO FABRICANTE':    { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    'FLETE MARÍTIMO':      { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
    'ARCA':                { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
    'TERMINAL PORTUARIA':  { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
    'DESPACHANTE':         { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    'CAMIÓN':              { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  }
  return map[concept] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
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

  return (
    <main style={S.page}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } option { background: #0f172a; color: #94a3b8; } input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }`}</style>

      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#22d3ee', fontSize: 20 }}>▸</span>
          <span style={S.title}>PAGOS</span>
        </div>
        <a href="/" style={S.btnGhost}>← Volver</a>
      </header>

      {/* Nuevo pago */}
      <div style={{ maxWidth: 780 }}>
        <div style={S.card}>
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
                <input style={S.input} type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
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

        {/* Lista */}
        <div style={S.sectionTitle}>
          <span style={S.groupTitle}>◈ Historial</span>
          <div style={S.divider} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payments.map(p => {
            const cc = conceptColor(p.concept)
            const isPaid = p.status === 'Pagado'
            return (
              <div key={p.id} style={{ ...S.card, marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: cc.color, background: cc.bg, border: `1px solid ${cc.color}40`, borderRadius: 4, padding: '2px 10px', letterSpacing: 1 }}>{p.concept}</span>
                    <span style={{ fontSize: 13, color: '#475569', fontFamily: 'monospace' }}>{p.imports?.code}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 15, color: '#94a3b8' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{p.currency === 'USD' ? `U$S ${Number(p.amount||0).toLocaleString('es-AR')}` : `$ ${Number(p.amount||0).toLocaleString('es-AR')}`}</span>
                    <span>Vence: {p.due_date || '—'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: isPaid ? '#4ade80' : '#fbbf24', background: isPaid ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${isPaid ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`, borderRadius: 4, padding: '3px 10px' }}>{p.status}</span>
                  <a href={`/payments/${p.id}`} style={{ ...S.btnGhost, padding: '6px 14px', fontSize: 13 }}>Editar</a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
