import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

def debug_structure():
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        
        print("--- SAMPLE PROFESOR ---")
        prof = re.search(r'<listasal seq="PROFESORES_1">.*?</listasal>', content, re.DOTALL)
        if prof: print(prof.group(0))
        
        print("\n--- SAMPLE ACTIVIDAD ---")
        act = re.search(r'<listasal seq="ACTIVIDADES_1">.*?</listasal>', content, re.DOTALL)
        if act: print(act.group(0))
        
        print("\n--- SAMPLE PROFESOR_ACTIVIDAD ---")
        # Find any sequence that looks like a link
        link = re.search(r'<listasal seq="(?:PROFESORES_ACTIVIDAD|ACTIVIDADES_PROFESOR).*?">.*?</listasal>', content, re.DOTALL)
        if link: print(link.group(0))
        
        print("\n--- SAMPLE TAREA (Tutoría) ---")
        tarea = re.search(r'<listasal seq="TAREAS_.*?">.*?Tutoría de ESO.*?</listasal>', content, re.DOTALL)
        if tarea: print(tarea.group(0))

debug_structure()
