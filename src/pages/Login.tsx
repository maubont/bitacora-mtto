import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/technician')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-industrial-900 via-industrial-800 to-industrial-900 p-4">
            <div className="w-full max-w-md">
                <div className="bg-industrial-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-industrial-700/50 p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-accent-primary mb-2">
                            Bitácora de Mantenimiento
                        </h1>
                        <p className="text-industrial-400">Extractora La Gloria</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-industrial-300 mb-2">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-industrial-700/50 border border-industrial-600 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none text-industrial-100 placeholder-industrial-500 transition-all"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-industrial-300 mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-industrial-700/50 border border-industrial-600 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none text-industrial-100 placeholder-industrial-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-accent-danger/10 border border-accent-danger/50 rounded-lg p-3">
                                <p className="text-accent-danger text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-accent-primary to-amber-600 hover:from-accent-primary/90 hover:to-amber-600/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
