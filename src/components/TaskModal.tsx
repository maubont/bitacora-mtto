import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Save } from 'lucide-react'

interface TaskModalProps {
    isOpen: boolean
    onClose: () => void
    onTaskSaved: () => void
    taskToEdit?: any
}

export default function TaskModal({ isOpen, onClose, onTaskSaved, taskToEdit }: TaskModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [area, setArea] = useState('')
    const [equipment, setEquipment] = useState('')
    const [priority, setPriority] = useState('Media')
    const [assignedTo, setAssignedTo] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [technicians, setTechnicians] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchTechnicians()
            if (taskToEdit) {
                setTitle(taskToEdit.title)
                setDescription(taskToEdit.description || '')
                setArea(taskToEdit.area || '')
                setEquipment(taskToEdit.equipment || '')
                setPriority(taskToEdit.priority)
                setAssignedTo(taskToEdit.assigned_to || '')
                setDueDate(taskToEdit.due_date || '')
            } else {
                resetForm()
            }
        }
    }, [isOpen, taskToEdit])

    const fetchTechnicians = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'technician')
        setTechnicians(data || [])
    }

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setArea('')
        setEquipment('')
        setPriority('Media')
        setAssignedTo('')
        setDueDate('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const taskData = {
            title,
            description,
            area,
            equipment,
            priority,
            assigned_to: assignedTo || null,
            due_date: dueDate || null
        }

        try {
            if (taskToEdit) {
                const { error } = await supabase
                    .from('tasks')
                    .update(taskData)
                    .eq('id', taskToEdit.id)
                if (error) throw error
            } else {
                const { data: { user } } = await supabase.auth.getUser()
                const { error } = await supabase
                    .from('tasks')
                    .insert({
                        ...taskData,
                        created_by: user?.id,
                        status: 'Pendiente'
                    })
                if (error) throw error
            }
            onTaskSaved()
            onClose()
        } catch (error) {
            console.error('Error saving task:', error)
            alert('Error al guardar la tarea')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-industrial-800 rounded-xl border border-industrial-700 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-industrial-700">
                    <h2 className="text-xl font-bold text-white">
                        {taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}
                    </h2>
                    <button onClick={onClose} className="text-industrial-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-industrial-300 mb-1">Título</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-industrial-900 border border-industrial-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-primary outline-none"
                            placeholder="Ej: Reparar bomba de agua"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-industrial-300 mb-1">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-industrial-900 border border-industrial-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-primary outline-none h-24 resize-none"
                            placeholder="Detalles adicionales..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-industrial-300 mb-1">Área</label>
                            <input
                                type="text"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                className="w-full bg-industrial-900 border border-industrial-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-industrial-300 mb-1">Equipo</label>
                            <input
                                type="text"
                                value={equipment}
                                onChange={(e) => setEquipment(e.target.value)}
                                className="w-full bg-industrial-900 border border-industrial-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-industrial-300 mb-1">Prioridad</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full bg-industrial-900 border border-industrial-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-primary outline-none"
                            >
                                <option value="Baja">Baja</option>
                                <option value="Media">Media</option>
                                <option value="Alta">Alta</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-industrial-300 mb-1">Fecha Límite</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-industrial-900 border border-industrial-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-industrial-300 mb-1">Asignar a Técnico</label>
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full bg-industrial-900 border border-industrial-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-primary outline-none"
                        >
                            <option value="">-- Sin asignar --</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-industrial-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-industrial-300 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-industrial-900 font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Guardando...' : 'Guardar Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
