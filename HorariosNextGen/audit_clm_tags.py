import re
import sys

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

def extract_names(seq_pattern):
    names = set()
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        
        # Find all listasal with this seq
        groups = re.findall(rf'<listasal seq="{seq_pattern}.*?>(.*?)</listasal>', content, re.DOTALL)
        for group in groups:
            name_match = re.search(r'<salida dato="NOMBRE">(.*?)</salida>', group)
            if name_match:
                names.add(name_match.group(1))
    return sorted(list(names))

print("--- ANALYZING TAREAS ---")
tareas = extract_names("TAREAS_")
for t in tareas:
    print(f"Task: {t}")

print("\n--- ANALYZING MATERIAS (First 100) ---")
materias = extract_names("MATERIAS_")
for m in materias[:100]:
    print(f"Subject: {m}")
