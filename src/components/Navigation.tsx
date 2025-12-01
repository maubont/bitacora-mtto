import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FileText, LayoutDashboard, CheckSquare, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

interface NavItem {
    icon: typeof FileText
    label: string
    path: string
    adminOnly?: boolean
}

const navItems: NavItem[] = [
    { icon: FileText, label: 'Registro', path: '/technician' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/supervisor', adminOnly: true },
    { icon: CheckSquare, label: 'Pendientes', path: '/tasks', adminOnly: true }
]

export default function Navigation() {
    const navigate = useNavigate()
    const location = useLocation()
    const [userRole, setUserRole] = useState<string>('technician')

    useEffect(() => {
        fetchUserRole()
    }, [])

    const fetchUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            if (data) setUserRole(data.role || 'technician')
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const visibleItems = navItems.filter(item =>
        !item.adminOnly || userRole === 'admin' || userRole === 'supervisor'
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-industrial-800 border-r border-industrial-700 min-h-screen">
                {/* Logo */}
                <div className="p-6 border-b border-industrial-700">
                    <h1 className="text-2xl font-bold text-accent-primary">Bitácora Mtto</h1>
                    <p className="text-xs text-industrial-500 mt-1">Extractora La Gloria</p>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-2">
                    {visibleItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                                        : 'text-industrial-300 hover:bg-industrial-700 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-industrial-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-industrial-400 hover:bg-industrial-700 hover:text-white transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-industrial-800 border-t border-industrial-700 z-50 safe-area-inset-bottom">
                <div className="flex justify-around items-center px-2 py-3">
                    {visibleItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${isActive
                                        ? 'text-accent-primary'
                                        : 'text-industrial-400'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        )
                    })}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-industrial-400"
                    >
                        <LogOut className="w-6 h-6" />
                        <span className="text-xs font-medium">Salir</span>
                    </button>
                </div>
            </nav>
        </>
    )
}
