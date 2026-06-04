'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function money(value: any, currency: 'USD' | 'ARS') {
  const number = Number(value || 0)

  if (currency === 'USD') {
    return `U$S ${number.toLocaleString('es-AR')}`
  }

  return `$ ${number.toLocaleString('es-AR')}`
}

function formatDate(date: string) {
  if (!date) return 'Sin fecha'

  return new Date(date + 'T00:00:00').toLocaleDateString('es-AR')
}
function statusClass(status: string) {
  if (status === 'Pedido confirmado')
    return 'bg-gray-100 text-gray-700'

  if (status === 'En fabricación')
    return 'bg-yellow-100 text-yellow-700'

  if (status === 'Listo para embarcar')
    return 'bg-purple-100 text-purple-700'

  if (status === 'Embarcado')
    return 'bg-indigo-100 text-indigo-700'

  if (status === 'En tránsito')
    return 'bg-blue-100 text-blue-700'

  if (status === 'Arribado')
    return 'bg-orange-100 text-orange-700'

  if (status === 'En aduana')
    return 'bg-red-100 text-red-700'

  if (status === 'Nacionalizado')
    return 'bg-cyan-100 text-cyan-700'

  if (status === 'En depósito')
    return 'bg-teal-100 text-teal-700'

  if (status === 'Disponible')
    return 'bg-green-100 text-green-700'

  if (status === 'Cerrado')
    return 'bg-gray-300 text-gray-800'

  return 'bg-gray-100 text-gray-700'
}
export default function Home() {
  const [data, setData] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
const [statusFilter, setStatusFilter] = useState('Estado')

  useEffect(() => {
    async function loadData() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        window.location.href = '/login'
        return
      }

      const { data, error } = await supabase
        .from('imports')
.select(`
  *,
  payments (*),
  documents (*)
`)
const { data: paymentsData } = await supabase
  .from('payments')
  .select(`
    *,
    imports (
      code
    )
  `)

      if (error) {
        alert(error.message)
        return
      }

      setData(data || [])
      setPayments(paymentsData || [])
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


  const nextDeliveries =
    data.filter(
      (item) => item.possible_delivery_date
    ).length
    const usdPayments = payments.filter(
  (payment) => payment.currency === 'USD'
)

const usdCommitted = usdPayments.reduce(
  (total, payment) => total + Number(payment.amount || 0),
  0
)

const usdPaid = usdPayments
  .filter((payment) => payment.status === 'Pagado')
  .reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  )

const usdPending = usdCommitted - usdPaid
const arsPayments = payments.filter(
  (payment) => payment.currency === 'ARS'
)

const arsCommitted = arsPayments.reduce(
  (total, payment) => total + Number(payment.amount || 0),
  0
)

const arsPaid = arsPayments
  .filter((payment) => payment.status === 'Pagado')
  .reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  )

const arsPending = arsCommitted - arsPaid
const today = new Date().toISOString().split('T')[0]

const overduePayments = payments.filter(
  (payment) =>
    payment.status !== 'Pagado' &&
    payment.due_date &&
    payment.due_date < today
).length
const upcomingPayments = payments
  .filter(
    (payment) =>
      payment.status !== 'Pagado' &&
      payment.due_date &&
      payment.due_date >= today
  )
  .sort((a, b) => a.due_date.localeCompare(b.due_date))
  .slice(0, 5)
const filteredData = data
  .filter((item) => {
    const matchesSearch =
      item.code?.toLowerCase().includes(search.toLowerCase()) ||
      item.main_product?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'Estado' ||
      item.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })
  .sort((a, b) => {
    if (!a.eta_port) return 1
    if (!b.eta_port) return -1

    return a.eta_port.localeCompare(b.eta_port)
  })
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

  <a
    href="/payments"
    className="border px-5 py-3 rounded-xl"
  >
    Pagos
  </a>

  <button
    onClick={logout}
    className="border px-5 py-3 rounded-xl"
  >
    Cerrar sesión
  </button>
</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
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
            Con delivery estimado
          </p>

          <p className="text-3xl font-bold">
            {nextDeliveries}
          </p></div>
        <div
  className={
    overduePayments > 0
      ? 'bg-red-100 rounded-2xl shadow p-5 border-2 border-red-500'
      : 'bg-white rounded-2xl shadow p-5 border-2 border-gray-200'
  }
