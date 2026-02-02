import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

def get_all_seqs():
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        seqs = re.findall(r'seq="([^"]+)"', content)
        unique_seqs = sorted(list(set(seqs)))
        print("ALL unique seq values:")
        for s in unique_seqs:
            print(s)

get_all_seqs()
