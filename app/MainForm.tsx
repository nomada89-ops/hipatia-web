import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  Loader2, 
  Zap, 
  Users, 
  Download 
} from 'lucide-react';
// Asegúrate de que la ruta a tu contexto sea correcta
import { useExamContext } from './ExamContext'; 


// Función auxiliar para comprimir imágenes (Máx 1200px y calidad 0.7)
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // Si no es imagen (ej: PDF), devolver original
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200; // Reducir tamaño excesivo
      const scaleSize = MAX_WIDTH / img.width;
      
      // Si es más pequeña, no redimensionar
      if (scaleSize >= 1) {
        canvas.width = img.width;
        canvas.height = img.height;
      } else {
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Convertir a JPEG con calidad 0.7 (70%)
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback
          }
        }, 'image/jpeg', 0.7); 
      } else {
        resolve(file);
      }
    };
    img.onerror = () => resolve(file);
  });
};

export default function MainForm() {
  // --- ESTADOS ---
  const { 
    userToken, setUserToken, 
    examFiles, setExamFiles 
  } = useExamContext();

  const [nombreAlumno, setNombreAlumno] = useState("");
  
  // Estados para funcionalidades avanzadas (Recuperados)
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [exigencyLevel, setExigencyLevel] = useState<string>("Estándar");

  // Estados para Modo Grupo (Nuevos)
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [idGrupo, setIdGrupo] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // --- ESCUCHA DE SEÑAL DESDE INFORME INDIVIDUAL ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'triggerGroupReport') {
        handleGenerateGroupReport();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [userToken, idGrupo]);

  // --- FUNCIÓN 1: CORRECCIÓN INDIVIDUAL (FormData) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken) { alert("Por favor, introduce tu Token de Profesor."); return; }
    if (examFiles.length === 0) { alert("Sube al menos una imagen del examen."); return; }

    setIsLoading(true);
    setStatusMessage("Analizando examen...");

    try {
      const formData = new FormData();
      // Datos obligatorios
      formData.append('user_token', userToken);
      formData.append('id_grupo', isGroupMode ? idGrupo : "SIN_GRUPO");
      formData.append('alumno', nombreAlumno || "Alumno");
      formData.append('nivel_exigencia', exigencyLevel);

      // Archivos del examen
      examFiles.forEach((file) => {
        formData.append('examen', file); // Ajusta la clave según tu n8n
      });

      // Archivo de Rúbrica (Opcional)
      if (rubricFile) {
        formData.append('rubrica', rubricFile);
      }

      // Materiales de Referencia (Opcional)
      referenceFiles.forEach((file) => {
        formData.append('material_referencia', file);
      });

      // URL del Webhook Individual (Usa tu variable de entorno o la URL directa)
      const url = process.env.NEXT_PUBLIC_WEBHOOK_AUDITOR || 'PON_AQUI_TU_URL_DE_PRODUCCION_SI_FALLA_ENV';

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const html = await response.text();
        const win = window.open('', 'InformeIndividual');
        if (win) {
          win.document.open();
          win.document.write(html);
          win.document.close();
        }
        setStatusMessage("¡Corrección completada!");
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con Hipatia. Verifica tu conexión.");
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  // --- FUNCIÓN 2: INFORME GRUPAL (JSON) ---
  const handleGenerateGroupReport = async () => {
    if (!idGrupo) { alert("Debes definir un ID de Grupo primero."); return; }
    
    setIsLoading(true);
    setStatusMessage("Generando informe grupal...");

    try {
      // URL del Webhook Grupal
      const url = 'https://n8n.protocolohipatia.com/webhook/generar-informe-grupal'; 

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_token: userToken,
          id_grupo: idGrupo
        }),
      });

      if (response.ok) {
        const html = await response.text();
        const win = window.open('', 'InformeGrupal');
        if (win) {
          win.document.open();
          win.document.write(html);
          win.document.close();
        }
        setStatusMessage("¡Informe Grupal generado!");
      } else {
        throw new Error(`Error ${response.status}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error al generar el informe grupal.");
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  // --- RENDERIZADO (JSX) ---
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Zap className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hipatia Grader AI</h1>
          <p className="text-gray-500 text-sm">Sistema de Corrección Avanzada</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        

        {/* 2. ZONA DE CONFIGURACIÓN GRUPAL (NUEVO) */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input 
              type="checkbox" 
              checked={isGroupMode}
              onChange={(e) => setIsGroupMode(e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="font-semibold text-gray-700">Corregir como parte de un grupo</span>
          </label>
          
          {isGroupMode && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                value={idGrupo}
                onChange={(e) => setIdGrupo(e.target.value)}
                className="w-full p-2 border border-purple-200 rounded bg-white focus:border-purple-500 outline-none"
                placeholder="Ej: 2º BACH A - MATEMÁTICAS"
              />
              <p className="text-xs text-gray-500 mt-1">
                Todos los exámenes corregidos bajo este ID se acumularán para el informe final.
              </p>
            </div>
          )}
        </div>

        {/* 3. ZONA DE RÚBRICA Y MATERIALES (RESTAURADO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rúbrica */}
          <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-lg p-4 text-center hover:bg-green-100 transition-colors">
             <label className="cursor-pointer flex flex-col items-center">
                <FileText className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-semibold text-green-800">
                  {rubricFile ? rubricFile.name : "Subir Rúbrica (PDF)"}
                </span>
                <input 
                  type="file" accept=".pdf" className="hidden" 
                  onChange={(e) => e.target.files && setRubricFile(e.target.files[0])} 
                />
             </label>
          </div>

          {/* Materiales */}
          <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors">
             <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-semibold text-blue-800">
                  {referenceFiles.length > 0 ? `${referenceFiles.length} archivos` : "Material Extra"}
                </span>
                <input 
                  type="file" multiple className="hidden" 
                  onChange={(e) => e.target.files && setReferenceFiles(Array.from(e.target.files))} 
                />
             </label>
          </div>
        </div>

        {/* 4. DATOS DEL ALUMNO Y EXIGENCIA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / ID Alumno</label>
            <input
              type="text"
              value={nombreAlumno}
              onChange={(e) => setNombreAlumno(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg"
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Exigencia</label>
            <select 
              value={exigencyLevel}
              onChange={(e) => setExigencyLevel(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg bg-white"
            >
              <option value="Bajo">Bajo (Comprensivo)</option>
              <option value="Estándar">Estándar</option>
              <option value="Alto">Alto (Estricto)</option>
            </select>
          </div>
        </div>

        {/* 5. SUBIDA DEL EXAMEN (Contexto) */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
           <input 
             type="file" 
             id="exam-file-input"
             multiple 
             accept="image/*,application/pdf"
             className="hidden"
             onChange={async (e) => {
               if (e.target.files) {
                 const rawFiles = Array.from(e.target.files);
                 // Procesar compresión
                 const processedFiles = await Promise.all(
                   rawFiles.map(file => compressImage(file))
                 );
                 setExamFiles(processedFiles);
               }
             }}
           />
           
           <label 
             htmlFor="exam-file-input" 
             className="cursor-pointer block"
             onDragOver={(e) => e.preventDefault()}
             onDrop={async (e) => {
               e.preventDefault();
               if (e.dataTransfer.files) {
                 const rawFiles = Array.from(e.dataTransfer.files);
                 const processedFiles = await Promise.all(
                   rawFiles.map(file => compressImage(file))
                 );
                 setExamFiles(processedFiles);
               }
             }}
           >
             <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
             <p className="text-gray-600 font-medium mb-2">Arrastra las fotos del examen aquí</p>
             <p className="text-sm text-gray-400 mb-4">o haz clic para seleccionar archivos</p>
             <div className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
               Seleccionar Archivos
             </div>
           </label>
           
           {/* Visualización simple de archivos seleccionados */}
           {examFiles.length > 0 && (
             <div className="mt-4 flex flex-wrap gap-2 justify-center">
               {examFiles.map((f, i) => (
                 <span key={i} className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-700">{f.name}</span>
               ))}
             </div>
           )}
        </div>

        {/* 6. BOTONES DE ACCIÓN */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transform transition-all hover:scale-[1.01] flex items-center justify-center gap-2
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-200'}`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Check />}
            {isLoading ? statusMessage : 'CORREGIR EXAMEN'}
          </button>

          {/* Botón de Informe Grupal (Solo visible en modo grupo) */}
          {isGroupMode && (
            <button
              type="button"
              onClick={handleGenerateGroupReport}
              disabled={isLoading || !idGrupo}
              className="w-full py-3 bg-white border-2 border-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              GENERAR INFORME GRUPAL
            </button>
          )}
        </div>
      </form>
    </div>
  );
}