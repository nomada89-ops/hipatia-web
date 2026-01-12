'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ExamContextType {
    guiaCorreccion: string;
    setGuiaCorreccion: (val: string) => void;
    materialReferenciaFiles: File[];
    setMaterialReferenciaFiles: (files: File[]) => void;
    materialReferenciaTexto: string;
    setMaterialReferenciaTexto: (val: string) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider = ({ children }: { children: ReactNode }) => {
    const [guiaCorreccion, setGuiaCorreccion] = useState<string>('');
    const [materialReferenciaFiles, setMaterialReferenciaFiles] = useState<File[]>([]);
    const [materialReferenciaTexto, setMaterialReferenciaTexto] = useState<string>('');

    // Persistencia básica si fuera necesaria
    useEffect(() => {
        const savedGuia = localStorage.getItem('hipatia_guia_correccion');
        if (savedGuia) setGuiaCorreccion(savedGuia);
    }, []);

    useEffect(() => {
        localStorage.setItem('hipatia_guia_correccion', guiaCorreccion);
    }, [guiaCorreccion]);

    return (
        <ExamContext.Provider value={{
            guiaCorreccion, setGuiaCorreccion,
            materialReferenciaFiles, setMaterialReferenciaFiles,
            materialReferenciaTexto, setMaterialReferenciaTexto
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