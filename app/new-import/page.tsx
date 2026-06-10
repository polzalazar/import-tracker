'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const S = {
  page: { minHeight: '100vh', background: '#f0f4f8', padding: '0 32px 60px', color: '#0f172a', fontFamily: 'monospace' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 28 } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: 2, fontFamily: 'monospace' } as React.CSSProperties,
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '24px 28px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as React.CSSProperties,
  label: { display: 'block', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 5, marginTop: 14 } as React.CSSProperties,
  input: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, color: '#0f172a', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  select: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, color: '#0f172a', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' } as React.CSSProperties,
  textarea: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, color: '#0f172a', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 90 } as React.CSSProperties,
  btnPrimary: { background: '#0891b2', color: '#ffffff', border: '1px solid #0891b2', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
  btnGhost: { background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 20px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, textDecoration: 'none', cursor: 'pointer', display: 'inline-block' } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } as React.CSSProperties,
  groupTitle: { fontSize: 12, color: '#0891b2', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace' } as React.CSSProperties,
  divider: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(8,145,178,0.3), transparent)' } as React.CSSProperties,
}

export default function NewImportPage() {
  const [code, setCode] = useState('')
  const [mainProduct, setMainProduct] = useState('')
  const [status, setStatus] = useState('Pedido confirmado')
  const [orderDate, setOrderDate] = useState('')
  const [sailingDate, setSailingDate] = useState('')
  const [etaPort, setEtaPort] = useState('')
  const [possibleDeliveryDate, setPossibleDeliveryDate] = useState('')
  const [risk, setRisk] = useState('Medio')
  const [notes, setNotes] = useState('')
  const [arcaUsd, setArcaUsd] = useState('')
  const [bnaRate, setBnaRate] = useState<{ venta: number; fecha: string } | null>(null)

  useEffect(() => {
    fetch('https://dolarapi.com/v1/dolares/oficial')
      .then(r => r.json())
      .then(d => setBnaRate({ venta: d.venta, fecha: d.fechaActualizacion?.slice(0, 10) || '' }))
      .catch(() => {})
  }, [])

  async function saveImport(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('imports').insert({
      code, main_product: mainProduct, status,
      order_date: orderDate || null,
      sailing_date: sailingDate || null,
      eta_port: etaPort || null,
      possible_delivery_date: possibleDeliveryDate || null,
      risk, notes,
      arca_usd: arcaUsd || null,
    })
    if (error) { alert('Error: ' + error.message); return }
    window.location.href = '/'
  }

  return (
    <main style={S.page}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } option { background: #ffffff; color: #0f172a; } input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; } textarea::placeholder { color: #94a3b8; } input::placeholder { color: #94a3b8; }`}</style>

      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#0891b2', fontSize: 20 }}>▸</span>
          <span style={S.title}>NUEVA IMPORTACIÓN</span>
        </div>
        <a href="/" style={S.btnGhost}>← Volver</a>
      </header>

      <div style={{ maxWidth: 680 }}>
        <form onSubmit={saveImport}>
          <div style={S.card}>
            <div style={S.sectionTitle}>
              <span style={S.groupTitle}>◈ Identificación</span>
              <div style={S.divider} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={S.label}>Código</label>
                <input style={S.input} placeholder="ej: IMP-003" value={code} onChange={e => setCode(e.target.value)} required />
              </div>
              <div>
                <label style={S.label}>Estado</label>
                <select style={S.select} value={status} onChange={e => setStatus(e.target.value)}>
                  <option>Pedido confirmado</option>
                  <option>En fabricación</option>
                  <option>Listo para embarcar</option>
                  <option>Embarcado</option>
                  <option>En tránsito</option>
                  <option>Arribado</option>
                  <option>En aduana</option>
                  <option>Nacionalizado</option>
                  <option>En depósito</option>
                  <option>Disponible</option>
                  <option>Cerrado</option>
                </select>
              </div>
            </div>
            <label style={S.label}>Producto principal</label>
            <input style={S.input} placeholder="ej: Calzado deportivo" value={mainProduct} onChange={e => setMainProduct(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={S.label}>Riesgo</label>
                <select style={S.select} value={risk} onChange={e => setRisk(e.target.value)}>
                  <option>Bajo</option>
                  <option>Medio</option>
                  <option>Alto</option>
                </select>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>
              <span style={S.groupTitle}>◈ Fechas</span>
              <div style={S.divider} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={S.label}>Fecha pago orden de compra</label>
                <input type="date" style={S.input} value={orderDate} onChange={e => setOrderDate(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Delivery posible</label>
                <input type="date" style={S.input} value={possibleDeliveryDate} onChange={e => setPossibleDeliveryDate(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Fecha de zarpe</label>
                <input type="date" style={S.input} value={sailingDate} onChange={e => setSailingDate(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>ETA Puerto</label>
                <input type="date" style={S.input} value={etaPort} onChange={e => setEtaPort(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>
              <span style={S.groupTitle}>◈ ARCA</span>
              <div style={S.divider} />
            </div>
            <label style={S.label}>Monto (USD)</label>
            <input style={S.input} type="number" step="0.01" min="0" placeholder="0.00"
              value={arcaUsd} onChange={e => setArcaUsd(e.target.value)} />
            {arcaUsd && bnaRate && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
                ≈ $ {Math.round(Number(arcaUsd) * bnaRate.venta).toLocaleString('es-AR')} · TC BNA: ${bnaRate.venta.toLocaleString('es-AR')} ({bnaRate.fecha})
              </div>
            )}
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>
              <span style={S.groupTitle}>◈ Observaciones</span>
              <div style={S.divider} />
            </div>
            <textarea style={S.textarea} placeholder="Notas adicionales..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={S.btnPrimary}>Guardar importación</button>
            <a href="/" style={S.btnGhost}>Cancelar</a>
          </div>
        </form>
      </div>
    </main>
  )
}
