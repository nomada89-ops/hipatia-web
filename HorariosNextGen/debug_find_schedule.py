import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

print(f"--- SEARCHING FOR SCHEDULE DATA ---")
try:
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        
        # Check occurrence counts
        print("Count 'TRAMO':", content.upper().count("TRAMO"))
        print("Count 'SESION':", content.upper().count("SESION"))
        print("Count 'HORARIO':", content.upper().count("HORARIO"))
        print("Count 'ACTIVIDAD':", content.upper().count("ACTIVIDAD"))
        
        # Find context for 'TRAMO'
        indices = [m.start() for m in re.finditer(r'TRAMO', content.upper())]
        print(f"\nFound {len(indices)} occurrences of TRAMO. Showing first 5 contexts:")
        for idx in indices[:5]:
            print(f"Context {idx}:")
            print(content[max(0, idx-100):min(len(content), idx+100)])
            print("-" * 20)

        # check for 'ACTIVIDAD' since sometimes it is used for sessions
        indices_act = [m.start() for m in re.finditer(r'ACTIVIDAD', content.upper())]
        print(f"\nFound {len(indices_act)} occurrences of ACTIVIDAD. Showing first 5 contexts:")
        for idx in indices_act[:5]:
             print(f"Context {idx}:")
             print(content[max(0, idx-100):min(len(content), idx+100)])
             print("-" * 20)
                
except Exception as e:
    print("Error:", e)