>
  <p className="text-gray-500 text-sm">
    Pagos vencidos
  </p>

  <p
    className={
      overduePayments > 0
        ? 'text-3xl font-bold text-red-700'
        : 'text-3xl font-bold text-gray-700'
    }
  >
    {overduePayments}
  </p>
</div>

</div>
<div className="bg-white rounded-2xl shadow p-5 mb-6 border border-gray-200">
<h2 className="text-2xl font-bold mb-4 text-gray-900">
    Resumen financiero
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div className="border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-4 text-green-700">
        $
      </div>

      <p className="text-sm font-bold text-gray-700 mb-4">
        USD PAGADO
      </p>

      <p className="text-2xl font-bold text-green-700">
        {money(usdPaid, 'USD')}
      </p>
    </div>

    <div className="border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-3xl mb-4 text-orange-700">
        $
      </div>

      <p className="text-sm font-bold text-gray-700 mb-4">
        USD PENDIENTE
      </p>

      <p className="text-2xl font-bold text-orange-600">
        {money(usdPending, 'USD')}
      </p>
    </div>

    <div className="border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-4 text-blue-700">
        $
      </div>

      <p className="text-sm font-bold text-gray-700 mb-4">
        ARS PAGADO
      </p>

      <p className="text-2xl font-bold text-blue-700">
        {money(arsPaid, 'ARS')}
      </p>
    </div>

    <div className="border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-3xl mb-4 text-red-700">
        $
      </div>

      <p className="text-sm font-bold text-gray-700 mb-4">
        ARS PENDIENTE
      </p>

      <p className="text-2xl font-bold text-red-600">
        {money(arsPending, 'ARS')}
      </p>
    </div>
  </div>
