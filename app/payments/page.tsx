'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [imports, setImports] = useState<any[]>([])

  const [importId, setImportId] = useState('')
  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('Pendiente')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: paymentsData } = await supabase
      .from('payments')
      .select(`
        *,
        imports (
          code
        )
      `)
      .order('created_at', { ascending: false })

    const { data: importsData } = await supabase
      .from('imports')
      .select('*')

    setPayments(paymentsData || [])
    setImports(importsData || [])
  }

  async function createPayment(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase
      .from('payments')
      .insert({
        import_id: importId,
        concept,
        amount: Number(amount),
        currency,
        due_date: dueDate || null,
        status,
      })

    if (error) {
      alert(error.message)
      return
    }

    alert('Pago creado')

    setImportId('')
    setConcept('')
    setAmount('')
    setCurrency('USD')
    setDueDate('')
    setStatus('Pendiente')

    loadData()
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Pagos
        </h1>

        <a
          href="/"
          className="border px-5 py-3 rounded-xl"
        >
          Volver
        </a>
      </div>

      <form
        onSubmit={createPayment}
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

        <input
          className="border p-3 rounded"
          placeholder="Concepto"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
        />

        <input
          className="border p-3 rounded"
          placeholder="Monto"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          className="border p-3 rounded"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option>USD</option>
          <option>ARS</option>
          <option>EUR</option>
        </select>

        <input
          type="date"
          className="border p-3 rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          className="border p-3 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Pendiente</option>
          <option>Pagado</option>
          <option>Vencido</option>
        </select>

        <button className="bg-black text-white px-6 py-3 rounded-xl md:col-span-2">
          Guardar pago
        </button>
      </form>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white rounded-2xl shadow p-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">
                  {payment.concept}
                </h2>

                <p className="text-gray-600">
                  Importación:{' '}
                  {payment.imports?.code}
                </p>

                <p>
                  {payment.currency} {payment.amount}
                </p>

                <p>
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
    </main>
  )
}