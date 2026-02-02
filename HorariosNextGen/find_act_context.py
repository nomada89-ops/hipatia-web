import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

def find_context_activity():
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        pos = content.find('seq="GRUPOS_ACTIVIDAD_1647"')
        if pos != -1:
            print("--- CONTEXT AROUND GRUPOS_ACTIVIDAD_1647 ---")
            print(content[pos-100 : pos+1000])

find_context_activity()
