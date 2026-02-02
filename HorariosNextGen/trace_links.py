import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

def find_links():
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        
        # Find all sequences that mention 59890
        matches = re.findall(rf'<listasal seq="(.*?)">.*?59890.*?</listasal>', content, re.DOTALL)
        print(f"Sequences containing 59890: {set(matches)}")
        
        # Now let's see an example of one of these
        for seq in set(matches):
            if seq.startswith("PROFESORES_"): continue # Skip the definition itself
            example = re.search(rf'<listasal seq="{seq}">.*?59890.*?</listasal>', content, re.DOTALL)
            if example:
                print(f"\n--- Example of {seq} ---")
                print(example.group(0))

find_links()
