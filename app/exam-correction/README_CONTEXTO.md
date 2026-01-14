# HIPATIA - Estado del Proyecto y Guía de Emergencia

Este archivo sirve como memoria técnica para cualquier asistente o desarrollador que tome el relevo en este proyecto.

## 🏆 El "Patrón Oro" (Backup Crítico)
Existe una rama de Git denominada **`BACKUP_ORO_CANONICO_ESTABLE_DOMINGO`**.
- **Qué es**: Es la versión 100% estable y funcional probada el domingo 11 de enero.
- **Cuándo usarla**: Si la aplicación entra en bucles de redirección, falla el login o se rompe la lógica de corrección.
- **Cómo restaurar**: `git checkout BACKUP_ORO_CANONICO_ESTABLE_DOMINGO -- .`

## 🛠️ Estructura del Proyecto
- **Carpeta de trabajo**: `app/exam-correction/`
- **Archivos Core (Rastreados por Git)**:
  - `app/MainForm.tsx`: Lógica principal de corrección (OCR, envío a n8n).
  - `app/page.tsx`: Punto de entrada y gestión de módulos.
  - `app/LandingPage.tsx`: Lógica de Login y validación de tokens.
  - `app/ExamContext.tsx`: Estado global (Tokens, archivos, etc).

## 🔐 Seguridad y Sesión
- **Claves de LocalStorage**: 
  - `user_token`: Token del profesor.
  - `token`: Alias del token (por compatibilidad).
  - `hipatia_id_grupo`: Almacena el ID del grupo actual.
- **Autenticación**: El sistema redirige automáticamente al login (`/`) si no se detecta un token válido en la corrección.

## 🚀 Despliegue
- **Entorno**: Easypanel (Nixpacks).
- **Flujo**: Todo `push` a la rama `main` dispara un despliegue automático.
- **Importante**: Asegurarse siempre de que los archivos se guarden en **UTF-8** para evitar errores de compilación en Nixpacks.

---
*Nota: Este proyecto ha sido limpiado de archivos temporales y scripts de emergencia para mantener la pulcritud técnica.*
