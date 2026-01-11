import React, { useState } from "react";
import { Search, Zap, ChevronRight, Lock, CheckCircle, Shield, Award, BarChart3, Mail, BookOpen, LayoutGrid } from "lucide-react";

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
            className={`transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"} ${className}`}
        >
            {children}
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onLogout, isLoggedIn, onSelectAuditor, onSelectForgeUniversal, onSelectForgeSpecialist, onShowSample }) => {
    const [tokenInput, setTokenInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [viewMode, setViewMode] = useState<"main" | "forge">("main"); // "main" = Module Selector, "forge" = Generate Mode Selector

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLoginAttempt();
    };

    const handleLoginAttempt = async () => {
        if (!tokenInput.trim()) {
            setErrorMessage("Por favor, introduce tu token.");
            return;
        }

        setIsLoading(true);
        try {
            // In maintenance/beta, we accept any token or specific ones. 
            // For now specific connection logic:
            const response = await fetch("https://n8n-n8n.ehqtcd.easypanel.host/webhook/login-uclm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_token: tokenInput })
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();

            if (data.autorizado) {
                onLogin(tokenInput);
            } else {
                setErrorMessage("Código no válido o usuario inactivo");
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("Error de conexión. Inténtelo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        // Scroll logic if needed
    };

    if (!isLoggedIn) {
        return (
            <div
                className="flex-1 h-screen overflow-y-auto bg-stone-50 scroll-smooth font-sans custom-scrollbar"
                onScroll={handleScroll}
            >
                {/* --- HERO SECTION (100vh) --- */}
                <section id="top" className="min-h-screen flex flex-col items-center justify-center p-6 relative">
                    {/* Background Decor */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-100/30 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
                        {/* Left Column: Value Proposition */}
                        <div className="space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <Shield size={14} className="text-emerald-700" />
                                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-widest">Plataforma Docente Segura</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black font-serif text-stone-900 leading-[0.9] tracking-tight">
                                Revoluciona tu <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-900">Evaluación</span>
                            </h1>

                            <p className="text-lg text-stone-500 font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
                                <strong className="text-stone-700">HIPAT<span className="text-emerald-600">IA</span> <span className="text-[10px] align-top bg-stone-100 text-stone-500 px-1 py-0.5 rounded font-bold ml-0.5 border border-stone-200">BETA</span></strong> es el ecosistema definitivo para generar exámenes accesibles y corregir evidencias manuscritas con Inteligencia Artificial.
                            </p>

                            <div className="flex flex-col gap-4 max-w-sm mx-auto lg:mx-0">
                                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                                    <div className="bg-emerald-100 p-2 rounded-md text-emerald-700"><CheckCircle size={18} /></div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-stone-800 text-sm">Corrección de Exámenes</h4>
                                        <p className="text-xs text-stone-400">Tu asistente de corrección experta.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                                    <div className="bg-teal-100 p-2 rounded-md text-teal-700"><Zap size={18} /></div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-stone-800 text-sm">Generación de Exámenes</h4>
                                        <p className="text-xs text-stone-400">Crea exámenes en segundos con IA.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Login Card */}
                        <div className="flex justify-center lg:justify-end animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            <div className="bg-white p-8 md:p-10 rounded-xl shadow-xl border border-stone-200 w-full max-w-md relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 to-teal-700"></div>

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
                                            className={`w-full h-14 px-4 bg-stone-50 border-2 rounded-lg focus:bg-white outline-none transition-all text-center text-lg font-bold text-stone-800 tracking-widest placeholder:text-stone-300 placeholder:font-normal placeholder:tracking-normal
                                                ${errorMessage ? "border-rose-300 focus:border-rose-500" : "border-stone-200 focus:border-emerald-500"}`}
                                            placeholder="TOKEN_ID"
                                            value={tokenInput}
                                            onChange={(e) => {
                                                setTokenInput(e.target.value);
                                                if (errorMessage) setErrorMessage("");
                                            }}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {errorMessage && (
                                        <div className="text-rose-500 text-xs text-center font-bold animate-pulse">
                                            {errorMessage}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group"
                                    >
                                        {isLoading ? (
                                            <span className="animate-pulse">Validando...</span>
                                        ) : (
                                            <>
                                                <span>ENTRAR AL SISTEMA</span>
                                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                                <div className="mt-6 text-center">
                                    <button onClick={onShowSample} className="text-xs text-stone-400 hover:text-emerald-600 font-bold underline transition-colors">
                                        ✨ Ver Informe de Ejemplo (Simulación)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    // --- DASHBOARD VIEW (LOGGED IN) ---
    return (
        <div className="flex-1 bg-stone-50 flex flex-col items-center p-6 font-sans overflow-hidden h-screen relative">

            {/* Header Bar */}
            <header className="w-full max-w-6xl flex justify-between items-center z-20 p-2">
                <div className="flex items-center gap-4">
                    {/* Branding + BETA */}
                    <div className="flex items-center gap-2 mr-4 pb-0.5 select-none">
                        <span className="text-lg font-black font-serif text-stone-700 tracking-tight">HIPAT<span className="text-emerald-600">IA</span></span>
                        <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-bold border border-amber-200">BETA</span>
                    </div>

                    {/* Links */}
                    <a href="/blog" className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-stone-400 hover:text-emerald-600 transition-colors uppercase tracking-wider">
                        <BookOpen size={14} /> Blog
                    </a>
                    <a href="/preguntas-frecuentes" className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-stone-400 hover:text-emerald-600 transition-colors uppercase tracking-wider">
                        <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-serif">?</div>
                        FAQ
                    </a>
                    <a href="/contacto" className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-stone-400 hover:text-emerald-600 transition-colors uppercase tracking-wider">
                        <Mail size={14} />
                        Contacto
                    </a>
                </div>

                {/* Navigation Actions */}
                <div className="flex items-center gap-3">
                    {viewMode !== "main" && (
                        <button onClick={() => setViewMode("main")} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-500 hover:text-emerald-600 hover:bg-stone-100 rounded-lg transition-all uppercase tracking-wider">
                            <LayoutGrid size={14} /> Apps
                        </button>
                    )}
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-lg shadow-sm text-xs font-bold text-stone-500 hover:bg-stone-100 hover:text-stone-700 hover:border-stone-300 transition-all uppercase tracking-wider"
                    >
                        <Lock size={14} />
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-start pt-12 w-full max-w-6xl overflow-y-auto custom-scrollbar">

                {viewMode === "main" ? (
                    <>
                        {/* Branding Central - Hero Style */}
                        <div className="text-center mb-12 animate-fade-in-up space-y-4 shrink-0 px-4">
                            <h1 className="text-5xl md:text-6xl font-black font-serif text-stone-900 leading-[1.15] tracking-tight pb-2">
                                Centraliza, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-900">Potencia</span> y Simplifica
                            </h1>
                            <p className="text-stone-500 font-medium text-xl md:text-2xl max-w-2xl mx-auto">
                                Tu ecosistema integral para la gestión educativa inteligente y la corrección asistida por IA.
                            </p>
                        </div>

                        {/* Module Selection Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 mb-12">

                            {/* Auditor Card */}
                            <button
                                onClick={onSelectAuditor}
                                className="group bg-white rounded-lg border border-stone-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col gap-6 relative overflow-hidden active:scale-[0.99]"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 shadow-sm z-10">
                                    <Search size={24} />
                                </div>
                                <div className="z-10">
                                    <h3 className="text-2xl font-bold text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors font-serif">MÓDULO CORRECTOR</h3>
                                    <p className="text-stone-500 text-sm leading-relaxed">
                                        Auditoría técnica de evidencias manuscritas y evaluación automática por rúbricas.
                                    </p>
                                    <div className="flex items-center gap-2 mt-4 text-emerald-600 font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                                        <span>Iniciar Corrección</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </button>

                            {/* Forge Card */}
                            <button
                                onClick={() => setViewMode("forge")}
                                className="group bg-white rounded-lg border border-stone-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col gap-6 relative overflow-hidden active:scale-[0.99]"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 shadow-sm z-10">
                                    <Zap size={24} />
                                </div>
                                <div className="z-10">
                                    <h3 className="text-2xl font-bold text-stone-800 mb-2 group-hover:text-teal-700 transition-colors font-serif">MÓDULO GENERADOR</h3>
                                    <p className="text-stone-500 text-sm leading-relaxed">
                                        Creación de materiales, exámenes y rúbricas con rigor UCLM y accesibilidad.
                                    </p>
                                    <div className="flex items-center gap-2 mt-4 text-teal-600 font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                                        <span>Generación de Exámenes</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </>
                ) : (
                    /* FORGE SUB-MENU */
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full flex flex-col items-center">
                        <div className="text-center mb-10 space-y-3">
                            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-700 shadow-sm">
                                <Zap size={32} />
                            </div>
                            <h2 className="text-4xl font-black font-serif text-stone-900 tracking-tight">Elige tu modo de creación</h2>
                            <p className="text-stone-500 max-w-lg mx-auto">Selecciona la herramienta especializada que mejor se adapte a tu necesidad pedagógica actual.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
                            {/* Forge Universal */}
                            <button
                                onClick={onSelectForgeUniversal}
                                className="group bg-white rounded-lg border border-stone-200 p-8 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all text-left flex items-start gap-4 active:scale-[0.99]"
                            >
                                <div className="bg-teal-50 p-3 rounded-lg text-teal-700 shrink-0">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-stone-800 mb-1 font-serif group-hover:text-teal-700">MODO GENERAL</h3>
                                    <p className="text-xs text-stone-400 mb-3">Para cualquier materia y nivel.</p>
                                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest border-b border-teal-200 pb-0.5">Acceder al Generador</span>
                                </div>
                            </button>

                            {/* Forge Specialist */}
                            <button
                                onClick={onSelectForgeSpecialist}
                                className="group bg-white rounded-lg border border-stone-200 p-8 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all text-left flex items-start gap-4 active:scale-[0.99]"
                            >
                                <div className="bg-emerald-50 p-3 rounded-lg text-emerald-700 shrink-0">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-stone-800 mb-1 font-serif group-hover:text-emerald-700">MODO ESPECIALISTA</h3>
                                    <p className="text-xs text-stone-400 mb-3">Historia de España (2º Bach).</p>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-200 pb-0.5">Acceder al Especialista</span>
                                </div>
                            </button>
                        </div>

                        <div className="mt-12 text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
                            HIPATIA ACADEMIC SUITE v4.0
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPage;
