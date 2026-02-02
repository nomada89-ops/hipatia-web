import React from 'react';
import { Trash2 } from 'lucide-react';

interface FileImportZoneProps {
    onFileSelected: (file: File) => void;
}

export const FileImportZone: React.FC<FileImportZoneProps> = ({ onFileSelected }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelected(e.dataTransfer.files[0]);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-input')?.click()}
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-indigo-200 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors group cursor-pointer"
        >
            {/* Branding Logo */}
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>
                <img
                    src="/logo_cuadrante.PNG"
                    alt="Cuadrante Logo"
                    className="w-24 h-24 rounded-2xl shadow-xl relative z-10 transform group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                    Zona de Carga Segura
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                    Arrastre aquí su archivo XML de Delphos/Itaca/SAUCE
                </p>
                <p className="text-xs text-slate-400 mt-4 max-w-sm mx-auto border-t border-slate-200 pt-3">
                    <span className="flex items-center justify-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        El archivo se procesará localmente y podrá ser triturado tras la importación
                    </span>
                </p>
            </div>

            <input
                id="file-upload-input"
                type="file"
                className="hidden"
                accept=".xml"
                onChange={(e) => {
                    if (e.target.files?.[0]) onFileSelected(e.target.files[0]);
                }}
            />
        </div>
    );
};
