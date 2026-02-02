import os

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

print(f"--- XML DEBUG: {file_path} ---")

try:
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        lines = [next(f) for _ in range(50)]
        print("--- FIRST 50 LINES ---")
        print(''.join(lines))
        
    print("\n--- FINDING SECTIONS (listasal seq) ---")
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        from xml.dom.minidom import parseString
        # Parse logic might be too heavy for full file, let's do simple string finding for finding seqs
        import re
        seqs = set(re.findall(r'seq="([^"]+)"', content))
        print("Found SEQs:", seqs)
        
        # Function to find and print a sample of a specific list
        def print_sample(seq_name):
            print(f"\n--- SAMPLE FOR {seq_name} ---")
            start = content.find(f'seq="{seq_name}"')
            if start != -1:
                # print next 1000 chars
                print(content[start:start+2000] + "...")
            else:
                 # Try finding just keys that might be relevant
                 pass

        # Check for likely candidates
        for s in seqs:
            if "TRAMO" in s or "HORARIO" in s or "DOCENTE" in s or "PROF" in s or "SESION" in s:
                print_sample(s)
                
except Exception as e:
    print("Error reading file:", e)
