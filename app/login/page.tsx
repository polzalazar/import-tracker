'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function login() {
    if (!email || !password) {
      alert('Completá email y contraseña')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    window.location.href = '/'
  }

  async function register() {
    if (!email || !password) {
      alert('Completá email y contraseña')
      return
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    console.log(data)

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    alert('Usuario creado correctamente. Ya puede ingresar.')
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
      <form
        className="bg-white rounded-2xl shadow p-8 w-full max-w-md space-y-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <h1 className="text-3xl font-bold mb-6">
          Ingresar
        </h1>

        <input
          className="w-full border p-3 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={login}
          className="w-full bg-black text-white px-6 py-3 rounded-xl"
        >
          Entrar
        </button>

        <button
          type="button"
          onClick={register}
          className="w-full border px-6 py-3 rounded-xl"
        >
          Crear usuario
        </button>
      </form>
    </main>
  )
}