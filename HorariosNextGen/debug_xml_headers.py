import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

print(f"--- FINDING SECTION HEADERS ---")
try:
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        
        # Find all seq="VALUE"
        all_seqs = re.findall(r'seq="([^"]+)"', content)
        
        # Filter out those ending in _NUMBER (e.g. PROFESORES_1)
        parent_seqs = sorted(list(set([s for s in all_seqs if not re.search(r'_\d+$', s)])))
        
        print("PARENT LISTS FOUND:", parent_seqs)
        
        # For each parent list, print the first 500 characters of its content to see structure
        for seq in parent_seqs:
            print(f"\n--- STRUCTURE OF {seq} ---")
            start = content.find(f'seq="{seq}"')
            if start != -1:
                chunk = content[start:start+1000]
                print(chunk)
                
except Exception as e:
    print("Error:", e)
