'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ExamContextType {
    guiaCorreccion: string;
    setGuiaCorreccion: (value: string) => void;
    materialReferenciaFiles: File[];
    setMaterialReferenciaFiles: (files: File[]) => void;
    materialReferenciaTexto: string;
    setMaterialReferenciaTexto: (value: string) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider = ({ children }: { children: ReactNode }) => {
    const [guiaCorreccion, setGuiaCorreccion] = useState<string>('');
    const [materialReferenciaFiles, setMaterialReferenciaFiles] = useState<File[]>([]);
    const [materialReferenciaTexto, setMaterialReferenciaTexto] = useState<string>('');

    // Cargar desde localStorage al inicio
    React.useEffect(() => {
        const savedGuia = localStorage.getItem('guiaCorreccion');
        if (savedGuia) {
            setGuiaCorreccion(savedGuia);
        }
    }, []);

    // Guardar en localStorage cada vez que cambia
    React.useEffect(() => {
        localStorage.setItem('guiaCorreccion', guiaCorreccion);
    }, [guiaCorreccion]);

    return (
        <ExamContext.Provider
            value={{
                guiaCorreccion,
                setGuiaCorreccion,
                materialReferenciaFiles,
                setMaterialReferenciaFiles,
                materialReferenciaTexto,
                setMaterialReferenciaTexto,
            }}
        >
            {children}
        </ExamContext.Provider>
    );
};

export const useExamContext = () => {
    const context = useContext(ExamContext);
    if (!context) {
        throw new Error('useExamContext must be used within an ExamProvider');
    }
    return context;
};
