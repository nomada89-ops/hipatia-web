import React, { useState, useEffect, useRef } from "react";
import { Search, Zap, Users, ChevronRight, Lock, CheckCircle, Shield, Award, BarChart3, Mail, BookOpen, LayoutGrid, MessageCircle, X, Send, ArrowRight, Play, ExternalLink } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface LandingPageProps {
    onLogin: (token: string) => void;
    onLogout: () => void;
    isLoggedIn: boolean;
    onSelectAuditor: () => void;
    onSelectForgeUniversal: () => void;
    onSelectForgeSpecialist: () => void;
    onShowSample: () => void;
}

const useScrollReveal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
};

const RevealSection: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => {
    const { ref, isVisible } = useScrollReveal();
    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} ${className}`}
        >
            {children}
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onLogout, isLoggedIn, onSelectAuditor, onSelectForgeUniversal, onSelectForgeSpecialist, onShowSample }) => {
    const [tokenInput, setTokenInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [viewMode, setViewMode] = useState<"main" | "forge">("main");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tokenInput.trim()) return;
        setIsLoading(true);
        try {
            const response = await fetch("https://n8n-n8n.ehqtcd.easypanel.host/webhook/login-uclm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_token: tokenInput })
            });
            const data = await response.json();
            if (data.autorizado) onLogin(tokenInput);
            else setErrorMessage("Token inválido");
        } catch {
            setErrorMessage("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="flex-1 h-screen overflow-y-auto bg-mesh scroll-smooth selection:bg-indigo-100 selection:text-indigo-900">
                {/* --- NAVIGATION --- */}
                <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center transition-all">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Shield size={18} />
                        </div>
                        <span className="font-bold text-slate-900 tracking-tight text-xl">HIPATIA</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <Link href="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
                        <Link href="/contacto" className="hover:text-indigo-600 transition-colors">Contacto</Link>
                        <button onClick={() => document.getElementById('login-card')?.scrollIntoView({ behavior: 'smooth' })} className="px-5 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-md active:scale-95">
                            Acceder
                        </button>
                    </div>
                </nav>

                {/* --- HERO SECTION --- */}
                <section className="min-h-screen pt-32 pb-20 px-6 flex flex-col lg:flex-row items-center justify-center gap-16 max-w-7xl mx-auto">
                    <div className="flex-1 space-y-10 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold animate-pulse-soft">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
                            BETA DISPONIBLE PARA DOCENTES
                        </div>
                        <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
                            La IA que entiende <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700">la educación.</span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            HIPATIA es el ecosistema inteligente diseñado para potenciar tu labor docente: desde la corrección de exámenes manuscritos hasta la generación de recursos oficiales.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                            <div className="flex items-center gap-2 text-slate-600 font-bold bg-white/50 px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
                                <CheckCircle size={18} className="text-emerald-500" />
                                <span>Corrección OCR</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 font-bold bg-white/50 px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
                                <CheckCircle size={18} className="text-emerald-500" />
                                <span>Generación IA</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 font-bold bg-white/50 px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
                                <CheckCircle size={18} className="text-emerald-500" />
                                <span>Conformidad LOPD</span>
                            </div>
                        </div>
                    </div>

                    <div id="login-card" className="w-full max-w-[440px] animate-float">
                        <div className="glass shadow-stripe rounded-[32px] p-10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
                            <div className="mb-10 text-center">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 border border-indigo-100">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Entrar en la plataforma</h2>
                                <p className="text-slate-500 text-sm font-medium">Introduce tu código de acceso corporativo</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        autoFocus
                                        className={`w-full h-16 px-6 bg-slate-50/50 border-2 rounded-2xl outline-none transition-all text-center text-xl font-bold tracking-[0.2em] focus:bg-white
                                            ${errorMessage ? "border-rose-400 focus:border-rose-500 text-rose-600" : "border-slate-100 focus:border-indigo-500 text-slate-800"}`}
                                        placeholder="TOKEN_ID"
                                        value={tokenInput}
                                        onChange={(e) => { setTokenInput(e.target.value); setErrorMessage(""); }}
                                    />
                                    {errorMessage && <p className="text-rose-500 text-xs font-bold text-center animate-bounce">{errorMessage}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex items-center justify-center group"
                                >
                                    {isLoading ? <span className="animate-pulse">Verificando...</span> : (
                                        <>
                                            Acceder ahora
                                            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                            <div className="mt-8 text-center">
                                <button onClick={onShowSample} className="text-slate-400 text-sm font-semibold hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 mx-auto">
                                    <Play size={14} className="text-indigo-500" />
                                    Probar demostración interactiva
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- FEATURES GRID --- */}
                <section className="py-32 px-6 bg-white border-t border-slate-100">
                    <RevealSection className="max-w-7xl mx-auto">
                        <div className="text-center space-y-4 mb-20">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Potencia instalada</h2>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Todo lo necesario para una gestión pedagógica avanzada.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { 
                                    icon: Search, 
                                    title: "Auditoría en 3 capas", 
                                    desc: "Verificación triple para una precisión absoluta en la corrección de exámenes manuscritos.",
                                    color: "indigo"
                                },
                                { 
                                    icon: Zap, 
                                    title: "Generación Reactiva", 
                                    desc: "Crea exámenes y materiales de apoyo en segundos a partir de tus propios contenidos.",
                                    color: "blue"
                                },
                                { 
                                    icon: Shield, 
                                    title: "Escudo LOPD", 
                                    desc: "Diseñado para cumplir con los estándares más estrictos de privacidad en el aula.",
                                    color: "purple"
                                }
                            ].map((feature, i) => (
                                <div key={i} className="group p-10 rounded-[32px] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all hover:shadow-2xl hover:shadow-slate-200/50">
                                    <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                                        <feature.icon size={26} className={`text-indigo-600`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </RevealSection>
                </section>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-mesh h-screen overflow-hidden flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* --- DASHBOARD HEADER --- */}
            <header className="px-8 py-5 flex justify-between items-center glass border-b border-slate-200/50 z-30">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center text-white shadow-md">
                            <Shield size={14} />
                        </div>
                        <span className="font-bold text-slate-900 text-lg tracking-tight">HIPATIA</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-500">
                        <Link href="/blog" className="hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1.5"><BookOpen size={14} /> Blog</Link>
                        <Link href="/contacto" className="hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1.5"><Mail size={14} /> Contacto</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {viewMode === 'forge' && (
                        <button onClick={() => setViewMode('main')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all uppercase tracking-widest">
                            <LayoutGrid size={14} className="inline mr-2" /> Menú
                        </button>
                    )}
                    <button onClick={onLogout} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100 uppercase tracking-widest">
                        <Lock size={14} /> Salir
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative z-10 flex flex-col items-center">
                <div className="w-full max-w-6xl">
                    {viewMode === 'main' ? (
                        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="text-center space-y-6">
                                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">
                                    Bienvenid@ al futuro <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-700">del aula inteligente.</span>
                                </h1>
                                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Selecciona la herramienta que deseas utilizar hoy.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                                <button onClick={onSelectAuditor} className="group glass-indigo rounded-[32px] p-10 text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-200/50 flex flex-col gap-10">
                                    <div className="flex justify-between items-start">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                            <Search size={32} />
                                        </div>
                                        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Auditoría Pro</div>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">MÓDULO CORRECTOR</h2>
                                        <p className="text-slate-500 font-medium leading-relaxed">Auditoría técnica de evidencias manuscritas y evaluación automática por rúbricas de alta precisión.</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest pt-4 group-hover:gap-4 transition-all">
                                        Acceder al corrector <ArrowRight size={18} />
                                    </div>
                                </button>

                                
                                <Link href="/informe-grupal" className="group glass-emerald rounded-[32px] p-10 text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-200/50 flex flex-col gap-10">
                                    <div className="flex justify-between items-start">
                                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                            <Users size={32} />
                                        </div>
                                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">NUEVO</div>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">INFORMES DE GRUPO</h2>
                                        <p className="text-slate-500 font-medium leading-relaxed">Genera estadísticas comparativas y detecta patrones de aprendizaje por clase.</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-widest pt-4 group-hover:gap-4 transition-all">
                                        Crear informe <ArrowRight size={18} />
                                    </div>
                                </Link>

                                <button onClick={() => setViewMode('forge')} className="group glass rounded-[32px] p-10 text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200/20 flex flex-col gap-10">
                                    <div className="flex justify-between items-start">
                                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <Zap size={32} />
                                        </div>
                                        <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Generación IA</div>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">MÓDULO GENERADOR</h2>
                                        <p className="text-slate-500 font-medium leading-relaxed">Creación masiva de materiales complementarios, rúbricas y exámenes oficiales en segundos.</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-widest pt-4 group-hover:gap-4 transition-all">
                                        Elegir modo <ArrowRight size={18} />
                                    </div>
                                </button>
                            </div>
                            <div className="text-center pt-8">
                                <button onClick={onShowSample} className="px-8 py-3 bg-white text-slate-500 font-bold rounded-full border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                                     Ver Simulación de Informe Completo
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-16 animate-in slide-in-from-right-8 duration-500">
                             <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                                    <Zap size={32} />
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Especialidades</h1>
                                <p className="text-slate-500 font-medium text-lg">Selecciona tu modo de generación preferido.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                <button onClick={onSelectForgeUniversal} className="group glass p-10 rounded-[32px] text-left transition-all hover:-translate-y-2 hover:shadow-xl flex gap-6">
                                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><BookOpen size={32} /></div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">MODO GENERAL</h3>
                                        <p className="text-slate-500 font-medium mb-6">Cualquier materia y nivel. Sube tus contenidos y genera exámenes.</p>
                                        <div className="text-indigo-600 font-bold uppercase tracking-widest text-xs flex items-center gap-2">Abrir herramienta <ExternalLink size={14} /></div>
                                    </div>
                                </button>

                                <button onClick={onSelectForgeSpecialist} className="group glass p-10 rounded-[32px] text-left transition-all hover:-translate-y-2 hover:shadow-xl flex gap-6">
                                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"><Award size={32} /></div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">MODO ESPECIALISTA</h3>
                                        <p className="text-slate-500 font-medium mb-6">Historia de España (2 Bach). Protocolo oficial UCLM.</p>
                                        <div className="text-blue-600 font-bold uppercase tracking-widest text-xs flex items-center gap-2">Abrir herramienta <ExternalLink size={14} /></div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="px-8 py-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] font-sans pb-10">
                HIPATIA ACADEMIC ECOSYSTEM v4.0  ENGINEERED FOR EDUCATION
            </footer>
        </div>
    );
};

export default LandingPage;

