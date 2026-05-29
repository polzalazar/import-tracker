'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function DocumentsPage() {
  const [imports, setImports] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])

  const [importId, setImportId] = useState('')
  const [documentType, setDocumentType] = useState('Invoice')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: importsData } = await supabase
      .from('imports')
      .select('*')

    const { data: documentsData } = await supabase
      .from('documents')
      .select(`
        *,
        imports (
          code
        )
      `)
      .order('created_at', { ascending: false })

    setImports(importsData || [])
    setDocuments(documentsData || [])
  }

  async function uploadDocument(e: React.FormEvent) {
    e.preventDefault()

    if (!file || !importId) {
      alert('Elegí una importación y un archivo')
      return
    }

    const filePath = `${importId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      alert(uploadError.message)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    const { error: insertError } = await supabase
      .from('documents')
      .insert({
        import_id: importId,
        document_type: documentType,
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
      })

    if (insertError) {
      alert(insertError.message)
      return
    }

    alert('Documento subido')

    setImportId('')
    setDocumentType('Invoice')
    setFile(null)

    loadData()
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Documentos
        </h1>

        <a href="/" className="border px-5 py-3 rounded-xl">
          Volver
        </a>
      </div>

      <form
        onSubmit={uploadDocument}
        className="bg-white rounded-2xl shadow p-6 mb-10 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <select
          className="border p-3 rounded"
          value={importId}
          onChange={(e) => setImportId(e.target.value)}
        >
          <option value="">Seleccionar importación</option>

          {imports.map((item) => (
            <option key={item.id} value={item.id}>
              {item.code}
            </option>
          ))}
        </select>

        <select
          className="border p-3 rounded"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option>Invoice</option>
          <option>Packing List</option>
          <option>BL</option>
          <option>Certificado</option>
          <option>Comprobante de pago</option>
          <option>Otro</option>
        </select>

        <input
          type="file"
          className="border p-3 rounded md:col-span-2"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button className="bg-black text-white px-6 py-3 rounded-xl md:col-span-2">
          Subir documento
        </button>
      </form>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl shadow p-6 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">
                {doc.document_type}
              </h2>

              <p className="text-gray-600">
                Importación: {doc.imports?.code}
              </p>

              <p className="text-gray-600">
                Archivo: {doc.file_name}
              </p>
            </div>

            <a
              href={doc.file_url}
              target="_blank"
              className="bg-black text-white px-4 py-2 rounded-xl"
            >
              Ver archivo
            </a>
          </div>
        ))}
      </div>
    </main>
  )
}