import React, { useEffect, useState } from 'react';
import './index.css';
import { LegalModal } from './ui/components/LegalModal';
import { ScheduleGrid } from './ui/features/schedule/ScheduleGrid';
import { SetupWizard } from './ui/features/auth/SetupWizard';
import { UnlockScreen } from './ui/features/auth/UnlockScreen';
import { TeacherPreferences } from './ui/features/preferences/TeacherPreferences';
import { UserOptions } from './ui/features/preferences/UserOptions';
import { Shield, AlertTriangle } from 'lucide-react';

// Types
interface SystemInfo {
    hwid: string;
    secure: boolean;
    platform: string;
    is_setup: boolean;
    is_locked: boolean;
    processing: {
        status: string;
        progress: number;
        current_task: string | null;
    }
}

function App() {
    const [info, setInfo] = useState<SystemInfo | null>(null);
    const [status, setStatus] = useState('Iniciando...');
    const [showLegal, setShowLegal] = useState(false);
    const [accepted, setAccepted] = useState(false);

    // Initial Fetch & Polling
    const fetchSystemInfo = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/system/info');
            if (res.ok) {
                const data = await res.json();
                setInfo(data);
                setStatus('Conectado');
            } else {
                setStatus('Núcleo Desconectado');
            }
        } catch (e) {
            setStatus('Esperando al Backend...');
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchSystemInfo, 1000); // Poll every 1s
        fetchSystemInfo(); // Initial call

        // Initial Acceptance Check
        const isAccepted = localStorage.getItem('legal_accepted') === 'true';
        setAccepted(isAccepted);
        if (!isAccepted) setShowLegal(true);

        return () => clearInterval(interval);
    }, []);

    // STRICT GATING
    const handleCloseLegal = () => {
        const isAccepted = localStorage.getItem('legal_accepted') === 'true';
        setAccepted(isAccepted);
        setShowLegal(false);
    }

    // --- CRITICAL AUTHENTICATION FLOWS ---

    // --- Tab State ---
    const [activeTab, setActiveTab] = React.useState<'schedule' | 'preferences' | 'options'>('schedule');
    const [isDemo, setIsDemo] = useState(false); // Demo Mode State
    // NEW: Real Data State
    const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([]);

    // --- Main Render ---
    if (!info && !isDemo) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                        <img src="/logo_cuadrante.PNG" alt="Cuadrante Logo" className="w-16 h-16 rounded-xl shadow-2xl relative z-10" />
                    </div>
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>{status}</p>
                </div>
            </div>
        );
    }

    if (info?.is_setup === false && !isDemo) {
        return (
            <div className="h-screen bg-slate-200 flex items-center justify-center">
                <SetupWizard onComplete={(demoRequested) => {
                    if (demoRequested) {
                        setIsDemo(true);
                        setAccepted(true); // Auto-accept legal for demo
                    } else {
                        fetchSystemInfo();
                    }
                }} />
            </div>
        );
    }

    if (info?.is_locked === true && !isDemo) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center">
                <UnlockScreen
                    onUnlock={(demoRequested) => {
                        if (demoRequested) {
                            setIsDemo(true);
                            setAccepted(true);
                        } else {
                            fetchSystemInfo();
                        }
                    }}
                    hwid={info.hwid}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* DEMO BANNER */}
            {isDemo && (
                <div className="bg-amber-400 text-amber-900 text-xs font-bold text-center py-1 flex justify-center items-center gap-2 shadow-sm z-50">
                    <AlertTriangle className="w-3 h-3" />
                    MODO DEMOSTRACIÓN - Los datos son ficticios y NO se guardarán en la Bóveda Cifrada.
                </div>
            )}

            {/* 1. Navbar */}
            <nav className="bg-slate-900 text-white p-3 px-6 flex justify-between items-center shadow-md z-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        CUADRANTE <span className="text-xs font-mono text-indigo-400 ml-1">PRO</span>
                    </h1>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'schedule' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        📅 Horario
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preferences' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        ☕ Preferencias
                    </button>
                    <button
                        onClick={() => setActiveTab('options')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'options' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        🎛️ Opciones
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-400">Licencia Activa</div>
                        <div className="text-sm font-bold text-emerald-400">{isDemo ? "MODO DEMO" : "IES MOCK DEMO"}</div>
                    </div>
                </div>
            </nav>

            {/* 2. Main Content Area */}
            <div className="flex-1 overflow-hidden relative bg-slate-100">
                {/* 1. Legal Guard Layer */}
                <LegalModal forceShow={showLegal} onClose={handleCloseLegal} />

                {/* 2. Main Application Area - STRICTLY GATED */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {!accepted && (
                        <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-100 text-slate-400">
                            <p className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Esperando aceptación legal...
                            </p>
                        </div>
                    )}
                    {accepted && activeTab === 'schedule' && (
                        <ScheduleGrid
                            externalProgress={info?.processing?.progress || 0}
                            isProcessing={info?.processing?.status === 'running'}
                            isDemo={isDemo}
                            onDataLoaded={(data) => setTeachers(data.teachers)}
                        />
                    )}
                    {accepted && activeTab === 'preferences' && (
                        <div className="p-4 overflow-auto h-full">
                            <TeacherPreferences teachers={teachers} />
                        </div>
                    )}
                    {accepted && activeTab === 'options' && (
                        <div className="p-4 overflow-auto h-full">
                            <UserOptions />
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 p-2 flex justify-between items-center text-xs text-slate-500">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo_cuadrante.PNG" alt="Logo" className="w-4 h-4 rounded-sm" />
                        <span className="font-bold text-slate-700">Cuadrante v1.0</span>
                    </div>
                    <span className={`font-mono flex items-center gap-1 text-emerald-600`}>
                        <div className={`w-2 h-2 rounded-full bg-emerald-500`}></div>
                        Sistema Seguro (ENS Medio) - {status}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">ID: {info?.hwid?.substring(0, 8) || 'DEMO-MODE'}</span>
                </div>

                <button
                    onClick={() => setShowLegal(true)}
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                    <Shield className="w-3 h-3" />
                    Aviso Legal y Privacidad
                </button>
            </footer>
        </div>
    );
}

export default App;
