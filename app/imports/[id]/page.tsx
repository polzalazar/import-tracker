'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const S = {
  page: { minHeight: '100vh', background: '#f0f4f8', padding: '0 32px 60px', color: '#0f172a', fontFamily: 'monospace' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 28 } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: 2, fontFamily: 'monospace' } as React.CSSProperties,
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '24px 28px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as React.CSSProperties,
  label: { display: 'block', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 5, marginTop: 14 } as React.CSSProperties,
  input: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, color: '#0f172a', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  select: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, color: '#0f172a', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' } as React.CSSProperties,
  textarea: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, color: '#0f172a', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', minHeight: 80, resize: 'vertical', boxSizing: 'border-box' } as React.CSSProperties,
  btnPrimary: { background: '#0891b2', color: '#ffffff', border: '1px solid #0891b2', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
  btnGhost: { background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 20px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, textDecoration: 'none', cursor: 'pointer', display: 'inline-block' } as React.CSSProperties,
  btnDanger: { background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 28 } as React.CSSProperties,
  groupTitle: { fontSize: 12, color: '#0891b2', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace' } as React.CSSProperties,
  divider: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(8,145,178,0.3), transparent)' } as React.CSSProperties,
}

export default function EditImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [code, setCode] = useState('')
  const [mainProduct, setMainProduct] = useState('')
  const [status, setStatus] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [sailingDate, setSailingDate] = useState('')
  const [etaPort, setEtaPort] = useState('')
  const [possibleDeliveryDate, setPossibleDeliveryDate] = useState('')
  const [risk, setRisk] = useState('')
  const [notes, setNotes] = useState('')
  const [manufacturerCost, setManufacturerCost] = useState('')
  const [arcaEstimated, setArcaEstimated] = useState('')
  const [arcaStatus, setArcaStatus] = useState('Pendiente')
  const [arcaPaymentDate, setArcaPaymentDate] = useState('')
  const [payments, setPayments] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    async function loadImport() {
      const { data, error } = await supabase.from('imports').select('*').eq('id', id).single()
      if (error) { alert(error.message); return }
      setCode(data.code || '')
      setMainProduct(data.main_product || '')
      setStatus(data.status || '')
      setOrderDate(data.order_date || '')
      setSailingDate(data.sailing_date || '')
      setEtaPort(data.eta_port || '')
      setPossibleDeliveryDate(data.possible_delivery_date || '')
      setRisk(data.risk || '')
      setNotes(data.notes || '')
      setManufacturerCost(data.manufacturer_cost || '')
      setArcaEstimated(data.arca_estimated || '')
      setArcaStatus(data.arca_status || 'Pendiente')
      setArcaPaymentDate(data.arca_payment_date || '')

      const { data: paymentsData } = await supabase.from('payments').select('*').eq('import_id', id).order('created_at', { ascending: false })
      setPayments(paymentsData || [])
      const { data: documentsData } = await supabase.from('documents').select('*').eq('import_id', id).order('created_at', { ascending: false })
      setDocuments(documentsData || [])
    }
    loadImport()
  }, [id])

  async function deleteImport() {
    if (!confirm('¿Eliminar esta importación?')) return
    const { error } = await supabase.from('imports').delete().eq('id', id)
    if (error) { alert(error.message); return }
    window.location.href = '/'
  }

  async function updateImport(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('imports').update({
      code, main_product: mainProduct, status,
      order_date: orderDate || null, sailing_date: sailingDate || null,
      eta_port: etaPort || null, possible_delivery_date: possibleDeliveryDate || null,
      risk, notes, manufacturer_cost: manufacturerCost || null,
      arca_estimated: arcaEstimated || null, arca_status: arcaStatus, arca_payment_date: arcaPaymentDate || null,
    }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    window.location.href = '/'
  }

  return (
    <main style={S.page}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } option { background: #ffffff; color: #0f172a; } input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; } textarea::placeholder { color: #94a3b8; }`}</style>

      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#0891b2', fontSize: 20 }}>▸</span>
          <span style={S.title}>EDITAR IMPORTACIÓN</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/" style={S.btnGhost}>← Volver</a>
          <button type="button" onClick={deleteImport} style={S.btnDanger}>Eliminar</button>
        </div>
      </header>

      <div style={{ maxWidth: 680 }}>
        <form onSubmit={updateImport}>
          <div style={S.card}>
            <div style={S.sectionTitle}>
              <span style={S.groupTitle}>◈ General</span>
              <div style={S.divider} />
            </div>
            <label style={S.label}>Código</label>
            <input style={S.input} value={code} onChange={e => setCode(e.target.value)} />
            <label style={S.label}>Producto principal</label>
            <input style={S.input} value={mainProduct} onChange={e => setMainProduct(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                <label style={S.label}>Pago orden de compra</label>
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
              <span style={S.groupTitle}>◈ Fabricación</span>
              <div style={S.divider} />
            </div>
            <label style={S.label}>Costo total (USD)</label>
            <input style={S.input} type="number" step="0.01" min="0" placeholder="0.00"
              value={manufacturerCost}
              onChange={e => setManufacturerCost(e.target.value)} />
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>
              <span style={S.groupTitle}>◈ ARCA</span>
              <div style={S.divider} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={S.label}>Estimado (ARS)</label>
                <input style={S.input} type="number" step="0.01" min="0" placeholder="0.00"
                  value={arcaEstimated}
                  onChange={e => setArcaEstimated(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Estado</label>
                <select style={S.select} value={arcaStatus} onChange={e => setArcaStatus(e.target.value)}>
                  <option>Pendiente</option>
                  <option>Pagado</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Fecha tentativa pago</label>
                <input type="date" style={S.input} value={arcaPaymentDate} onChange={e => setArcaPaymentDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>
              <span style={S.groupTitle}>◈ Notas</span>
              <div style={S.divider} />
            </div>
            <textarea style={S.textarea} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={S.btnPrimary}>Guardar cambios</button>
            <a href="/" style={S.btnGhost}>Cancelar</a>
          </div>
        </form>

        {/* Pagos */}
        <div style={{ ...S.sectionTitle, marginTop: 40 }}>
          <span style={S.groupTitle}>◈ Pagos relacionados</span>
          <div style={S.divider} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payments.map(p => (
            <div key={p.id} style={{ ...S.card, marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{p.concept}</span>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontFamily: 'monospace' }}>
                  {p.currency} {Number(p.amount || 0).toLocaleString('es-AR')} · Vence: {p.due_date || '—'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: p.status === 'Pagado' ? '#16a34a' : '#d97706', background: p.status === 'Pagado' ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)', border: `1px solid ${p.status === 'Pagado' ? 'rgba(22,163,74,0.3)' : 'rgba(217,119,6,0.3)'}`, borderRadius: 4, padding: '3px 10px', fontFamily: 'monospace' }}>{p.status}</span>
                <a href={`/payments/${p.id}`} style={{ ...S.btnGhost, padding: '6px 14px', fontSize: 13 }}>Editar</a>
              </div>
            </div>
          ))}
        </div>

        {/* Documentos */}
        <div style={{ ...S.sectionTitle, marginTop: 32 }}>
          <span style={S.groupTitle}>◈ Documentos relacionados</span>
          <div style={S.divider} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {documents.length === 0 && <p style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 14 }}>No hay documentos cargados.</p>}
          {documents.map(doc => (
            <div key={doc.id} style={{ ...S.card, marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{doc.document_type}</span>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontFamily: 'monospace' }}>{doc.file_name}</div>
              </div>
              <a href={doc.file_url} target="_blank" style={{ ...S.btnGhost, padding: '6px 14px', fontSize: 13 }}>Ver archivo</a>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <a href="/documents" style={{ ...S.btnGhost, color: '#7c3aed', borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.05)' }}>+ Subir documento</a>
        </div>
      </div>
    </main>
  )
}
