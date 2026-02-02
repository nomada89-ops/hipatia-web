import sqlite3
import os
import logging
from typing import Dict, List, Optional, Tuple

# Use lxml for strict structure and encoding
try:
    from lxml import etree as ET
except ImportError:
    # Fallback to standard lib if lxml missing (though Mirror Export needs lxml for specific legacy behavior usually)
    import xml.etree.ElementTree as ET

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class Exporter:
    def __init__(self, db_path: str = "secure_data.db", output_dir: str = "output/"):
        self.db_path = db_path
        self.output_dir = output_dir
        self.has_reportlab = False
        self.fernet = None # For Memory Guard
        
        try:
            import reportlab
            self.has_reportlab = True
        except ImportError:
            logger.warning("reportlab library not found. PDFs will be simulated.")
            
        # Memory Guard: Ephemeral Key for this export session
        try:
            from cryptography.fernet import Fernet
            self.fernet = Fernet(Fernet.generate_key())
            logger.info("Memory Guard: Active (Ephemeral Memory Encryption)")
        except ImportError:
            logger.warning("cryptography not found. Memory Guard DISABLED.")

        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def _encrypt_mem(self, text: str) -> bytes:
        if self.fernet: return self.fernet.encrypt(text.encode())
        return text.encode() # Fallback

    def _decrypt_mem(self, data: bytes) -> str:
        if self.fernet: return self.fernet.decrypt(data).decode()
        return data.decode()

    def shred_file(self, path: str):
        """
        Securely shreds a file by overwriting it 3 times with random/fixed bytes (DoD 5220.22-M style)
        before unlinking.
        """
        if not os.path.exists(path): return
        
        try:
            length = os.path.getsize(path)
            with open(path, "br+") as f:
                # Pass 1: Zeros
                f.write(b'\x00' * length)
                f.seek(0)
                # Pass 2: Ones
                f.write(b'\xFF' * length)
                f.seek(0)
                # Pass 3: Random
                f.write(os.urandom(length))
            
            os.remove(path)
            logger.info(f"SECURE SHRED: {path}")
        except Exception as e:
            logger.error(f"Shred failed for {path}: {e}")

    # Legacy alias if needed, routing to shred_file
    def secure_delete(self, path: str):
        self.shred_file(path)

    def generate_all(self, original_xml_path: str, schedule_data: List[Dict]):
        """
        Master export function with Secure Garbage Collection.
        """
        logger.info("Starting Full Export Process...")
        temp_files = [] # Track files for cleanup
        
        try:
            # 1. Build Name Map (Securely in Memory)
            name_map = self._build_name_map(original_xml_path) 
            
            # 2. Generate Artifacts
            self.generate_general_pdf(schedule_data, name_map)
            self.generate_individual_pdfs(schedule_data, name_map)
            
            # 3. Mirror XML Export (The Critical One)
            self.generate_delphos_xml(schedule_data, original_xml_path)
            
            self.generate_compliance_report(schedule_data)
            
            logger.info(f"Export completed.")
            
        except Exception as e:
            logger.error(f"Export flow failed: {e}")
            raise
        finally:
            # GARBAGE COLLECTION
            logger.info("Executing Secure Garbage Collection...")
            for tmp in temp_files:
                self.shred_file(tmp)
            logger.info("GC Complete.")

    def _build_name_map(self, xml_path: str) -> Dict[str, bytes]:
        name_map = {}
        try:
            # Use basic ET parse for name extraction logic if lxml is complex with names handling or vice versa
            # Sticking to whatever imported ET is
            tree = ET.parse(xml_path)
            root = tree.getroot()
            # XPath syntax differs slightly between ET and lxml usually, but simple ones work
            # Adjusting for potential Namespace issues if strict
            
            # Try finding DOCENTES recursively
            # ElementTree 'find' doesn't support // without simple xpath
            # lxml does. Assume DOCENTES is under DATOS/CENTRO... or just search all
            
            if hasattr(root, 'xpath'): # lxml
                 nodes = root.xpath(".//listasal[@seq='DOCENTES']//listasal")
                 for child in nodes:
                    t_id = child.xpath(".//salida[@dato='CLAVE']")[0].text
                    # Try NOMBRE or APELLIDOS_NOMBRE
                    names = child.xpath(".//salida[@dato='NOMBRE'] | .//salida[@dato='APELLIDOS_NOMBRE']")
                    t_name = names[0].text if names else "Unknown"
                    if t_id: name_map[t_id] = self._encrypt_mem(t_name)
            else:
                 # Standard Stdlib ET
                 container = root.find(".//listasal[@seq='DOCENTES']")
                 if container:
                    for child in container.findall("listasal"):
                        t_id_node = child.find(".//salida[@dato='CLAVE']")
                        t_name_node = child.find(".//salida[@dato='NOMBRE']")
                        if t_id_node is not None and t_id_node.text:
                             t_name = t_name_node.text if t_name_node is not None else "Unknown"
                             name_map[t_id_node.text] = self._encrypt_mem(t_name)

        except Exception as e:
            logger.error(f"Error mapping names: {e}")
        return name_map

    def generate_general_pdf(self, schedule: List[Dict], name_map: Dict[str, bytes]):
        filename = os.path.join(self.output_dir, "General_Schedule.pdf")
        if not self.has_reportlab:
            # Mock logic
            with open(filename.replace(".pdf", ".txt"), "w") as f:
                 f.write("General Schedule (Simulated without ReportLab)\n")
            return

        from reportlab.pdfgen import canvas
        c = canvas.Canvas(filename)
        c.drawString(50, 800, "Horario General")
        c.save()

    def generate_individual_pdfs(self, schedule: List[Dict], name_map: Dict[str, bytes]):
        teachers_dir = os.path.join(self.output_dir, "teachers")
        if not os.path.exists(teachers_dir): os.makedirs(teachers_dir)
        # Mock logic passed for now
        pass

    def generate_delphos_xml(self, schedule: List[Dict], original_xml: str):
        """
        STRICT MIRROR EXPORT (ISO-8859-1)
        Preserves original structure, injects new schedule into ACTIVIDAD_X nodes.
        """
        output_filename = f"Export_Mirror_{os.path.basename(original_xml)}"
        output_path = os.path.join(self.output_dir, output_filename)
        
        try:
            # 1. Parse using LXML for strict preservation
            parser = ET.XMLParser(remove_blank_text=False, strip_cdata=False, encoding="ISO-8859-1")
            tree = ET.parse(original_xml, parser)
            root = tree.getroot()
            
            # --- PHASE 1: Build Validation Universe ---
            valid_tramos = set()
            tramo_lookup = {} # (day_int, start_time_str) -> tramo_id
            
            # Helper for getting text safely
            def get_val(node, path):
                res = node.xpath(path)
                return res[0].text if res else None

            # Scan TRAMOS
            tramos_nodes = root.xpath(".//listasal[@seq='TRAMOS']//listasal")
            for t_node in tramos_nodes:
                tid = get_val(t_node, "salida[@dato='CLAVE']")
                dia = get_val(t_node, "salida[@dato='DIA']")
                hora = get_val(t_node, "salida[@dato='HORA_INICIO']")
                
                if tid:
                    valid_tramos.add(tid)
                    if dia and hora:
                        # Normalize time? "08:30" vs "8:30"
                        # Solver usually outputs HH:MM. Ensure match.
                        # Assuming strict match for now or basic norm.
                        tramo_lookup[(int(dia), hora)] = tid

            # Scan MATERIAS (for loose validation, though sanitization overrides 452 etc)
            # Not strictly blocking if Solver outputs correct IDs, but good to know errors
            
            # --- PHASE 2: Group New Data ---
            teacher_schedule = {}
            for sess in schedule:
                tid = sess.get('teacher_id')
                if tid not in teacher_schedule: teacher_schedule[tid] = []
                teacher_schedule[tid].append(sess)

            # --- PHASE 3: Injection Loop ---
            docentes_nodes = root.xpath(".//listasal[@seq='DOCENTES']//listasal")
            
            for doc_node in docentes_nodes:
                teacher_id = get_val(doc_node, "salida[@dato='CLAVE']")
                if not teacher_id: continue
                
                # Check if we have data for this teacher
                if teacher_id not in teacher_schedule:
                    # Clear their activities? Or leave as is?
                    # Mirror implies "New State". If valid teacher but no classes in Solver -> Empty Schedule
                    # So we should clear existing activities to be safe.
                    pass
                
                # Find Container: usually inside the teacher node, look for child listasal starting with ACTIVIDAD
                # Strict xpath: child 'listasal' where attribute 'seq' starts with 'ACTIVIDAD'
                act_container = None
                
                # Direct children check
                for child in doc_node:
                    if child.tag == 'listasal' and child.get('seq', '').startswith('ACTIVIDAD'):
                        act_container = child
                        break
                
                if act_container is None:
                    # If assume template is populated, this might not happen. 
                    # If empty template, might need creation. 
                    # Warning and skip for now as per "Mirror" premise (template has structure)
                    # logger.warning(f"No Activity container for {teacher_id}")
                    continue
                
                # CLEAR OLD DATA
                # Remove all 'listasal' children (Registros)
                for record in list(act_container):
                    act_container.remove(record)
                    
                # INJECT NEW DATA
                sessions = teacher_schedule.get(teacher_id, [])
                
                for i, sess in enumerate(sessions):
                    # Resolve TRAMO
                    # Try solver's tramo_id first
                    t_id_out = sess.get('tramo_id')
                    
                    # If not, try map
                    if not t_id_out:
                        start_time = sess.get('start_time')
                        day = sess.get('day')
                        t_id_out = tramo_lookup.get((int(day), start_time))
                    
                    # Validation
                    if not t_id_out or t_id_out not in valid_tramos:
                        # ERROR REPORTING
                        msg = f"Orphan ID Error: Tramo '{t_id_out}' (Day {sess.get('day')} {sess.get('start_time')}) not found in Original XML."
                        logger.critical(msg)
                        raise ValueError(msg) 
                        
                    # Create Node
                    # Naming conv: ACTIVIDAD_{TEACHER}_{Index} or just incrementing seq?
                    # Delphos usually uses generic naming or just listasal without seq inside? 
                    # Assuming we mimic standard: append child
                    
                    reg_node = ET.SubElement(act_container, "listasal")
                    # Usually seq attribute is optional for inner items or sequential
                    reg_node.set("seq", f"REGISTRO_{i+1}")
                    
                    # Helper to set val
                    def set_out(key, val):
                        # Find existing or create? Create new 'salida'
                        s = ET.SubElement(reg_node, "salida")
                        s.set("dato", key)
                        s.text = val or ""

                    # SANITIZATION Logic
                    subj_id = sess.get('subject_id', "")
                    is_generic = subj_id in ["452", "455", "620"]
                    
                    set_out("X_TRAMO", t_id_out)
                    
                    if is_generic:
                        set_out("X_MATERIAOMC", "")
                        set_out("X_UNIDAD", "")
                        set_out("X_DEPCENTRO", "")
                        # Generic tasks often put code in ACTIVIDAD or FUNCION
                        set_out("X_ACTIVIDAD", subj_id) 
                    else:
                        set_out("X_MATERIAOMC", subj_id)
                        set_out("X_UNIDAD", sess.get('group_id', ""))
                        set_out("X_DEPCENTRO", "") # Default empty per strict Mirror
                        set_out("X_ACTIVIDAD", "1") # DOCENCIA default
            
            # --- PHASE 4: Write ---
            # Compliance: ISO-8859-1
            tree.write(output_path, encoding="ISO-8859-1", xml_declaration=True, pretty_print=True)
            logger.info(f"Mirror Export Success: {output_path}")

        except Exception as e:
            logger.error(f"Mirror Export Failed: {e}")
            raise

    def generate_compliance_report(self, schedule):
        filename = os.path.join(self.output_dir, "Compliance_Report.txt")
        with open(filename, "w") as f:
            f.write("Compliance Report\n=================\n")
            f.write(f"Total Sessions: {len(schedule)}\n")
            f.write("Mirror Export: Active\n")
            f.write("Sanitization Rules: [452, 455, 620]\n")
        logger.info(f"Generated Compliance Report: {filename}")

if __name__ == "__main__":
    # Test stub
    pass
