'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const S = {
  page: { minHeight: '100vh', background: '#060d1a', backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.06) 0%, transparent 60%)', padding: '0 32px 60px', color: '#e2e8f0', fontFamily: 'monospace' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 20px', borderBottom: '1px solid rgba(34,211,238,0.1)', marginBottom: 28 } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 700, color: '#e2e8f0', letterSpacing: 2, fontFamily: 'monospace' } as React.CSSProperties,
  card: { background: 'rgba(10,22,40,0.9)', border: '1px solid rgba(34,211,238,0.1)', borderRadius: 10, padding: '24px 28px', marginBottom: 24 } as React.CSSProperties,
  label: { display: 'block', fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 5, marginTop: 14 } as React.CSSProperties,
  input: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 6, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  select: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 6, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' } as React.CSSProperties,
  btnPrimary: { background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
  btnGhost: { background: 'transparent', color: '#475569', border: '1px solid rgba(71,85,105,0.4)', borderRadius: 6, padding: '10px 20px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, textDecoration: 'none', cursor: 'pointer', display: 'inline-block' } as React.CSSProperties,
  btnDanger: { background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } as React.CSSProperties,
  groupTitle: { fontSize: 12, color: '#22d3ee', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace' } as React.CSSProperties,
  divider: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(34,211,238,0.3), transparent)' } as React.CSSProperties,
}

export default function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('Pendiente')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    async function loadPayment() {
      const { data, error } = await supabase.from('payments').select('*').eq('id', id).single()
      if (error) { alert(error.message); return }
      setConcept(data.concept || '')
      setAmount(data.amount || '')
      setCurrency(data.currency || 'USD')
      setStatus(data.status || 'Pendiente')
      setDueDate(data.due_date || '')
    }
    loadPayment()
  }, [id])

  async function deletePayment() {
    if (!confirm('¿Eliminar este pago?')) return
    const { error } = await supabase.from('payments').delete().eq('id', id)
    if (error) { alert(error.message); return }
    window.location.href = '/payments'
  }

  async function updatePayment(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('payments').update({ concept, amount, currency, status, due_date: dueDate }).eq('id', id)
    if (error) { alert(error.message); return }
    window.location.href = '/payments'
  }

  return (
    <main style={S.page}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } option { background: #0f172a; color: #94a3b8; } input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }`}</style>

      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#22d3ee', fontSize: 20 }}>▸</span>
          <span style={S.title}>EDITAR PAGO</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/payments" style={S.btnGhost}>← Volver</a>
          <button type="button" onClick={deletePayment} style={S.btnDanger}>Eliminar</button>
        </div>
      </header>

      <div style={{ maxWidth: 520 }}>
        <form onSubmit={updatePayment}>
          <div style={S.card}>
            <div style={S.sectionTitle}>
              <span style={S.groupTitle}>◈ Datos del pago</span>
              <div style={S.divider} />
            </div>

            <label style={S.label}>Concepto</label>
            <select style={S.select} value={concept} onChange={e => {
              const v = e.target.value; setConcept(v)
              setCurrency(v === 'ARCA' ? 'ARS' : 'USD')
            }}>
              <option value="">Seleccionar concepto</option>
              <option>ANTICIPO FABRICANTE</option>
              <option>SALDO FABRICANTE</option>
              <option>FLETE MARÍTIMO</option>
              <option>ARCA</option>
              <option>TERMINAL PORTUARIA</option>
              <option>DESPACHANTE</option>
              <option>CAMIÓN</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={S.label}>Monto</label>
                <input style={S.input} value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Moneda</label>
                <select style={S.select} value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option>USD</option>
                  <option>ARS</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Estado</label>
                <select style={S.select} value={status} onChange={e => setStatus(e.target.value)}>
                  <option>Pendiente</option>
                  <option>Pagado</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Fecha de vencimiento</label>
                <input type="date" style={S.input} value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={S.btnPrimary}>Guardar cambios</button>
            <a href="/payments" style={S.btnGhost}>Cancelar</a>
          </div>
        </form>
      </div>
    </main>
  )
}
