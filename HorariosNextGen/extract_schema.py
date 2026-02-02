import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

def get_unique_datos():
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        datos = re.findall(r'dato="([^"]+)"', content)
        print("Unique dato attributes found:")
        print(sorted(list(set(datos))))
        
        # Also find all seq prefixes
        seqs = re.findall(r'seq="([^"0-9_]+)', content)
        print("\nUnique seq prefixes found:")
        print(sorted(list(set(seqs))))

get_unique_datos()
