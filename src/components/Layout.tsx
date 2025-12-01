import Navigation from './Navigation'
import { Toaster } from 'sonner'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex min-h-screen bg-industrial-900">
            <Toaster position="top-right" theme="dark" richColors />
            <Navigation />

            {/* Main Content */}
            <main className="flex-1 md:overflow-y-auto pb-20 md:pb-0">
                {children}
            </main>
        </div>
    )
}
