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
  fileInput: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, color: '#475569', fontFamily: 'monospace', fontSize: 15, padding: '10px 14px', boxSizing: 'border-box', cursor: 'pointer' } as React.CSSProperties,
  btnPrimary: { background: '#0891b2', color: '#ffffff', border: '1px solid #0891b2', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
  btnGhost: { background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 20px', fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, textDecoration: 'none', cursor: 'pointer', display: 'inline-block' } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } as React.CSSProperties,
  groupTitle: { fontSize: 12, color: '#7c3aed', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace' } as React.CSSProperties,
  divider: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(124,58,237,0.3), transparent)' } as React.CSSProperties,
}

const DOC_COLORS: Record<string, string> = {
  'Invoice': '#0891b2', 'Packing List': '#7c3aed', 'BL': '#0d9488',
  'Certificado': '#16a34a', 'Comprobante de pago': '#d97706', 'Otro': '#94a3b8',
}

export default function DocumentsPage() {
  const [imports, setImports] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [importId, setImportId] = useState('')
  const [documentType, setDocumentType] = useState('Invoice')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: importsData } = await supabase.from('imports').select('*')
    const { data: documentsData } = await supabase.from('documents').select('*, imports (code)').order('created_at', { ascending: false })
    setImports(importsData || [])
    setDocuments(documentsData || [])
  }

  async function uploadDocument(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !importId) { alert('Elegí una importación y un archivo'); return }
    const filePath = `${importId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)
    if (uploadError) { alert(uploadError.message); return }
    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath)
    const { error: insertError } = await supabase.from('documents').insert({ import_id: importId, document_type: documentType, file_name: file.name, file_url: publicUrlData.publicUrl })
    if (insertError) { alert(insertError.message); return }
    setImportId(''); setDocumentType('Invoice'); setFile(null)
    loadData()
  }

  return (
    <main style={S.page}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } option { background: #ffffff; color: #0f172a; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; } input[type="file"]::file-selector-button { background: rgba(8,145,178,0.08); color: #0891b2; border: 1px solid rgba(8,145,178,0.3); border-radius: 4px; padding: 4px 12px; font-family: monospace; cursor: pointer; margin-right: 12px; }`}</style>

      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#7c3aed', fontSize: 20 }}>▸</span>
          <span style={S.title}>DOCUMENTOS</span>
        </div>
        <a href="/" style={S.btnGhost}>← Volver</a>
      </header>

      <div style={{ maxWidth: 780 }}>
        <div style={S.card}>
          <div style={S.sectionTitle}>
            <span style={S.groupTitle}>◈ Subir documento</span>
            <div style={S.divider} />
          </div>
          <form onSubmit={uploadDocument}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={S.label}>Importación</label>
                <select style={S.select} value={importId} onChange={e => setImportId(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {imports.map(i => <option key={i.id} value={i.id}>{i.code}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Tipo de documento</label>
                <select style={S.select} value={documentType} onChange={e => setDocumentType(e.target.value)}>
                  <option>Invoice</option>
                  <option>Packing List</option>
                  <option>BL</option>
                  <option>Certificado</option>
                  <option>Comprobante de pago</option>
                  <option>Otro</option>
                </select>
              </div>
            </div>
            <label style={S.label}>Archivo</label>
            <input type="file" style={S.fileInput} onChange={e => setFile(e.target.files?.[0] || null)} />
            <div style={{ marginTop: 20 }}>
              <button type="submit" style={S.btnPrimary}>Subir documento</button>
            </div>
          </form>
        </div>

        <div style={S.sectionTitle}>
          <span style={S.groupTitle}>◈ Archivos</span>
          <div style={S.divider} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {documents.length === 0 && <p style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'monospace' }}>No hay documentos cargados.</p>}
          {documents.map(doc => {
            const color = DOC_COLORS[doc.document_type] || '#94a3b8'
            return (
              <div key={doc.id} style={{ ...S.card, marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color, background: `${color}12`, border: `1px solid ${color}40`, borderRadius: 4, padding: '2px 10px', letterSpacing: 1, fontFamily: 'monospace' }}>{doc.document_type}</span>
                    <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>{doc.imports?.code}</span>
                  </div>
                  <span style={{ fontSize: 14, color: '#475569', fontFamily: 'monospace' }}>{doc.file_name}</span>
                </div>
                <a href={doc.file_url} target="_blank" style={{ ...S.btnGhost, padding: '6px 14px', fontSize: 13 }}>Ver archivo</a>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
