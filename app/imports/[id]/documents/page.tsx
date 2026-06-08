'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'

const S = {
  page: { minHeight: '100vh', background: '#060d1a', backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.06) 0%, transparent 60%)', padding: '0 32px 60px', color: '#e2e8f0', fontFamily: 'monospace' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 20px', borderBottom: '1px solid rgba(34,211,238,0.1)', marginBottom: 28 } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 700, color: '#e2e8f0', letterSpacing: 2, fontFamily: 'monospace' } as React.CSSProperties,
  card: { background: 'rgba(10,22,40,0.9)', border: '1px solid rgba(34,211,238,0.1)', borderRadius: 10, padding: '20px 24px', marginBottom: 10 } as React.CSSProperties,
  btnGhost: { background: 'transparent', color: '#475569', border: '1px solid rgba(71,85,105,0.4)', borderRadius: 6, padding: '10px 20px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, textDecoration: 'none', cursor: 'pointer', display: 'inline-block' } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } as React.CSSProperties,
  groupTitle: { fontSize: 12, color: '#a78bfa', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace' } as React.CSSProperties,
  divider: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(167,139,250,0.3), transparent)' } as React.CSSProperties,
}

const DOC_COLORS: Record<string, string> = {
  'Invoice': '#38bdf8', 'Packing List': '#a78bfa', 'BL': '#22d3ee',
  'Certificado': '#4ade80', 'Comprobante de pago': '#fbbf24', 'Otro': '#94a3b8',
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
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }`}</style>

      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#a78bfa', fontSize: 20 }}>▸</span>
          <span style={S.title}>DOCUMENTOS</span>
          {importCode && <span style={{ fontSize: 16, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 4, padding: '3px 12px', letterSpacing: 2 }}>{importCode}</span>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={`/imports/${id}`} style={S.btnGhost}>← Editar</a>
          <a href="/" style={S.btnGhost}>Inicio</a>
          <a href="/documents" style={{ ...S.btnGhost, color: '#a78bfa', borderColor: 'rgba(167,139,250,0.4)' }}>+ Subir</a>
        </div>
      </header>

      <div style={{ maxWidth: 780 }}>
        <div style={S.sectionTitle}>
          <span style={S.groupTitle}>◈ Archivos ({documents.length})</span>
          <div style={S.divider} />
        </div>

        {documents.length === 0 && (
          <div style={{ ...S.card, color: '#475569', textAlign: 'center', padding: '40px 24px' }}>
            No hay documentos cargados para esta importación.
          </div>
        )}

        {documents.map(doc => {
          const color = DOC_COLORS[doc.document_type] || '#94a3b8'
          return (
            <div key={doc.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 4, padding: '2px 10px', letterSpacing: 1 }}>{doc.document_type}</span>
                </div>
                <span style={{ fontSize: 15, color: '#94a3b8' }}>{doc.file_name}</span>
              </div>
              <a href={doc.file_url} target="_blank" style={{ ...S.btnGhost, padding: '6px 14px', fontSize: 13 }}>Ver archivo</a>
            </div>
          )
        })}
      </div>
    </main>
  )
}
