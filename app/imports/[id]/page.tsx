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
  textarea: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 6, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 16, padding: '10px 14px', outline: 'none', minHeight: 80, resize: 'vertical', boxSizing: 'border-box' } as React.CSSProperties,
  btnPrimary: { background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
  btnGhost: { background: 'transparent', color: '#475569', border: '1px solid rgba(71,85,105,0.4)', borderRadius: 6, padding: '10px 20px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, textDecoration: 'none', cursor: 'pointer', display: 'inline-block' } as React.CSSProperties,
  btnDanger: { background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 28 } as React.CSSProperties,
  groupTitle: { fontSize: 12, color: '#22d3ee', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace' } as React.CSSProperties,
  divider: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(34,211,238,0.3), transparent)' } as React.CSSProperties,
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
    alert('Importación eliminada')
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
    alert('Importación actualizada')
    window.location.href = '/'
  }

  return (
    <main style={S.page}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        option { background: #0f172a; color: #94a3b8; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
      `}</style>

      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#22d3ee', fontSize: 20 }}>▸</span>
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

            <label style={S.label}>Riesgo</label>
            <select style={S.select} value={risk} onChange={e => setRisk(e.target.value)}>
              <option>Bajo</option>
              <option>Medio</option>
              <option>Alto</option>
            </select>
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
                <label style={S.label}>Fecha de zarpe</label>
                <input type="date" style={S.input} value={sailingDate} onChange={e => setSailingDate(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>ETA Puerto</label>
                <input type="date" style={S.input} value={etaPort} onChange={e => setEtaPort(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Delivery posible</label>
                <input type="date" style={S.input} value={possibleDeliveryDate} onChange={e => setPossibleDeliveryDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>
              <span style={S.groupTitle}>◈ Fabricación</span>
              <div style={S.divider} />
            </div>
            <label style={S.label}>Costo total (USD)</label>
            <input style={S.input} type="text"
              value={Number(manufacturerCost || 0).toLocaleString('es-AR')}
              onChange={e => setManufacturerCost(e.target.value.replace(/\./g, ''))} />
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>
              <span style={S.groupTitle}>◈ ARCA</span>
              <div style={S.divider} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={S.label}>Estimado (ARS)</label>
                <input style={S.input} type="text"
                  value={Number(arcaEstimated || 0).toLocaleString('es-AR')}
                  onChange={e => setArcaEstimated(e.target.value.replace(/\./g, ''))} />
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
                <span style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>{p.concept}</span>
                <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4, fontFamily: 'monospace' }}>
                  {p.currency} {Number(p.amount || 0).toLocaleString('es-AR')} · Vence: {p.due_date || '—'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: p.status === 'Pagado' ? '#4ade80' : '#fbbf24', background: p.status === 'Pagado' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${p.status === 'Pagado' ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`, borderRadius: 4, padding: '3px 10px', fontFamily: 'monospace' }}>{p.status}</span>
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
          {documents.length === 0 && <p style={{ color: '#475569', fontFamily: 'monospace', fontSize: 14 }}>No hay documentos cargados.</p>}
          {documents.map(doc => (
            <div key={doc.id} style={{ ...S.card, marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>{doc.document_type}</span>
                <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4, fontFamily: 'monospace' }}>{doc.file_name}</div>
              </div>
              <a href={doc.file_url} target="_blank" style={{ ...S.btnGhost, padding: '6px 14px', fontSize: 13 }}>Ver archivo</a>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <a href="/documents" style={S.btnGhost}>+ Subir documento</a>
        </div>
      </div>
    </main>
  )
}
