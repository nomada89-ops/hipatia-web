import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

print(f"--- SEARCHING FOR SESION CONTEXT ---")
try:
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        
        indices = [m.start() for m in re.finditer(r'SESION', content.upper())]
        print(f"Found {len(indices)} occurrences of SESION. Showing contexts:")
        for idx in indices[:10]:
            print(f"Context {idx}:")
            print(content[max(0, idx-50):min(len(content), idx+50)])
            print("-" * 20)
                
except Exception as e:
    print("Error:", e)
