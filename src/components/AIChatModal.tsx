import { useState, useEffect, useRef } from 'react'
import { generateStructuredActivityLog } from '../lib/openai'

interface AIChatModalProps {
    isOpen: boolean
    onClose: () => void
    onApply: (description: string, novedad: string | null) => void
    context: {
        area: string
        equipment: string
        specialty: string
        workType: string
        os?: string
    }
    initialDescription?: string
}

interface Message {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export default function AIChatModal({ isOpen, onClose, onApply, context, initialDescription }: AIChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [generatedData, setGeneratedData] = useState<{ description: string | null, novedad: string | null } | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const initialized = useRef(false)

    useEffect(() => {
        if (isOpen && !initialized.current) {
            initialized.current = true

            if (initialDescription && initialDescription.trim()) {
                // If there is an initial description, send it immediately
                handleSend(initialDescription)
            } else {
                // Otherwise, show greeting
                setMessages([
                    {
                        role: 'assistant',
                        content: `Hola, veo que trabajaste en **${context.equipment}** (${context.area}). ¿Qué actividad realizaste?`
                    }
                ])
            }
        }

        // Reset initialization when closed
        if (!isOpen) {
            setMessages([])
            setGeneratedData(null)
            initialized.current = false
        }
    }, [isOpen, context, initialDescription])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input
        if (!textToSend.trim()) return

        const userMsg: Message = { role: 'user', content: textToSend }
        setMessages(prev => [...prev, userMsg])
        if (!textOverride) setInput('')
        setLoading(true)

        try {
            // Use current messages + the new user message for history
            // Note: state updates are async, so we construct the history manually here
            const currentHistory = messages.map(m => ({ role: m.role, content: m.content }))

            const result = await generateStructuredActivityLog(context, textToSend, currentHistory)

            const assistantMsg: Message = { role: 'assistant', content: result.reply }
            setMessages(prev => [...prev, assistantMsg])

            if (result.description) {
                setGeneratedData({ description: result.description, novedad: result.novedad })
            }
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu mensaje. Verifica tu conexión o intenta de nuevo.' }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-industrial-800 w-full max-w-lg rounded-2xl shadow-2xl border border-industrial-600 flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-4 border-b border-industrial-700 flex justify-between items-center bg-industrial-900/50 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                            <span className="text-accent-primary text-lg">✨</span>
                        </div>
                        <h3 className="text-lg font-bold text-industrial-100">Asistente de Bitácora</h3>
                    </div>
                    <button onClick={onClose} className="text-industrial-400 hover:text-white">
                        ✕
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-3 ${msg.role === 'user'
                                    ? 'bg-accent-primary text-white rounded-tr-none'
                                    : 'bg-industrial-700 text-industrial-100 rounded-tl-none'
                                }`}>
                                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-industrial-700 rounded-2xl p-3 rounded-tl-none flex gap-1">
                                <span className="w-2 h-2 bg-industrial-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-industrial-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-industrial-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Preview & Action */}
                {generatedData && (
                    <div className="p-3 bg-emerald-900/20 border-t border-emerald-500/30 mx-4 mb-2 rounded-lg">
                        <p className="text-xs text-emerald-400 font-bold mb-1">RESUMEN GENERADO:</p>
                        <p className="text-xs text-industrial-300 line-clamp-2">{generatedData.description}</p>
                        {generatedData.novedad && (
                            <p className="text-xs text-blue-400 mt-1">Novedad: {generatedData.novedad}</p>
                        )}
                        <button
                            onClick={() => onApply(generatedData.description!, generatedData.novedad)}
                            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm py-2 rounded transition-colors"
                        >
                            Confirmar y Usar
                        </button>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-industrial-700 bg-industrial-900/30 rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe o dicta tu actividad..."
                            className="flex-1 bg-industrial-950 border border-industrial-600 rounded-xl px-4 py-3 text-industrial-100 focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            className="bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all"
                        >
                            ➤
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
