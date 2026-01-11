'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Chatbot: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
        { role: 'assistant', text: '¡Hola! Soy el asistente virtual de **Hipatia**. ¿Cómo puedo ayudarte hoy?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isChatOpen) scrollToBottom();
    }, [messages, isChatOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = inputMessage;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInputMessage('');
        setIsTyping(true);
        setMessages(prev => [...prev, { role: 'assistant', text: '...' }]);

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_CHAT || 'https://n8n-n8n.ehqtcd.easypanel.host/webhook/chat-hipatia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await response.json();
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs.pop();
                return [...newMsgs, { role: 'assistant', text: data.text || 'No he podido procesar tu solicitud.' }];
            });
        } catch (error) {
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs.pop();
                return [...newMsgs, { role: 'assistant', text: 'Error de conexión con el servidor.' }];
            });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
            {isChatOpen && (
                <div className="glass shadow-2xl w-[90vw] md:w-[380px] h-[550px] rounded-[24px] flex flex-col overflow-hidden animate-in zoom-in-95 origin-bottom-right">
                    <div className="p-5 bg-indigo-600 text-white flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/50 flex items-center justify-center backdrop-blur-md shadow-inner">
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm tracking-tight">Asistente Hipatia</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    <p className="text-[10px] opacity-90 uppercase tracking-widest font-black">En línea</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="hover:rotate-90 transition-transform p-1">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-white/40 backdrop-blur-sm custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/90 border border-slate-100 text-slate-800 rounded-tl-none font-medium'}`}>
                                    <ReactMarkdown className="prose prose-sm prose-slate prose-indigo leading-relaxed">{msg.text}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-2">
                        <input 
                            value={inputMessage} 
                            onChange={(e) => setInputMessage(e.target.value)} 
                            placeholder="¿Cómo funciona el módulo auditor?" 
                            className="flex-1 h-12 px-5 bg-slate-50/50 rounded-xl outline-none focus:bg-white focus:ring-2 ring-indigo-100 border border-slate-100 transition-all text-sm font-medium" 
                        />
                        <button 
                            disabled={!inputMessage.trim() || isTyping} 
                            className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
            
            <button 
                onClick={() => setIsChatOpen(!isChatOpen)} 
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 relative group ${isChatOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
                {!isChatOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                    </span>
                )}
                {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
};

export default Chatbot;
