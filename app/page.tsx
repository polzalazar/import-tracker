'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function riskClass(risk: string) {
  if (risk === 'Bajo') return 'bg-green-100 text-green-700'
  if (risk === 'Medio') return 'bg-yellow-100 text-yellow-700'
  if (risk === 'Alto') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

export default function Home() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        window.location.href = '/login'
        return
      }

      const { data, error } = await supabase
        .from('imports')
        .select('*')

      if (error) {
        alert(error.message)
        return
      }

      setData(data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const total = data.length

  const active =
    data.filter(
      (item) => item.status !== 'Cerrado'
    ).length

  const highRisk =
    data.filter(
      (item) => item.risk === 'Alto'
    ).length

  const nextDeliveries =
    data.filter(
      (item) => item.possible_delivery_date
    ).length

  if (loading) {
    return (
      <main className="p-10">
        Cargando...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Import Tracker
        </h1>

        <div className="flex gap-3">
          <a
            href="/new-import"
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            Nueva importación
          </a>
<a
  href="/documents"
  className="border px-5 py-3 rounded-xl"
>
  Documentos
</a>
          <button
            onClick={logout}
            className="border px-5 py-3 rounded-xl"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Total importaciones
          </p>

          <p className="text-3xl font-bold">
            {total}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Activas
          </p>

          <p className="text-3xl font-bold">
            {active}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Riesgo alto
          </p>

          <p className="text-3xl font-bold">
            {highRisk}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Con delivery estimado
          </p>

          <p className="text-3xl font-bold">
            {nextDeliveries}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        Importaciones
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">
                {item.code}
              </h3>

              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                {item.status}
              </span>
            </div>

            <p className="mb-2">
              <b>Producto:</b> {item.main_product}
            </p>

            <p className="mb-2">
              <b>ETA Puerto:</b> {item.eta_port}
            </p>

            <p className="mb-2">
              <b>Delivery posible:</b> {item.possible_delivery_date}
            </p>

            <p className="mb-2">
              <b>Riesgo:</b>{' '}
              <span
                className={`px-3 py-1 rounded-full text-sm ${riskClass(item.risk)}`}
              >
                {item.risk}
              </span>
            </p>

            <div className="mt-4 border-t pt-4 text-gray-600 text-sm">
              {item.notes}
            </div>

            <a
              href={`/imports/${item.id}`}
              className="inline-block mt-4 bg-black text-white px-4 py-2 rounded-xl"
            >
              Editar
            </a>
          </div>
        ))}
      </div>
    </main>
  )
}