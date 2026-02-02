import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

def peek_xml():
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        
        # Find 59890
        pos = content.find("59890")
        if pos != -1:
            print("--- CONTEXT AROUND 59890 ---")
            print(content[pos-200 : pos+1000])
        
        # Find any occurrence of "ACTIVIDAD"
        pos_act = content.find("ACTIVIDAD")
        if pos_act != -1:
            print("\n--- CONTEXT AROUND ACTIVIDAD ---")
            print(content[pos_act-100 : pos_act+1000])

peek_xml()
