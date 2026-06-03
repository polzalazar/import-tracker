'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'

export default function ImportDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [documents, setDocuments] = useState<any[]>([])
  const [importCode, setImportCode] = useState('')

  useEffect(() => {
    async function loadData() {
      const { data: importData } = await supabase
        .from('imports')
        .select('code')
        .eq('id', id)
        .single()

      setImportCode(importData?.code || '')

      const { data: documentsData } = await supabase
        .from('documents')
        .select('*')
        .eq('import_id', id)
        .order('created_at', { ascending: false })

      setDocuments(documentsData || [])
    }

    loadData()
  }, [id])

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Documentos {importCode}
        </h1>

        <a
          href="/"
          className="border px-5 py-3 rounded-xl"
        >
          Volver
        </a>
      </div>

      <div className="space-y-4">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl shadow p-6 flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-semibold">
                  {doc.document_type}
                </h2>

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
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow p-6">
            No hay documentos cargados para esta importación.
          </div>
        )}
      </div>
    </main>
  )
}