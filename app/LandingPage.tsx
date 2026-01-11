import React, { useState } from 'react';
import { Search, Zap, ChevronRight, Lock, CheckCircle, Shield, Award, BarChart3, Mail, BookOpen, LayoutGrid } from 'lucide-react';

interface LandingPageProps {
    onLogin: (token: string) => void;
    onLogout: () => void;
    isLoggedIn: boolean;
    onSelectAuditor: () => void;
    onSelectForgeUniversal: () => void;
    onSelectForgeSpecialist: () => void;
    onShowSample: () => void;
}

// --- SCROLL & REVEAL LOGIC ---
import ReactMarkdown from 'react-markdown';
// Custom hook for scroll reveal
const useScrollReveal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return { ref, isVisible };
};

const RevealSection: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => {
    const { ref, isVisible } = useScrollReveal();
    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} ${className}`}
        >
            {children}
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onLogout, isLoggedIn, onSelectAuditor, onSelectForgeUniversal, onSelectForgeSpecialist, onShowSample }) => {
    const [tokenInput, setTokenInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [viewMode, setViewMode] = useState<'main' | 'forge-selection'>('main');

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!tokenInput.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('https://n8n-n8n.ehqtcd.easypanel.host/webhook/login-uclm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_token: tokenInput })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            if (data.autorizado) {
                onLogin(tokenInput);
            } else {
                setErrorMessage('Código no válido o usuario inactivo');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('Error de conexión. Inténtelo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- SCROLL & REVEAL LOGIC ---
    const [showChat, setShowChat] = useState(false);

    // START CHATBOT STATE
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
        { role: 'assistant', text: '¡Hola! Soy el asistente virtual de Hipatia. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages, isChatOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = inputMessage;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInputMessage('');
        setIsTyping(true);
        // Add placeholder loading bubble
        setMessages(prev => [...prev, { role: 'assistant', text: '...' }]);

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_CHAT || 'https://n8n-n8n.ehqtcd.easypanel.host/webhook/chat-hipatia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await response.json();

            // Remove loading bubble and add real response
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs.pop(); // remove '...'
                return [...newMsgs, { role: 'assistant', text: data.text || 'Lo siento, no he podido procesar tu respuesta.' }];
            });
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs.pop();
                return [...newMsgs, { role: 'assistant', text: '**Error de conexión:** No he podido conectar con el servidor. Por favor, inténtalo de nuevo en unos instantes.' }];
            });
        } finally {
            setIsTyping(false);
        }
    };
    // END CHATBOT STATE

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        const windowHeight = window.innerHeight;

        // Show chat button if we scrolled past 20% or if chat is open
        if (scrollTop > windowHeight * 0.2 || isChatOpen) {
            setShowChat(true);
        } else {
            // Only hide if chat is closed
            if (!isChatOpen) setShowChat(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div
                className="flex-1 bg-white h-screen overflow-y-auto overflow-x-hidden font-inter relative scroll-smooth"
                onScroll={handleScroll}
            >
                {/* --- HERO SECTION (100vh) --- */}
                <section id="top" className="min-h-screen flex flex-col items-center justify-center p-6 relative">
                    {/* Background Decor */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/30 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
                        {/* Left Column: Sales Pitch */}
                        <div className="space-y-8 text-center lg:text-left animate-fade-in-up">
                            {/* Logo / Header Link */}
                            <a href="#top" className="inline-flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity">
                                <div className="bg-emerald-600 text-white p-1 rounded font-bold text-xs">H</div>
                                <span className="font-bold text-stone-900 tracking-tight">HIPATIA</span>
                            </a>

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-indigo-100 mb-2">
                                <Shield size={14} className="text-emerald-600" />
                                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest">Plataforma Docente Segura</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black font-serif text-stone-900 leading-[0.9] tracking-tight">
                                Revoluciona tu <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-900">Evaluación</span>
                            </h1>

                            <p className="text-lg text-stone-500 font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
                                <strong className="text-stone-700">HIPAT<span className="text-emerald-600">IA</span> <span className="text-[10px] align-top bg-slate-100 text-stone-500 px-1 py-0.5 rounded font-bold ml-0.5 border border-stone-200">BETA</span></strong> es el ecosistema definitivo para generar exámenes accesibles y corregir evidencias manuscritas con Inteligencia Artificial.
                            </p>

                            <div className="flex flex-col gap-4 max-w-sm mx-auto lg:mx-0">
                                <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-stone-100 shadow-sm">
                                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><CheckCircle size={18} /></div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-stone-800 text-sm">Corrección de Exámenes</h4>
                                        <p className="text-xs text-stone-400">Tu asistente de corrección experta.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-stone-100 shadow-sm">
                                    <div className="bg-teal-100 p-2 rounded-lg text-teal-600"><Zap size={18} /></div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-stone-800 text-sm">Generación de Exámenes</h4>
                                        <p className="text-xs text-stone-400">Crea exámenes en segundos con IA.</p>
                                    </div>
                                </div>
                                {/* Links moved to be less prominent or integrated */}
                            </div>
                        </div>

                        {/* Right Column: Login Card */}
                        <div className="flex justify-center lg:justify-end animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            <div className="bg-white p-8 md:p-10 rounded-md shadow-xl shadow-indigo-900/10 border border-stone-100 w-full max-w-md relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

                                <div className="mb-8 text-center">
                                    <div className="w-16 h-16 bg-stone-50 rounded-lg flex items-center justify-center mx-auto mb-4 text-stone-400">
                                        <Lock size={28} />
                                    </div>
                                    <h2 className="text-2xl font-black font-serif text-stone-900 mb-2">Acceso Docente</h2>
                                    <p className="text-stone-400 text-sm font-medium">Introduce tu token corporativo</p>
                                </div>

                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            autoFocus
                                            className={`w-full h-14 px-4 bg-stone-50 border-2 rounded-md focus:bg-white outline-none transition-all text-center text-lg font-bold text-stone-800 tracking-widest placeholder:text-stone-300 placeholder:font-normal placeholder:tracking-normal
                                                ${errorMessage ? 'border-rose-300 focus:border-rose-500' : 'border-stone-100 focus:border-indigo-500'}`}
                                            placeholder="TOKEN_ID"
                                            value={tokenInput}
                                            onChange={(e) => {
                                                setTokenInput(e.target.value);
                                                if (errorMessage) setErrorMessage('');
                                            }}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {errorMessage && (
                                        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold p-3 rounded-lg text-center animate-in shake">
                                            {errorMessage}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading || !tokenInput.trim()}
                                        className={`w-full h-14 font-bold rounded-md shadow-lg transition-all flex items-center justify-center gap-2 group
                                            ${isLoading ? 'bg-slate-200 text-stone-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02]'}`}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-stone-400 border-t-white rounded-full animate-spin"></span>
                                                VALIDANDO...
                                            </span>
                                        ) : (
                                            <>
                                                <span>ENTRAR AL SISTEMA</span>
                                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 text-center flex flex-col gap-2">
                                    <a href="/blog" className="text-xs font-bold text-stone-400 hover:text-teal-600 transition-colors">
                                        Explora el Blog de Hipatia
                                    </a>
                                    <a href="/contacto" className="text-xs font-bold text-stone-400 hover:text-emerald-600 transition-colors">
                                        ¿Necesitas ayuda? Contactar soporte
                                    </a>
                                    <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest mt-2">
                                        HIPAT<span className="text-emerald-600">IA</span> Ecosistema v4.0
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SECCIÓN 1: JUSTICIA ACADÉMICA --- */}
                <section className="py-16 px-6 bg-white border-t border-stone-100">
                    <RevealSection className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black font-serif text-stone-900 leading-tight">
                                Cero errores gracias a nuestra <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-900">verificación en 3 capas</span>
                            </h2>
                            <p className="text-lg text-stone-500 font-medium leading-relaxed">
                                Un sistema de auditoría multicapa que garantiza la equidad en cada corrección.
                            </p>

                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 bg-stone-100 rounded-md flex items-center justify-center shrink-0">
                                        <Search className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-900 text-lg">1. El Juez (Análisis)</h4>
                                        <p className="text-stone-500">Lectura OCR y extracción de evidencias crudas.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 bg-violet-50 rounded-md flex items-center justify-center shrink-0">
                                        <CheckCircle className="text-teal-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-900 text-lg">2. El Auditor (Rúbrica)</h4>
                                        <p className="text-stone-500">Contraste estricto con los criterios de evaluación.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 bg-stone-100 rounded-md flex items-center justify-center shrink-0">
                                        <Award className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-900 text-lg">3. Tribunal Supremo (Informe)</h4>
                                        <p className="text-stone-500">Redacción pedagógica de la justificación final.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="relative group w-full max-w-[300px] mx-auto">
                            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg opacity-20 group-hover:opacity-30 blur-xl transition-all"></div>
                            <img
                                src="/blog-triple-consenso.jpg.png"
                                alt="Triple Consenso Workflow"
                                className="relative rounded-lg shadow-xl border-4 border-white transform group-hover:scale-[1.01] transition-transform duration-500 w-full"
                            />
                        </div>
                    </RevealSection>
                </section>

                {/* --- SECCIÓN 2: SEGURIDAD JURÍDICA --- */}
                <section className="py-16 px-6 bg-stone-50/50">
                    <RevealSection className="w-full max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black font-serif text-stone-900 leading-tight">
                                Informes <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-900">irrefutables</span>:<br />
                                Tu escudo ante las reclamaciones
                            </h2>
                            <p className="text-xl text-stone-500 font-medium max-w-2xl mx-auto">
                                Trazabilidad total entre la rúbrica, la evidencia del examen y el feedback final.
                            </p>
                        </div>

                        <div className="relative inline-block w-full max-w-[300px] mx-auto">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-700/20 rounded-full blur-[120px]"></div>
                            <img
                                src="/imagen articulo 5.png"
                                alt="Hipatia Informes"
                                className="relative rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-200 w-full"
                            />
                        </div>
                    </RevealSection>
                </section>

                {/* --- SECCIÓN 3: CARACTERÍSTICAS TÉCNICAS --- */}
                <section className="py-16 px-6 bg-white">
                    <RevealSection className="w-full max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Feature 1 */}
                            <div className="text-center space-y-6 group p-6 rounded-3xl hover:bg-stone-50 transition-colors">
                                <div className="w-24 h-24 mx-auto mb-6 relative">
                                    <div className="absolute inset-0 bg-emerald-100/50 rounded-full blur-xl group-hover:bg-emerald-200/50 transition-all"></div>
                                    <img src="/icon-ocr.png" alt="OCR" className="relative w-full h-full object-contain p-2" />
                                </div>
                                <h3 className="text-2xl font-black font-serif text-stone-900">OCR de Precisión</h3>
                                <p className="text-stone-500 font-medium leading-relaxed">
                                    Lectura inteligente de caligrafía manuscrita, incluso en condiciones de baja legibilidad.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="text-center space-y-6 group p-6 rounded-3xl hover:bg-stone-50 transition-colors">
                                <div className="w-24 h-24 mx-auto mb-6 relative">
                                    <div className="absolute inset-0 bg-teal-100/50 rounded-full blur-xl group-hover:bg-violet-200/50 transition-all"></div>
                                    <img src="/icon-privacy.png" alt="Privacy" className="relative w-full h-full object-contain p-2" />
                                </div>
                                <h3 className="text-2xl font-black font-serif text-stone-900">Privacidad Blindada</h3>
                                <p className="text-stone-500 font-medium leading-relaxed">
                                    Anonimización automática de datos sensibles y cumplimiento estricto con la LOPD.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="text-center space-y-6 group p-6 rounded-3xl hover:bg-stone-50 transition-colors">
                                <div className="w-24 h-24 mx-auto mb-6 relative">
                                    <div className="absolute inset-0 bg-emerald-100/50 rounded-full blur-xl group-hover:bg-emerald-200/50 transition-all"></div>
                                    <img src="/icon-cloud.png" alt="Cloud" className="relative w-full h-full object-contain p-2" />
                                </div>
                                <h3 className="text-2xl font-black font-serif text-stone-900">Sincronización Cloud</h3>
                                <p className="text-stone-500 font-medium leading-relaxed">
                                    Acceso multidispositivo a tus informes desde cualquier lugar y en cualquier momento.
                                </p>
                            </div>
                        </div>
                    </RevealSection>
                </section>

                {/* --- CHATBOT WIDGET --- */}
                {showChat && (
                    <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-10 flex flex-col items-end gap-4">

                        {/* Chat Interface Window */}
                        {isChatOpen && (
                            <div className="bg-white w-[350px] md:w-[400px] h-[500px] rounded-lg shadow-xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 origin-bottom-right mb-2">
                                {/* Chat Header */}
                                <div className="p-4 bg-slate-900 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black font-serif text-xs">
                                            H
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">Asistente Hipatia</h4>
                                            <p className="text-[10px] text-stone-300 font-medium">En línea • IA Educativa</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsChatOpen(false)}
                                        className="text-stone-400 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm
                                                ${msg.role === 'user'
                                                        ? 'bg-gradient-to-r from-emerald-700 to-teal-900 text-white rounded-tr-sm'
                                                        : 'bg-white border border-stone-200 text-stone-700 rounded-tl-sm prose prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0'}`}
                                            >
                                                {msg.text === '...' ? (
                                                    <div className="flex gap-1 h-5 items-center px-1">
                                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                                    </div>
                                                ) : (
                                                    <ReactMarkdown
                                                        components={{
                                                            a: ({ node, ...props }) => <a {...props} className="text-emerald-600 underline font-bold hover:text-emerald-700" target="_blank" rel="noopener noreferrer" />,
                                                            strong: ({ node, ...props }) => <strong {...props} className="font-black font-serif" />
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-100 flex gap-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Pregunta sobre Hipatia..."
                                        className="flex-1 bg-stone-50 border border-stone-200 rounded-md px-4 py-2 text-sm focus:bg-white focus:border-indigo-500 outline-none text-stone-700 placeholder:text-stone-400 transition-all font-medium"
                                        disabled={isTyping}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputMessage.trim() || isTyping}
                                        className="w-10 h-10 bg-slate-900 text-white rounded-md flex items-center justify-center hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-md"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Toggle Button */}
                        <div
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            className={`bg-white rounded-full shadow-xl p-4 border border-indigo-100 cursor-pointer hover:scale-110 transition-transform relative group
                            ${isChatOpen ? 'bg-slate-900 border-stone-800 text-white rotate-90' : 'text-emerald-600'}`}
                        >
                            {!isChatOpen && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                </span>
                            )}
                            <div className="w-8 h-8 flex items-center justify-center">
                                {isChatOpen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- DASHBOARD VIEW (LOGGED IN) ---
    return (
        <div className="flex-1 bg-stone-50 flex flex-col items-center p-6 font-inter overflow-hidden h-screen relative">

            {/* Header Bar */}
            <header className="w-full max-w-6xl flex justify-between items-center z-20 p-2">
                {/* FAQ & Contact Links */}
                <div className="flex items-center gap-4"><div className="flex items-center gap-2 mr-4 pb-0.5"><span className="text-lg font-black font-serif text-stone-700 tracking-tight">HIPAT<span className="text-emerald-600">IA</span></span><span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-bold border border-amber-200">BETA</span></div>
                    <a href="/blog" className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-stone-400 hover:text-emerald-600 transition-colors uppercase tracking-wider"><BookOpen size={14} /> Blog</a><a href="/preguntas-frecuentes"
                        className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-stone-400 hover:text-emerald-600 transition-colors uppercase tracking-wider"
                    >
                        <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-serif">?</div>
                        FAQ
                    </a>
                    <a
                        href="/contacto"
                        className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-stone-400 hover:text-teal-600 transition-colors uppercase tracking-wider"
                    >
                        <Mail size={14} />
                        Contacto
                    </a>
                </div>

                {/* Navigation Actions */}<div className="flex items-center gap-3">{viewMode !== "main" && (<button onClick={() => setViewMode("main")} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-500 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-all uppercase tracking-wider"><LayoutGrid size={14} /> Apps</button>)}
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-md shadow-sm text-xs font-bold text-stone-500 hover:bg-slate-100 hover:text-stone-700 hover:border-stone-300 transition-all uppercase tracking-wider"
                >
                    <Lock size={14} />
                    Cerrar Sesión
                </button>
            </header>

            <div className="flex-1 flex flex-col items-center justify-start pt-12 w-full max-w-6xl overflow-y-auto custom-scrollbar">
                {/* Branding Central - Hero Style */}
                <div className="text-center mb-12 animate-fade-in-up space-y-4 shrink-0 px-4">
                    <h1 className="text-5xl md:text-6xl font-black font-serif text-stone-900 leading-[1.15] tracking-tight pb-2">
                        Centraliza, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-900">Potencia</span> y Simplifica
                    </h1>
                    <p className="text-stone-500 font-medium text-xl md:text-2xl max-w-2xl mx-auto">
                        Tu ecosistema integral para la gestión educativa inteligente y la corrección asistida por IA.
                    </p>
                    <div className="pt-4">
                        <button
                            onClick={onShowSample}
                            className="px-6 py-2 bg-stone-100 text-emerald-700 font-bold rounded-full text-sm hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm"
                        >
                            ✨ Ver Informe de Ejemplo (Simulación)
                        </button>
                    </div>
                </div>

                {/* Layout de Selección */}
                {viewMode === 'main' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl animate-fade-in-up md:h-[400px]">
                        {/* Tarjeta Izquierda (Auditor) */}
                        <button
                            onClick={onSelectAuditor}
                            className="group bg-white rounded-lg border border-stone-200 p-8 shadow-soft hover:shadow-xl hover:border-indigo-400 transition-all duration-300 text-left flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-14 h-14 bg-stone-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <Search className="h-7 w-7 text-emerald-600 group-hover:text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-stone-900 mb-2 uppercase">MÓDULO CORRECTOR</h2>
                                <p className="text-stone-500 font-medium">
                                    Sube fotos de los exámenes y obtén una corrección rigurosa.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-emerald-600 font-bold text-sm uppercase tracking-widest group-hover:gap-3 transition-all">
                                <span>Iniciar Corrección</span>
                                <ChevronRight className="h-4 w-4" />
                            </div>
                        </button>

                        {/* Tarjeta Derecha (Forge Entry) */}
                        <button
                            onClick={() => setViewMode('forge-selection')}
                            className="group bg-white rounded-lg border border-stone-200 p-8 shadow-soft hover:shadow-xl hover:border-violet-400 transition-all duration-300 text-left flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-14 h-14 bg-violet-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white transition-all">
                                    <Zap className="h-7 w-7 text-teal-600 group-hover:text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-stone-900 mb-2 uppercase">MÓDULO GENERADOR</h2>
                                <p className="text-stone-500 font-medium">
                                    Herramientas de generación de exámenes y recursos.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-teal-600 font-bold text-sm uppercase tracking-widest group-hover:gap-3 transition-all">
                                <span>Seleccionar Herramienta</span>
                                <ChevronRight className="h-4 w-4" />
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl animate-in slide-in-from-right duration-300">
                        <div className="flex items-center gap-2 mb-6 cursor-pointer text-stone-400 hover:text-stone-600 transition-colors w-fit" onClick={() => setViewMode('main')}>
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span className="text-xs font-bold uppercase tracking-widest">Volver</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:h-[350px]">
                            {/* Forge Universal */}
                            <button
                                onClick={onSelectForgeUniversal}
                                className="group bg-white rounded-lg border border-stone-200 p-8 shadow-soft hover:shadow-xl hover:border-violet-400 transition-all duration-300 text-left flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
                                <div>
                                    <div className="w-12 h-12 bg-violet-50 rounded-md flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:text-white transition-all">
                                        <BarChart3 className="h-6 w-6 text-teal-600 group-hover:text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-stone-900 mb-1 uppercase tracking-tight">MODO GENERAL</h2>
                                    <p className="text-xs text-stone-500 font-medium leading-relaxed">
                                        Cualquier asignatura. Sube tus apuntes y crea un examen a medida.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-4 text-teal-600 font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                                    <span>Crear Genérico</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                            </button>

                            {/* Forge Especialista */}
                            <button
                                onClick={onSelectForgeSpecialist}
                                className="group bg-stone-50 rounded-lg border border-stone-200 p-8 shadow-sm hover:shadow-lg hover:border-stone-300 transition-all duration-300 text-left flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-slate-300"></div>
                                <div>
                                    <div className="w-12 h-12 bg-white border border-stone-200 rounded-md flex items-center justify-center mb-4 group-hover:border-stone-400 transition-all">
                                        <Award className="h-6 w-6 text-stone-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-stone-900 mb-2">Forge Especialista</h2>
                                    <p className="text-stone-500 text-sm leading-relaxed">
                                        Historia de España (PAU). Basado en estándares oficiales.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-4 text-stone-600 font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                                    <span>Crear PAU</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] shrink-0">
                    HIPAT<span className="text-emerald-500">IA</span> Ecosistema v4.0 • More human than human
                </div>
            </div>
        </div>
    );
};

export default LandingPage;


