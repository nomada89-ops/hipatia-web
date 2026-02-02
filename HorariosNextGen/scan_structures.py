import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

def scan_all_structures():
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        
        # Find all seqs that are parents (not ending in _digit)
        all_seqs = re.findall(r'seq="([^"]+)"', content)
        parents = sorted(list(set([s for s in all_seqs if not re.search(r'_\d+$', s)])))
        
        for p in parents:
            print(f"\n--- Sequence: {p} ---")
            # Find the first child listasal (e.g. p_1)
            child_match = re.search(rf'<listasal seq="{p}_\d+">(.*?)</listasal>', content, re.DOTALL)
            if child_match:
                datos = re.findall(r'dato="([^"]+)"', child_match.group(1))
                print(f"Child datos: {sorted(list(set(datos)))}")
                # Show first child raw
                print(child_match.group(0))

scan_all_structures()
