import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TechnicianLog() {
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [loading, setLoading] = useState(false)

    const categories = [
        'Eléctrico',
        'Mecánico',
        'Instrumentación',
        'Preventivo',
        'Correctivo',
        'Inspección',
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase.from('activities').insert({
                user_id: user.id,
                description,
                category,
                status: 'completed',
            })

            if (!error) {
                setDescription('')
                setCategory('')
            }
        }

        setLoading(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-industrial-900 via-industrial-800 to-industrial-900">
            {/* Header */}
            <div className="bg-industrial-800/50 backdrop-blur-sm border-b border-industrial-700/50 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-accent-primary">Registro de Actividades</h1>
                    <button
                        onClick={handleLogout}
                        className="text-industrial-400 hover:text-accent-danger transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div className="bg-industrial-800/50 backdrop-blur-sm rounded-xl border border-industrial-700/50 p-6">
                        <label className="block text-sm font-medium text-industrial-300 mb-4">
                            Categoría
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all ${category === cat
                                            ? 'bg-accent-primary text-white shadow-lg'
                                            : 'bg-industrial-700/50 text-industrial-300 hover:bg-industrial-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-industrial-800/50 backdrop-blur-sm rounded-xl border border-industrial-700/50 p-6">
                        <label className="block text-sm font-medium text-industrial-300 mb-4">
                            Descripción de la actividad
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[200px] px-4 py-3 bg-industrial-700/50 border border-industrial-600 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none text-industrial-100 placeholder-industrial-500 resize-none"
                            placeholder="Describe detalladamente la actividad realizada..."
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !category}
                        className="w-full bg-gradient-to-r from-accent-primary to-amber-600 hover:from-accent-primary/90 hover:to-amber-600/90 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Guardando...' : 'Registrar Actividad'}
                    </button>
                </form>
            </div>
        </div>
    )
}
