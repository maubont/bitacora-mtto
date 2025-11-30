import { useRegisterSW } from 'virtual:pwa-register/react'

export default function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    return (
        <div className="Container">
            {(offlineReady || needRefresh) && (
                <div className="fixed bottom-4 right-4 z-50 p-4 bg-industrial-800 border border-accent-primary rounded-lg shadow-2xl flex flex-col gap-3 max-w-sm animate-in slide-in-from-bottom-5">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-accent-primary">
                            {offlineReady ? '¡Listo para trabajar offline!' : 'Nueva versión disponible'}
                        </h3>
                        <p className="text-sm text-industrial-300">
                            {offlineReady
                                ? 'La aplicación ha sido guardada en tu dispositivo y funcionará sin internet.'
                                : 'Hay una nueva actualización disponible. Haz clic en actualizar para obtener las últimas mejoras.'}
                        </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                        {needRefresh && (
                            <button
                                className="px-3 py-1.5 bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-medium rounded transition-colors"
                                onClick={() => updateServiceWorker(true)}
                            >
                                Actualizar
                            </button>
                        )}
                        <button
                            className="px-3 py-1.5 bg-industrial-700 hover:bg-industrial-600 text-industrial-100 text-sm font-medium rounded transition-colors"
                            onClick={() => close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
