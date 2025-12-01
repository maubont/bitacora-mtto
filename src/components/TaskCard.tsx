import { Calendar, User, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

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

interface TaskCardProps {
    task: Task
    onEdit: (task: Task) => void
    onStatusChange: (taskId: string, newStatus: string) => void
    isSupervisor: boolean
}

export default function TaskCard({ task, onEdit, onStatusChange, isSupervisor }: TaskCardProps) {
    const priorityColors = {
        Alta: 'text-red-500 bg-red-500/10 border-red-500/20',
        Media: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        Baja: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    }

    const statusColors = {
        'Pendiente': 'text-gray-400 bg-gray-500/10 border-gray-500/20',
        'En Progreso': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        'Completado': 'text-green-400 bg-green-500/10 border-green-500/20'
    }

    return (
        <div className="bg-industrial-800 rounded-xl border border-industrial-700 p-4 shadow-lg hover:shadow-xl transition-shadow group relative">
            <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${priorityColors[task.priority] || priorityColors.Media}`}>
                    {task.priority}
                </span>
                {isSupervisor && (
                    <button
                        onClick={() => onEdit(task)}
                        className="text-industrial-400 hover:text-white text-xs underline opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        Editar
                    </button>
                )}
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{task.title}</h3>
            <p className="text-industrial-400 text-sm mb-4 line-clamp-2">{task.description}</p>

            <div className="space-y-2 text-xs text-industrial-300 mb-4">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-industrial-500">Equipo:</span>
                    {task.equipment}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-industrial-500">Área:</span>
                    {task.area}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-industrial-700">
                <div className="flex items-center gap-2 text-industrial-400 text-xs">
                    <User className="w-3 h-3" />
                    {task.profiles?.full_name || 'Sin asignar'}
                </div>
                {task.due_date && (
                    <div className="flex items-center gap-2 text-industrial-400 text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                    </div>
                )}
            </div>

            <div className="mt-4 flex gap-2">
                {task.status !== 'Pendiente' && (
                    <button
                        onClick={() => onStatusChange(task.id, 'Pendiente')}
                        className="flex-1 py-1.5 rounded bg-industrial-700 hover:bg-industrial-600 text-xs text-white transition-colors"
                    >
                        Pendiente
                    </button>
                )}
                {task.status !== 'En Progreso' && (
                    <button
                        onClick={() => onStatusChange(task.id, 'En Progreso')}
                        className="flex-1 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs transition-colors border border-blue-500/30"
                    >
                        Iniciar
                    </button>
                )}
                {task.status !== 'Completado' && (
                    <button
                        onClick={() => onStatusChange(task.id, 'Completado')}
                        className="flex-1 py-1.5 rounded bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs transition-colors border border-green-500/30"
                    >
                        Completar
                    </button>
                )}
            </div>
        </div>
    )
}
