import React, { useState, useEffect, useMemo } from 'react';
import nlp from 'compromise';
import { AlertTriangle, Check, Eraser, Eye, RefreshCw } from 'lucide-react';

interface AnonymizationEditorProps {
    initialText: string;
    onConfirm: (cleanText: string, mapping: Array<{ original: string, placeholder: string }>) => void;
    onCancel: () => void;
}

interface Token {
    id: number;
    text: string;
    isPII: boolean;
    type?: 'Person' | 'Place' | 'Date' | 'Email' | 'Phone';
}

export const AnonymizationEditor: React.FC<AnonymizationEditorProps> = ({ initialText, onConfirm, onCancel }) => {
    const [tokens, setTokens] = useState<Token[]>([]);

    // Analyze text on mount
    useEffect(() => {
        const doc = nlp(initialText);
        // Basic strategy: Split by spaces but keep punctuation attached or loose?
        // Compromise 'terms' are good but reassembling exactly is tricky.
        // Let's stick to a simpler word-boundary split for rendering, and mapping ranges.
        // Actually, let's use compromise to FIND the terms, then map them to our simple split.

        // Simpler approach for Phase 1: 
        // 1. Detect PII terms.
        // 2. Split string by regex capturing delimiters. 
        // 3. Mark chunks that match PII.

        const people = doc.people().out('array');
        const places = doc.places().out('array');
        const emails = doc.emails().out('array');

        // Regex to split by whitespace but keep newlines
        const rawTokens = initialText.split(/(\s+)/);

        const processed = rawTokens.map((t, i) => {
            const clean = t.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
            // Very naive check - in production we'd use character ranges from compromise
            let isPII = false;
            let type: Token['type'] | undefined;

            if (people.includes(clean) || people.includes(t.trim())) { isPII = true; type = 'Person'; }
            if (places.includes(clean)) { isPII = true; type = 'Place'; }
            if (emails.includes(clean)) { isPII = true; type = 'Email'; }
            // Custom basic regex for DNI/Phone
            if (/\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]/i.test(clean)) { isPII = true; type = 'Person'; } // DNI

            return {
                id: i,
                text: t,
                isPII,
                type
            };
        });

        setTokens(processed);
    }, [initialText]);

    const togglePII = (id: number) => {
        setTokens(prev => prev.map(t =>
            t.id === id ? { ...t, isPII: !t.isPII } : t
        ));
    };

    const handleConfirm = () => {
        let cleanText = "";
        const mapping: Array<{ original: string, placeholder: string }> = [];
        let counter = 1;

        tokens.forEach(t => {
            if (t.isPII && t.text.trim()) {
                const placeholder = `[ALUMNO_${counter}]`; // Simplified for now, could become [PERSON_${i}]
                cleanText += placeholder;
                mapping.push({ original: t.text, placeholder });
                // Only increment if it's a substantive token, though doing it per token avoids collision
                counter++;
            } else {
                cleanText += t.text;
            }
        });

        onConfirm(cleanText, mapping);
    };

    return (
        <div className="flex flex-col h-[80vh] bg-white rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <Eraser size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Validación de Privacidad</h3>
                        <p className="text-xs text-slate-500">Confirma los datos a ocultar antes del envío</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium">
                        Cancelar
                    </button>
                    <button onClick={handleConfirm} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                        <Check size={16} /> Confirmar Seguro
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {tokens.map((token) => (
                    <span
                        key={token.id}
                        onClick={() => token.text.trim() && togglePII(token.id)}
                        className={`transition-all duration-200 px-0.5 rounded cursor-pointer select-none
                            ${token.isPII
                                ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900 mx-0.5'
                                : 'hover:bg-slate-100 text-slate-700'
                            }
                        `}
                        title={token.isPII ? "Click para revelar" : "Click para ocultar"}
                    >
                        {token.isPII ? '█'.repeat(Math.min(token.text.length, 8)) : token.text}
                    </span>
                ))}
            </div>

            {/* Footer / Legend */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 flex gap-4 text-xs text-slate-500 justify-center">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-slate-900 rounded-sm"></span>
                    <span>Oculto (Seguro)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-slate-300 bg-white rounded-sm"></span>
                    <span>Visible (Público)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <AlertTriangle size={12} className="text-amber-500" />
                    <span className="font-medium text-amber-600">Revisa nombres y fechas</span>
                </div>
            </div>
        </div>
    );
};
