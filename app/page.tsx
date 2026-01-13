'use client';

import React, { useState } from 'react';
import MainForm from './MainForm';
import LandingPage from './LandingPage';
import ForgeForm from './ForgeForm';
import ForgeUniversalForm from './ForgeUniversalForm';
import { ExamProvider } from './ExamContext';
import { OnboardingModal } from './components/OnboardingModal';
import { HelpFab } from './components/HelpFab';

export default function ExamCorrectionPage() {
    const [activeModule, setActiveModule] = useState<'landing' | 'auditor' | 'forge-universal' | 'forge-specialist'>('landing');
    const [userToken, setUserToken] = useState<string>('');

    // RESTAURACIÓN DE SESIÓN GLOBAL
    React.useEffect(() => {
        const savedToken = localStorage.getItem('user_token') || localStorage.getItem('token');
        if (savedToken) {
            setUserToken(savedToken);
        }
    }, []);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Check for first-time visit
    React.useEffect(() => {
        const hasVisited = localStorage.getItem('hipatia_visited');
        if (!hasVisited && userToken) {
            setShowOnboarding(true);
            localStorage.setItem('hipatia_visited', 'true');
        }
    }, [userToken]);

    const handleShowSample = () => {
        // Switch to Auditor mode
        setActiveModule('auditor');
        // We need a way to tell MainForm to load sample data.
        // Using a short timeout to let the component mount, or ideally a context/prop.
        // For simplicity, let's use a URL param or a temporary localStorage flag
        localStorage.setItem('hipatia_load_sample', 'true');
    };

    const handleLogin = (token: string) => {
        setUserToken(token);
    };

    const handleLogout = () => {
        setUserToken('');
        localStorage.removeItem('user_token');
        localStorage.removeItem('token');
        localStorage.removeItem('hipatia_load_sample');
        setActiveModule('landing');
    };

    return (
        <ExamProvider>
            <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} onShowSample={handleShowSample} />
            <iframe className="hidden" src="/legal" /> {/* Preload legal pages for speed */}
            {activeModule === 'auditor' && <HelpFab />}
            {activeModule === 'landing' ? (
                <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
                    <LandingPage
                        onLogin={handleLogin}
                        onLogout={handleLogout}
                        isLoggedIn={!!userToken}
                        onSelectAuditor={() => setActiveModule('auditor')}
                        onSelectForgeUniversal={() => setActiveModule('forge-universal')}
                        onSelectForgeSpecialist={() => setActiveModule('forge-specialist')}
                        onShowSample={handleShowSample}
                    />
                </div>
            ) : activeModule === 'auditor' ? (
                <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
                    <MainForm onBack={() => setActiveModule('landing')} userToken={userToken} />
                </div>
            ) : activeModule === 'forge-universal' ? (
                <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
                    <ForgeUniversalForm userToken={userToken} onBack={() => setActiveModule('landing')} />
                </div>
            ) : (
                <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
                    <ForgeForm userToken={userToken} onBack={() => setActiveModule('landing')} />
                </div>
            )}
        </ExamProvider>
    );
}
