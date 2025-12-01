import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import { Plus, Filter, Loader2 } from 'lucide-react'

interface Task {
    id: string
    title: string
    description: string
    area: string
    equipment: string
    priority: 'Alta' | 'Media' | 'Baja'
    status: 'Pendiente' | 'En Progreso' | 'Completado'
    due_date: string | null
    assigned_to: string | null
    profiles?: {
        full_name: string
    }
}

export default function PendingTasks() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState('Todos')
    const [showMyTasksOnly, setShowMyTasksOnly] = useState(false)

    useEffect(() => {
        checkUser()
        fetchTasks()
    }, [])

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUserId(user.id)
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            setUserRole(data?.role || null)
        }
    }

    const fetchTasks = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                profiles:assigned_to (full_name)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tasks:', error)
        } else {
            setTasks(data || [])
        }
        setLoading(false)
    }

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', taskId)

        if (error) {
            console.error('Error updating status:', error)
            alert('Error al actualizar estado')
        } else {
            fetchTasks()
        }
    }

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'Todos' || task.status === filterStatus
        const matchesAssignee = showMyTasksOnly ? task.assigned_to === userId : true
        return matchesStatus && matchesAssignee
    })

    const isSupervisor = userRole === 'supervisor' || userRole === 'admin'

    return (
        <Layout>
            <div className="min-h-screen bg-industrial-900 text-industrial-100">
                <header className="bg-industrial-800 border-b border-industrial-700 p-4 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-2xl font-bold text-white">Tareas Pendientes</h1>

                        {isSupervisor && (
                            <button
                                onClick={() => {
                                    setEditingTask(null)
                                    setIsModalOpen(true)
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-industrial-900 font-bold rounded-lg transition-colors shadow-lg shadow-accent-primary/20"
                            >
                                <Plus className="w-5 h-5" />
                                Nueva Tarea
                            </button>
                        )}
                    </div>
                </header>

                <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                    {/* Filtros */}
                    <div className="flex flex-col md:flex-row gap-4 bg-industrial-800/50 p-4 rounded-xl border border-industrial-700/50">
                        <div className="flex items-center gap-2 text-industrial-400">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Filtros:</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {['Todos', 'Pendiente', 'En Progreso', 'Completado'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                        ${filterStatus === status
                                            ? 'bg-industrial-600 text-white'
                                            : 'bg-industrial-900 text-industrial-400 hover:text-white'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-industrial-300 hover:text-white">
                                <input
                                    type="checkbox"
                                    checked={showMyTasksOnly}
                                    onChange={(e) => setShowMyTasksOnly(e.target.checked)}
                                    className="rounded border-industrial-600 bg-industrial-900 text-accent-primary focus:ring-accent-primary"
                                />
                                Mis Tareas Asignadas
                            </label>
                        </div>
                    </div>

                    {/* Lista de Tareas */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-12 bg-industrial-800/30 rounded-xl border border-industrial-700/30 border-dashed">
                            <p className="text-industrial-500">No hay tareas pendientes con estos filtros.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onEdit={(t) => {
                                        setEditingTask(t)
                                        setIsModalOpen(true)
                                    }}
                                    onStatusChange={handleStatusChange}
                                    isSupervisor={isSupervisor}
                                />
                            ))}
                        </div>
                    )}
                </main>

                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onTaskSaved={fetchTasks}
                    taskToEdit={editingTask}
                />
            </div>
        </Layout>
    )
}
