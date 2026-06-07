'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function EditPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('Pendiente')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    async function loadPayment() {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert(error.message)
        return
      }

      setConcept(data.concept || '')
      setAmount(data.amount || '')
      setCurrency(data.currency || 'USD')
      setStatus(data.status || 'Pendiente')
      setDueDate(data.due_date || '')
    }

    loadPayment()
  }, [id])
async function deletePayment() {
  const confirmed = confirm(
    '¿Eliminar este pago?'
  )

  if (!confirmed) return

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)

  if (error) {
    alert(error.message)
    return
  }

  alert('Pago eliminado')
  window.location.href = '/payments'
}
  async function updatePayment(
    e: React.FormEvent
  ) {
    e.preventDefault()

    const { error } = await supabase
      .from('payments')
      .update({
        concept,
        amount,
        currency,
        status,
        due_date: dueDate,
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    alert('Pago actualizado')
    window.location.href = '/payments'
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-8">
        Editar Pago
      </h1>

      <form
        onSubmit={updatePayment}
        className="bg-white rounded-2xl shadow p-6 max-w-xl space-y-4"
      >
    <select
  className="w-full border p-3 rounded"
  value={concept}
  onChange={(e) => {
    const selectedConcept = e.target.value
    setConcept(selectedConcept)

    if (selectedConcept === 'ARCA') {
      setCurrency('ARS')
    } else {
      setCurrency('USD')
    }
  }}
>
  <option value="">SELECCIONAR CONCEPTO</option>
  <option>ANTICIPO FABRICANTE</option>
  <option>SALDO FABRICANTE</option>
  <option>FLETE MARÍTIMO</option>
  <option>ARCA</option>
  <option>TERMINAL PORTUARIA</option>
  <option>DESPACHANTE</option>
  <option>CAMIÓN</option>
</select>
        <input
          className="w-full border p-3 rounded"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <select
          className="w-full border p-3 rounded"
          value={currency}
          onChange={(e) =>
            setCurrency(e.target.value)
          }
        >
          <option>USD</option>
          <option>ARS</option>
        </select>

        <select
          className="w-full border p-3 rounded"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option>Pendiente</option>
          <option>Pagado</option>
        </select>

        <input
          type="date"
          className="w-full border p-3 rounded"
          value={dueDate}
          onChange={(e) =>
            setDueDate(e.target.value)
          }
        />

        <div className="flex gap-3">
  <button className="bg-black text-white px-6 py-3 rounded-xl">
    Guardar cambios
  </button>

  <a
    href="/payments"
    className="border px-6 py-3 rounded-xl"
  >
    Cancelar
  </a>

  <button
    type="button"
    onClick={deletePayment}
    className="bg-red-600 text-white px-6 py-3 rounded-xl"
  >
    Eliminar
  </button>
</div>
      </form>
    </main>
  )
}