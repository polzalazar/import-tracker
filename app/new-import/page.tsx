'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function NewImportPage() {
  const [code, setCode] = useState('')
  const [mainProduct, setMainProduct] = useState('')
  const [status, setStatus] = useState('Pedido confirmado')
  const [etaPort, setEtaPort] = useState('')
  const [possibleDeliveryDate, setPossibleDeliveryDate] = useState('')
  const [risk, setRisk] = useState('Medio')
  const [notes, setNotes] = useState('')

  async function saveImport(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase.from('imports').insert({
      code,
      main_product: mainProduct,
      status,
      eta_port: etaPort || null,
      possible_delivery_date: possibleDeliveryDate || null,
      risk,
      notes,
    })

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    alert('Importación creada')
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-8">
        Nueva Importación
      </h1>

      <form
        onSubmit={saveImport}
        className="bg-white rounded-2xl shadow p-6 max-w-xl space-y-4"
      >
        <input
          className="w-full border p-3 rounded"
          placeholder="Código ej: IMP-002"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="Producto principal"
          value={mainProduct}
          onChange={(e) => setMainProduct(e.target.value)}
        />

        <select
          className="w-full border p-3 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
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

        <input
          type="date"
          className="w-full border p-3 rounded"
          value={etaPort}
          onChange={(e) => setEtaPort(e.target.value)}
        />

        <input
          type="date"
          className="w-full border p-3 rounded"
          value={possibleDeliveryDate}
          onChange={(e) => setPossibleDeliveryDate(e.target.value)}
        />

        <select
          className="w-full border p-3 rounded"
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
        >
          <option>Bajo</option>
          <option>Medio</option>
          <option>Alto</option>
        </select>

        <textarea
          className="w-full border p-3 rounded"
          placeholder="Observaciones"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button className="bg-black text-white px-6 py-3 rounded-xl">
          Guardar importación
        </button>
      </form>
    </main>
  )
}