'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ExamContextType {
    // Propiedades existentes
    guiaCorreccion: string;
    setGuiaCorreccion: (val: string) => void;
    materialReferenciaFiles: File[];
    setMaterialReferenciaFiles: (files: File[]) => void;
    materialReferenciaTexto: string;
    setMaterialReferenciaTexto: (val: string) => void;
    
    // Propiedades nuevas requeridas por MainForm
    userToken: string;
    setUserToken: (val: string) => void;
    examFiles: File[];
    setExamFiles: (files: File[]) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider = ({ children }: { children: ReactNode }) => {
    // Estados existentes
    const [guiaCorreccion, setGuiaCorreccion] = useState<string>('');
    const [materialReferenciaFiles, setMaterialReferenciaFiles] = useState<File[]>([]);
    const [materialReferenciaTexto, setMaterialReferenciaTexto] = useState<string>('');
    
    // Estados nuevos
    const [userToken, setUserToken] = useState<string>('');
    const [examFiles, setExamFiles] = useState<File[]>([]);

    // Persistencia básica
    useEffect(() => {
        const savedGuia = localStorage.getItem('hipatia_guia_correccion');
        if (savedGuia) setGuiaCorreccion(savedGuia);
        
        const savedToken = localStorage.getItem('hipatia_user_token');
        if (savedToken) setUserToken(savedToken);
    }, []);

    useEffect(() => {
        if (guiaCorreccion) {
            localStorage.setItem('hipatia_guia_correccion', guiaCorreccion);
        }
    }, [guiaCorreccion]);
    
    useEffect(() => {
        if (userToken) {
            localStorage.setItem('hipatia_user_token', userToken);
        }
    }, [userToken]);

    return (
        <ExamContext.Provider value={{
            guiaCorreccion, 
            setGuiaCorreccion,
            materialReferenciaFiles, 
            setMaterialReferenciaFiles,
            materialReferenciaTexto, 
            setMaterialReferenciaTexto,
            userToken,
            setUserToken,
            examFiles,
            setExamFiles
        }}>
            {children}
        </ExamContext.Provider>
    );
};

export const useExamContext = () => {
    const context = useContext(ExamContext);
    if (!context) throw new Error('useExamContext debe usarse dentro de ExamProvider');
    return context;
};