</div>
<div className="bg-white rounded-2xl shadow p-4 mb-6 border border-gray-200 w-[40%]">
    <h2 className="text-2xl font-bold mb-6 text-gray-900">
    Próximos vencimientos
  </h2>

  {upcomingPayments.length > 0 ? (
    <div className="space-y-4">
      {upcomingPayments.slice(0, 3).map((payment: any) => {
        const importCode =
          data.find((item) => item.id === payment.import_id)?.code || 'Sin código'

        const amount =
          payment.currency === 'USD'
            ? money(payment.amount, 'USD')
            : money(payment.amount, 'ARS')

        return (
          <div
            key={payment.id}
            className="grid grid-cols-[220px_1fr_180px] items-center gap-6 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
                📅
              </div>

              <p className="text-xl font-bold text-blue-800">
                {formatDate(payment.due_date)}
              </p>
            </div>

            <div className="border-l border-dotted border-gray-300 pl-8">
              <p className="text-2xl font-bold text-blue-800 mb-1">
                {importCode}
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {payment.concept}
              </p>
            </div>

            <div className="flex items-center justify-end gap-5">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl text-red-600">
                $
              </div>

              <p className="text-2xl font-bold text-red-600">
                {amount}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  ) : (
    <p className="text-gray-500">
      No hay vencimientos próximos.
    </p>
  )}
</div>
<h2 className="text-2xl font-bold mb-4">
  Importaciones
</h2>
      <div className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
  <input
    className="border p-3 rounded flex-1"
    placeholder="Buscar por código o producto..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <select
    className="border p-3 rounded"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option>Estado</option>
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

</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => {
  const itemPayments = item.payments || []

  const paidTotal = itemPayments
    .filter((payment: any) => payment.status?.toLowerCase() === 'pagado')
    .reduce((total: number, payment: any) => total + Number(payment.amount || 0), 0)

  const pendingTotal = itemPayments
    .filter((payment: any) => payment.status?.toLowerCase() !== 'pagado')
    .reduce((total: number, payment: any) => total + Number(payment.amount || 0), 0)

  const nextDue = itemPayments
    .filter((payment: any) => payment.status?.toLowerCase() !== 'pagado' && payment.due_date)
    .sort((a: any, b: any) => a.due_date.localeCompare(b.due_date))[0]?.due_date

  const pendingPayments = itemPayments.filter(
  (payment: any) => payment.status?.toLowerCase() !== 'pagado'
)

const overdueItemPayments = pendingPayments.filter(
  (payment: any) =>
    payment.due_date &&
    payment.due_date < today
)

const next7DaysPayments = pendingPayments.filter((payment: any) => {
  if (!payment.due_date) return false

  const diffDays = Math.ceil(
    (new Date(payment.due_date + 'T00:00:00').getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return diffDays >= 0 && diffDays <= 7
})

const semaphore =
  overdueItemPayments.length > 0
    ? 'Acción requerida'
    : next7DaysPayments.length > 0
      ? 'Próximo vencimiento'
      : 'Todo al día'
      return (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">
                {item.code}
              </h3>

              <span
  className={`px-3 py-1 rounded-full text-sm ${statusClass(item.status)}`}
>
  {item.status}
</span>
            </div>
            <div className="mb-4">
  {semaphore === 'Acción requerida' && (
    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
      🔴 Acción requerida
    </span>
  )}

  {semaphore === 'Próximo vencimiento' && (
    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
      🟡 Próximo vencimiento
    </span>
  )}

  {semaphore === 'Todo al día' && (
    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
      🟢 Todo al día
    </span>
  )}
</div>

            <p className="mb-2">
              <b>Producto:</b> {item.main_product}
            </p>

            <p className="mb-2">
              <b>ETA Puerto:</b> {formatDate(item.eta_port)}
            </p>
<p className="text-base font-semibold text-gray-700 mb-2">
  {item.eta_port ? (
    (() => {
      const diffDays = Math.ceil(
        (new Date(item.eta_port + 'T00:00:00').getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )

      if (diffDays < 0)
        return `⚠ Llegó hace ${Math.abs(diffDays)} días`

      if (diffDays === 0)
        return '🚢 Arriba hoy'

      if (diffDays <= 7)
        return `🚢 Arriba en ${diffDays} días`

      return `⏳ Faltan ${diffDays} días`
    })()
  ) : (
    'Sin ETA'
  )}
</p>
            <p className="mb-2">
              <b>Delivery posible:</b> {formatDate(item.possible_delivery_date)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-gray-500">Pagos</p>
    <p className="font-bold">
      {item.payments?.length || 0}
    </p>
  </div>

  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-gray-500">Documentos</p>
    <p className="font-bold">
  {item.documents?.length || 0}
</p>
  </div>
</div>
<div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
  <p className="text-sm text-yellow-700 font-semibold mb-2">
    Próximos pagos
  </p>
  <div className="grid grid-cols-[1fr_120px_110px] text-xs font-bold text-yellow-700 mb-2">
  <span>CONCEPTO</span>
  <span className="text-center">MONTO</span>
  <span className="text-center">FECHA</span>
</div>

  {item.payments
    ?.filter(
      (payment: any) => payment.status !== 'Pagado'
    )
    .sort((a: any, b: any) =>
      a.due_date.localeCompare(b.due_date)
    )
    .slice(0, 2)
    .map((payment: any) => (
<div
  key={payment.id}
  className={`grid grid-cols-[1fr_120px_110px_30px] text-sm mb-1 rounded px-2 py-1 ${
    Math.ceil(
      (new Date(payment.due_date + 'T00:00:00').getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
    ) <= 7
      ? 'bg-red-50'
      : ''
  }`}
>
  <span>
    {payment.concept}
  </span>

  <span className="font-semibold text-center">
    {payment.currency === 'USD'
      ? `U$S ${Number(payment.amount || 0).toLocaleString('es-AR')}`
      : `$ ${Number(payment.amount || 0).toLocaleString('es-AR')}`}
  </span>

  <span className="text-center">
    {formatDate(payment.due_date)}
  </span>

  <span className="text-center text-red-600 text-lg font-bold">
  {Math.ceil(
    (new Date(payment.due_date + 'T00:00:00').getTime() - new Date().getTime()) /
    (1000 * 60 * 60 * 24)
  ) <= 7 && '⚠'}
</span>
</div>
    ))}

  {item.payments?.filter(
    (payment: any) => payment.status !== 'Pagado'
  ).length === 0 && (
    <p className="text-sm text-gray-500">
      Sin pagos pendientes
    </p>
  )}
</div>
<div className="mt-4 border-t pt-4">
  <p className="font-bold mb-2">💰 Fabricación</p>

  <p className="text-sm">
    <b>Costo total:</b> {money(item.manufacturer_cost, 'USD')}
  </p>

  <p className="text-sm">
    <b>Pagado:</b> {money(paidTotal, 'USD')}
  </p>

  <p className="text-sm">
    <b>Pendiente:</b> {money(Number(item.manufacturer_cost || 0) - paidTotal, 'USD')}
  </p>
</div>

<div className="mt-4 border-t pt-4">
  <p className="font-bold mb-2">ARCA</p>

  <p className="text-sm">
    <b>Estimado:</b> {money(item.arca_estimated, 'ARS')}
  </p>

  <p className="text-sm">
    <b>Pago previsto:</b> {formatDate(item.arca_payment_date)}
  </p>

  <p className="text-sm">
    <b>Estado:</b> {item.arca_status || 'Pendiente'}
  </p>
</div>

<div className="mt-4 border-t pt-4">
  <p className="font-bold mb-2">Pagos</p>

<div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 text-sm">
  <div className="bg-green-50 p-3 rounded-xl">
    <p className="text-gray-500">Pagado</p>
    <p className="font-bold text-green-700">
      {money(paidTotal, 'USD')}
    </p>
  </div>

  <div className="bg-red-50 p-3 rounded-xl">
    <p className="text-gray-500">Pendiente</p>
    <p className="font-bold text-red-700">
      USD {pendingTotal.toLocaleString()}
    </p>
  </div>

<div className="bg-gray-50 p-3 rounded-xl">
  <p className="text-gray-500">Próximo venc.</p>

  {itemPayments
    .filter((payment: any) => payment.status?.toLowerCase() !== 'pagado' && payment.due_date)
    .sort((a: any, b: any) => a.due_date.localeCompare(b.due_date))[0] ? (
    <p className="font-bold">
      {formatDate(
        itemPayments
          .filter((payment: any) => payment.status?.toLowerCase() !== 'pagado' && payment.due_date)
          .sort((a: any, b: any) => a.due_date.localeCompare(b.due_date))[0].due_date
      )}
      {' - '}
      {itemPayments
        .filter((payment: any) => payment.status?.toLowerCase() !== 'pagado' && payment.due_date)
        .sort((a: any, b: any) => a.due_date.localeCompare(b.due_date))[0].currency === 'USD'
        ? `U$S ${Number(
            itemPayments
              .filter((payment: any) => payment.status?.toLowerCase() !== 'pagado' && payment.due_date)
              .sort((a: any, b: any) => a.due_date.localeCompare(b.due_date))[0].amount || 0
          ).toLocaleString('es-AR')}`
        : `$ ${Number(
            itemPayments
              .filter((payment: any) => payment.status?.toLowerCase() !== 'pagado' && payment.due_date)
              .sort((a: any, b: any) => a.due_date.localeCompare(b.due_date))[0].amount || 0
          ).toLocaleString('es-AR')}`}
    </p>
  ) : (
    <p className="font-bold">
      Sin venc.
    </p>
  )}
</div>
</div>

{item.payments?.length > 0 ? (
  <div className="space-y-2">
    {item.payments.map((payment: any) => (
<div
  key={payment.id}
  className={`grid grid-cols-[1fr_120px_110px_30px] text-sm mb-1 rounded px-2 py-1 ${
    Math.ceil(
      (new Date(payment.due_date + 'T00:00:00').getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
    ) <= 7
      ? 'bg-red-50'
      : ''
  }`}
>
  <span>
    {payment.concept}
  </span>

  <span className="font-semibold text-center">
    {payment.currency === 'USD'
      ? `U$S ${Number(payment.amount || 0).toLocaleString('es-AR')}`
      : `$ ${Number(payment.amount || 0).toLocaleString('es-AR')}`}
  </span>

  <span className="text-center">
    {formatDate(payment.due_date)}
  </span>
</div>
    ))}
  </div>
) : (
  <p className="text-gray-500">
    No hay pagos cargados.
  </p>
)}
</div>

<div className="mt-4 border-t pt-4 text-gray-600 text-sm">
  {item.notes}
</div>

<div className="flex gap-3 mt-4">
  <a
    href={`/imports/${item.id}`}
    className="bg-black text-white px-4 py-2 rounded-xl"
  >
    Editar
  </a>

  <a
    href={`/imports/${item.id}/documents`}
    className="border px-4 py-2 rounded-xl"
  >
    Ver documentos
  </a>
  <a
  href={`/payments?importId=${item.id}`}
  className="border px-4 py-2 rounded-xl"
>
  PAGOS
</a>
</div>
</div>
  )
})}
</div>
</main>
)
}