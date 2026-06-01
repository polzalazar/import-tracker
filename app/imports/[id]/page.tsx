'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function EditImportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [code, setCode] = useState('')
  const [mainProduct, setMainProduct] = useState('')
  const [status, setStatus] = useState('')
  const [etaPort, setEtaPort] = useState('')
  const [possibleDeliveryDate, setPossibleDeliveryDate] = useState('')
  const [risk, setRisk] = useState('')
  const [notes, setNotes] = useState('')
  const [manufacturerCost, setManufacturerCost] = useState('')
const [arcaEstimated, setArcaEstimated] = useState('')
const [arcaStatus, setArcaStatus] = useState('Pendiente')
const [arcaPaymentDate, setArcaPaymentDate] = useState('')
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => {
    async function loadImport() {
      const { data, error } = await supabase
        .from('imports')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert(error.message)
        return
      }

      setCode(data.code || '')
      setMainProduct(data.main_product || '')
      setStatus(data.status || '')
      setEtaPort(data.eta_port || '')
      setPossibleDeliveryDate(data.possible_delivery_date || '')
      setRisk(data.risk || '')
      setNotes(data.notes || '')
      setManufacturerCost(data.manufacturer_cost || '')
setArcaEstimated(data.arca_estimated || '')
setArcaStatus(data.arca_status || 'Pendiente')
setArcaPaymentDate(data.arca_payment_date || '')

      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('import_id', id)
        .order('created_at', { ascending: false })

      setPayments(paymentsData || [])
    }

    loadImport()
  }, [id])

  async function updateImport(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase
      .from('imports')
      .update({
        code,
        main_product: mainProduct,
        status,
        eta_port: etaPort || null,
        possible_delivery_date: possibleDeliveryDate || null,
       risk,
notes,
manufacturer_cost: manufacturerCost || null,
arca_estimated: arcaEstimated || null,
arca_status: arcaStatus,
arca_payment_date: arcaPaymentDate || null,
      })
      .eq('id', id)

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    alert('Importación actualizada')
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-8">
        Editar Importación
      </h1>

      <form
        onSubmit={updateImport}
        className="bg-white rounded-2xl shadow p-6 max-w-xl space-y-4"
      >
        <input
          className="w-full border p-3 rounded"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded"
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

       <label className="font-semibold">
  ETA Puerto
</label>

<input
  type="date"
  className="w-full border p-3 rounded"
  value={etaPort}
  onChange={(e) => setEtaPort(e.target.value)}
/>

<label className="font-semibold">
  Delivery posible
</label>

<input
  type="date"
  className="w-full border p-3 rounded"
  value={possibleDeliveryDate}
  onChange={(e) => setPossibleDeliveryDate(e.target.value)}
/>

        <label className="font-semibold">
  Riesgo
</label>
<select
          className="w-full border p-3 rounded"
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
        >
          <option>Bajo</option>
          <option>Medio</option>
          <option>Alto</option>
        </select>

 <h3 className="text-xl font-bold mt-4">
  💰 Fabricación
</h3>

<label className="font-semibold">
  Costo total fabricación
</label>

<input
  type="text"
  className="w-full border p-3 rounded"
  value={Number(manufacturerCost || 0).toLocaleString('es-AR')}
  onChange={(e) =>
    setManufacturerCost(
      e.target.value.replace(/\./g, '')
    )
  }
/>

<h3 className="text-xl font-bold mt-4">
  ARCA
</h3>

<label className="font-semibold">
  ARCA estimado
</label>

<input
  type="text"
  className="w-full border p-3 rounded"
  value={Number(arcaEstimated || 0).toLocaleString('es-AR')}
  onChange={(e) =>
    setArcaEstimated(
      e.target.value.replace(/\./g, '')
    )
  }
/>

<label className="font-semibold">
  Estado ARCA
</label>
<select
  className="w-full border p-3 rounded"
  value={arcaStatus}
  onChange={(e) => setArcaStatus(e.target.value)}
>
  <option>Pendiente</option>
  <option>Pagado</option>
</select>
<label className="font-semibold">
  Fecha tentativa pago ARCA
</label>
<input
  type="date"
  className="w-full border p-3 rounded"
  value={arcaPaymentDate}
  onChange={(e) => setArcaPaymentDate(e.target.value)}
/>
<label className="font-semibold">
  Notas
</label>
<textarea
          className="w-full border p-3 rounded"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex gap-3">
  <button className="bg-black text-white px-6 py-3 rounded-xl">
    Guardar cambios
  </button>

  <a
    href="/"
    className="border px-6 py-3 rounded-xl"
  >
    Cancelar
  </a>
</div>
      </form>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">
          Pagos relacionados
        </h2>

        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-2xl shadow p-5"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">
                    {payment.concept}
                  </h3>

                  <p>
                    {payment.currency} {payment.amount}
                  </p>

                  <p className="text-gray-500">
                    Vencimiento: {payment.due_date}
                  </p>
                </div>

                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}