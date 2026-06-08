'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'

const S = {
  page: { minHeight: '100vh', background: '#f0f4f8', padding: '0 32px 60px', color: '#0f172a', fontFamily: 'monospace' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 28 } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: 2, fontFamily: 'monospace' } as React.CSSProperties,
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 24px', marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as React.CSSProperties,
  btnGhost: { background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 20px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, textDecoration: 'none', cursor: 'pointer', display: 'inline-block' } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } as React.CSSProperties,
  groupTitle: { fontSize: 12, color: '#7c3aed', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace' } as React.CSSProperties,
  divider: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(124,58,237,0.3), transparent)' } as React.CSSProperties,
}

const DOC_COLORS: Record<string, string> = {
  'Invoice': '#0891b2', 'Packing List': '#7c3aed', 'BL': '#0d9488',
  'Certificado': '#16a34a', 'Comprobante de pago': '#d97706', 'Otro': '#94a3b8',
}

export default function ImportDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [documents, setDocuments] = useState<any[]>([])
  const [importCode, setImportCode] = useState('')

  useEffect(() => {
    async function loadData() {
      const { data: importData } = await supabase.from('imports').select('code').eq('id', id).single()
      setImportCode(importData?.code || '')
      const { data: documentsData } = await supabase.from('documents').select('*').eq('import_id', id).order('created_at', { ascending: false })
      setDocuments(documentsData || [])
    }
    loadData()
  }, [id])

  return (
    <main style={S.page}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }`}</style>

      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#7c3aed', fontSize: 20 }}>▸</span>
          <span style={S.title}>DOCUMENTOS</span>
          {importCode && <span style={{ fontSize: 14, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 4, padding: '3px 12px', letterSpacing: 2 }}>{importCode}</span>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={`/imports/${id}`} style={S.btnGhost}>← Editar</a>
          <a href="/" style={S.btnGhost}>Inicio</a>
          <a href="/documents" style={{ ...S.btnGhost, color: '#7c3aed', borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)' }}>+ Subir</a>
        </div>
      </header>

      <div style={{ maxWidth: 780 }}>
        <div style={S.sectionTitle}>
          <span style={S.groupTitle}>◈ Archivos ({documents.length})</span>
          <div style={S.divider} />
        </div>

        {documents.length === 0 && (
          <div style={{ ...S.card, color: '#94a3b8', textAlign: 'center', padding: '40px 24px' }}>
            No hay documentos cargados para esta importación.
          </div>
        )}

        {documents.map(doc => {
          const color = DOC_COLORS[doc.document_type] || '#94a3b8'
          return (
            <div key={doc.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color, background: `${color}12`, border: `1px solid ${color}40`, borderRadius: 4, padding: '2px 10px', letterSpacing: 1, fontFamily: 'monospace' }}>{doc.document_type}</span>
                </div>
                <span style={{ fontSize: 14, color: '#475569', fontFamily: 'monospace' }}>{doc.file_name}</span>
              </div>
              <a href={doc.file_url} target="_blank" style={{ ...S.btnGhost, padding: '6px 14px', fontSize: 13 }}>Ver archivo</a>
            </div>
          )
        })}
      </div>
    </main>
  )
}
