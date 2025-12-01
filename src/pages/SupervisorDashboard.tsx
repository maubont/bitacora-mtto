import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import Layout from '../components/Layout'
import {
    FileSpreadsheet,
    Search,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    User,
    ChevronDown,
    ChevronUp
} from 'lucide-react'

interface Activity {
    id: string
    created_at: string
    area: string
    equipment_id: string
    specialty: string
    work_type: string
    status: string
    description: string
    novedad: string | null
    duration_minutes: number | null
    os: string | null
    profiles: {
        full_name: string
    }
}

export default function SupervisorDashboard() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
    const [expandedRow, setExpandedRow] = useState<string | null>(null)


    useEffect(() => {
        fetchActivities()
    }, [])

    const fetchActivities = async () => {
        setLoading(true)

        const { data, error } = await supabase
            .from('activities')
            .select(`
                *,
                profiles (full_name)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching activities:', error)
        } else {
            setActivities(data || [])
        }
        setLoading(false)
    }

    const filteredActivities = activities.filter(act => {
        const matchesSearch =
            act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            act.equipment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (act.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())

        const actDate = act.created_at.split('T')[0]
        const matchesDate = filterDate ? actDate === filterDate : true

        return matchesSearch && matchesDate
    })

    const exportToExcel = () => {
        const getTurno = (date: Date) => {
            const hour = date.getHours()
            if (hour >= 6 && hour < 14) return 'Turno 1'
            if (hour >= 14 && hour < 22) return 'Turno 2'
            return 'Turno 3'
        }

        const dataToExport = filteredActivities.map(act => {
            const date = new Date(act.created_at)
            return {
                FECHA: date.toLocaleDateString('es-CO'),
                OS: act.os || '-',
                TURNO: getTurno(date),
                EJECUTOR: act.profiles?.full_name || 'Desconocido',
                NOVEDAD: act.novedad || '-',
                EQUIPO: act.equipment_id,
                ACTIVIDAD: act.description,
                'TIPO MTTO': act.work_type,
                TIEMPO: act.duration_minutes || 0,
                DIA: date.toLocaleDateString('es-CO', { weekday: 'long' }).toUpperCase(),
                ESTADO: act.status,
                // Campos extra al final
                'ÁREA': act.area,
                'ESPECIALIDAD': act.specialty,
                'HORA EXACTA': date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
            }
        })

        const ws = XLSX.utils.json_to_sheet(dataToExport)

        // Ajustar anchos de columna
        ws['!cols'] = [
            { wch: 12 }, // FECHA
            { wch: 10 }, // OS
            { wch: 12 }, // TURNO
            { wch: 25 }, // EJECUTOR
            { wch: 40 }, // NOVEDAD
            { wch: 20 }, // EQUIPO
            { wch: 50 }, // ACTIVIDAD
            { wch: 15 }, // TIPO MTTO
            { wch: 10 }, // TIEMPO
            { wch: 12 }, // DIA
            { wch: 12 }, // ESTADO
            { wch: 15 }, // AREA
            { wch: 15 }, // ESPECIALIDAD
            { wch: 10 }  // HORA
        ]

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Bitácora")

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' })
        saveAs(blob, `Bitacora_Mtto_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const stats = {
        totalToday: activities.filter(a => a.created_at.startsWith(new Date().toISOString().split('T')[0])).length,
        openNovelties: activities.filter(a => a.novedad && a.status !== 'Cancelado').length,
        activeTechs: new Set(activities.map(a => a.profiles?.full_name)).size
    }

    return (
        <Layout>
            <div className="min-h-screen bg-industrial-900 text-industrial-100">
                <header className="bg-industrial-800 border-b border-industrial-700 p-4">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold text-white">Panel de Supervisor</h1>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-industrial-800 p-6 rounded-xl border border-industrial-700 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-industrial-400 text-sm font-medium uppercase">Actividades Hoy</h3>
                                <CheckCircle2 className="text-green-500 w-5 h-5" />
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalToday}</p>
                        </div>
                        <div className="bg-industrial-800 p-6 rounded-xl border border-industrial-700 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-industrial-400 text-sm font-medium uppercase">Novedades / Pendientes</h3>
                                <AlertTriangle className="text-amber-500 w-5 h-5" />
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.openNovelties}</p>
                        </div>
                        <div className="bg-industrial-800 p-6 rounded-xl border border-industrial-700 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-industrial-400 text-sm font-medium uppercase">Técnicos Activos</h3>
                                <User className="text-blue-500 w-5 h-5" />
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.activeTechs}</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-industrial-800/50 p-4 rounded-xl border border-industrial-700/50">
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-industrial-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar equipo, técnico..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-industrial-900 border border-industrial-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-accent-primary outline-none w-full md:w-64"
                                />
                            </div>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-industrial-500 w-4 h-4" />
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-industrial-900 border border-industrial-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-accent-primary outline-none"
                                />
                            </div>
                        </div>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-900/20"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Exportar Excel
                        </button>
                    </div>

                    <div className="bg-industrial-800 rounded-xl border border-industrial-700 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-industrial-900 text-industrial-400 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Hora</th>
                                        <th className="px-6 py-4">Técnico</th>
                                        <th className="px-6 py-4">Equipo / Área</th>
                                        <th className="px-6 py-4">Detalle</th>
                                        <th className="px-6 py-4 text-center">Estado</th>
                                        <th className="px-6 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-industrial-700">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-industrial-500">Cargando datos...</td></tr>
                                    ) : filteredActivities.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-industrial-500">No se encontraron registros.</td></tr>
                                    ) : (
                                        filteredActivities.map((act) => (
                                            <>
                                                <tr key={act.id} className="hover:bg-industrial-700/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-industrial-300">
                                                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-white">{act.profiles?.full_name || 'Desconocido'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-medium">{act.equipment_id}</span>
                                                            <span className="text-xs text-industrial-500">{act.area}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs truncate text-industrial-300">{act.description}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                            ${act.status === 'Ejecutado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                                act.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                                    'bg-industrial-600 text-industrial-300'}`}>
                                                            {act.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => setExpandedRow(expandedRow === act.id ? null : act.id)}
                                                            className="text-industrial-400 hover:text-white transition-colors"
                                                        >
                                                            {expandedRow === act.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedRow === act.id && (
                                                    <tr className="bg-industrial-900/50">
                                                        <td colSpan={6} className="px-6 py-4 border-l-4 border-accent-primary">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-industrial-500 uppercase mb-2">Descripción Completa</h4>
                                                                    <p className="text-industrial-200 leading-relaxed">{act.description}</p>
                                                                </div>
                                                                {act.novedad && (
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-amber-500 uppercase mb-2 flex items-center gap-2">
                                                                            <AlertTriangle className="w-3 h-3" /> Novedad Reportada
                                                                        </h4>
                                                                        <p className="text-industrial-200 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                                                                            {act.novedad}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <div className="col-span-2 flex gap-6 mt-2 text-xs text-industrial-400 border-t border-industrial-700 pt-3">
                                                                    <div><span className="font-semibold">OS:</span> {act.os || 'N/A'}</div>
                                                                    <div><span className="font-semibold">Duración:</span> {act.duration_minutes ? `${act.duration_minutes} min` : 'N/A'}</div>
                                                                    <div><span className="font-semibold">Tipo:</span> {act.work_type}</div>
                                                                    <div><span className="font-semibold">Especialidad:</span> {act.specialty}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    )
}
