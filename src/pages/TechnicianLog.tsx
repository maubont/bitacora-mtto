import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { AREAS, EQUIPMENT_LIST, SPECIALTIES, WORK_TYPES, STATUSES } from '../data/lists'
import AIChatModal from '../components/AIChatModal'
import Layout from '../components/Layout'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { toast } from 'sonner'

export default function TechnicianLog() {
    const [area, setArea] = useState('')
    const [equipment, setEquipment] = useState('')
    const [specialty, setSpecialty] = useState('')
    const [workType, setWorkType] = useState('')
    const [hasOS, setHasOS] = useState(false)
    const [osNumber, setOsNumber] = useState('')
    const [status, setStatus] = useState('Ejecutado')
    const [duration, setDuration] = useState('')
    const [description, setDescription] = useState('')
    const [novedad, setNovedad] = useState('')
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const isFormReady = area && equipment && specialty && workType

    const handleSubmit = async () => {
        if (!description.trim()) return
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            navigate('/login')
            return
        }

        const { error } = await supabase.from('activities').insert({
            user_id: user.id,
            area,
            equipment_id: equipment,
            specialty,
            work_type: workType,
            os: hasOS ? osNumber : null,
            status,
            duration_minutes: duration ? parseInt(duration) : null,
            description,
            novedad: novedad.trim() || null
        })

        if (error) {
            console.error('Error submitting:', error)
            toast.error('Error al registrar actividad: ' + error.message)
        } else {
            setDescription('')
            setNovedad('')
            setEquipment('')
            setArea('')
            setSpecialty('')
            setWorkType('')
            setOsNumber('')
            setHasOS(false)
            setDuration('')
            setStatus('Ejecutado')
            setStatus('Ejecutado')
            toast.success('✅ Actividad registrada exitosamente')
        }
        setLoading(false)
    }

    return (
        <Layout>
            <div className="min-h-screen bg-industrial-900 text-industrial-100">
                <header className="bg-industrial-800 border-b border-industrial-700 p-4 sticky top-0 z-10 shadow-lg">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-xl font-bold text-accent-primary">Registro de Actividades</h1>
                    </div>
                </header>

                <main className="p-4 max-w-3xl mx-auto space-y-6">
                    <section className="space-y-4 bg-industrial-800/50 p-4 rounded-xl border border-industrial-700/50">
                        <h2 className="text-sm font-semibold text-industrial-400 uppercase tracking-wider">Ubicación</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-xs text-industrial-500 mb-1">Área</label>
                                <select
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    className="w-full bg-industrial-900 border border-industrial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent-primary outline-none"
                                >
                                    <option value="">Seleccionar Área...</option>
                                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-industrial-500 mb-1">Equipo</label>
                                <select
                                    value={equipment}
                                    onChange={(e) => setEquipment(e.target.value)}
                                    className="w-full bg-industrial-900 border border-industrial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent-primary outline-none"
                                >
                                    <option value="">Seleccionar Equipo...</option>
                                    {EQUIPMENT_LIST.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 bg-industrial-800/50 p-4 rounded-xl border border-industrial-700/50">
                        <h2 className="text-sm font-semibold text-industrial-400 uppercase tracking-wider">Clasificación</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {SPECIALTIES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSpecialty(s)}
                                        className={`p-3 rounded-lg text-sm font-medium transition-all border ${specialty === s
                                            ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20'
                                            : 'bg-industrial-700/50 text-industrial-300 border-industrial-600 hover:bg-industrial-700'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {WORK_TYPES.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setWorkType(t)}
                                        className={`p-3 rounded-lg text-sm font-medium transition-all border ${workType === t
                                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                            : 'bg-industrial-700/50 text-industrial-300 border-industrial-600 hover:bg-industrial-700'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 gap-4">
                        <div className="bg-industrial-800/50 p-4 rounded-xl border border-industrial-700/50 col-span-2 md:col-span-1">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-industrial-300">¿Tiene OS?</label>
                                <button
                                    onClick={() => setHasOS(!hasOS)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${hasOS ? 'bg-accent-primary' : 'bg-industrial-600'}`}
                                >
                                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${hasOS ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>
                            {hasOS && (
                                <input
                                    type="number"
                                    placeholder="# Orden"
                                    value={osNumber}
                                    onChange={(e) => setOsNumber(e.target.value)}
                                    className="w-full bg-industrial-900 border border-industrial-600 rounded-lg p-2 text-sm text-white outline-none focus:border-accent-primary"
                                />
                            )}
                        </div>
                        <div className="bg-industrial-800/50 p-4 rounded-xl border border-industrial-700/50 col-span-2 md:col-span-1">
                            <label className="block text-xs text-industrial-500 mb-2">Estado</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-industrial-900 border border-industrial-600 rounded-lg p-2 text-sm text-white outline-none focus:border-accent-primary"
                            >
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
                            </select>
                        </div>
                        <div className="bg-industrial-800/50 p-4 rounded-xl border border-industrial-700/50 col-span-2">
                            <label className="block text-xs text-industrial-500 mb-2">Duración (minutos)</label>
                            <input
                                type="number"
                                placeholder="Ej: 45"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full bg-industrial-900 border border-industrial-600 rounded-lg p-2 text-sm text-white outline-none focus:border-accent-primary"
                            />
                        </div>
                    </section>

                    <section className={`space-y-4 transition-opacity duration-300 ${isFormReady ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="bg-industrial-800/50 p-4 rounded-xl border border-industrial-700/50 relative">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-industrial-300">Descripción de la actividad</label>
                                <button
                                    onClick={() => setIsChatOpen(true)}
                                    disabled={!isFormReady}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-xs font-bold text-white shadow-lg hover:shadow-indigo-500/30 transition-all"
                                >
                                    ✨ Asistente IA
                                </button>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-32 bg-industrial-900/50 border border-industrial-600 rounded-lg p-4 text-industrial-100 placeholder-industrial-600 focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none resize-none"
                                placeholder={isFormReady ? "Describe la actividad realizada..." : "Selecciona Área, Equipo y Categorías primero"}
                            />
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-industrial-300 mb-2">
                                    Novedades / Pendientes <span className="text-industrial-500 text-xs">(Opcional)</span>
                                </label>
                                <textarea
                                    value={novedad}
                                    onChange={(e) => setNovedad(e.target.value)}
                                    className="w-full h-20 bg-industrial-900/50 border border-industrial-600 rounded-lg p-4 text-industrial-100 placeholder-industrial-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                    placeholder="Si quedó algo pendiente o hubo una novedad..."
                                />
                            </div>
                        </div>
                    </section>



                    {loading ? (
                        <div className="w-full bg-industrial-800/50 p-4 rounded-xl border border-industrial-700/50">
                            <LoadingSkeleton />
                        </div>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!isFormReady || !description.trim()}
                            className="w-full bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-accent-primary/20 transition-all active:scale-[0.98]"
                        >
                            Registrar Actividad
                        </button>
                    )}
                </main>

                <AIChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    context={{ area, equipment, specialty, workType, os: hasOS ? osNumber : undefined }}
                    initialDescription={description}
                    onApply={(desc, nov) => {
                        setDescription(desc)
                        if (nov) setNovedad(nov)
                        setIsChatOpen(false)
                    }}
                />
            </div>
        </Layout>
    )
}
