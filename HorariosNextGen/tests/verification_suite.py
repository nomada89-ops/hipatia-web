import os
import sys
import sqlite3
import logging
from core.solver import ScheduleSolver
from core.exporter import Exporter
# import xml.etree.ElementTree as ET

# Setup
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("VerificationSuite")

def check_privacy(db_path="secure_data.db"):
    logger.info("--- Phase 2: Privacy Audit ---")
    if not os.path.exists(db_path):
        logger.warning(f"DB {db_path} not found. Skipping privacy check.")
        return
        
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Check if 'teachers' table exists and inspect names
    try:
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='teachers'")
        if cur.fetchone():
            cur.execute("SELECT name FROM teachers LIMIT 5")
            names = [row[0] for row in cur.fetchall()]
            logger.info(f"Sample stored names: {names}")
            
            # Simple heuristic: Real names usually have spaces, Hashes usually don't (or are long hex)
            # This is a weak check but sufficient for "Are we storing 'Juan Perez'?"
            leaks = [n for n in names if " " in n and len(n) < 30] 
            if leaks:
                logger.error(f"PRIVACY FAIL: Possible real names found in DB: {leaks}")
            else:
                logger.info("PRIVACY PASS: No obvious real names selected in sample.")
        else:
            logger.info("Teachers table not found (Solver mock usage?).")
            
    except Exception as e:
        logger.error(f"Privacy Audit Error: {e}")
    finally:
        conn.close()

def verify_export():
    logger.info("--- Phase 3: Export Verification ---")
    # Generate dummy XML for mapping if it doesn't exist, to test the Exporter logic
    mock_xml = "mock_delphos.xml"
    if not os.path.exists(mock_xml):
        with open(mock_xml, "w") as f:
            f.write("""<datos><listasal seq="DOCENTES"><listasal><salida dato="CLAVE">T1</salida><salida dato="NOMBRE">Profesor Test 1</salida></listasal></listasal><listasal seq="HORARIOS"></listasal></datos>""")
            
    exporter = Exporter(output_dir="test_output")
    exporter.generate_all(mock_xml)
    
    # Check outputs
    files = os.listdir("test_output")
    logger.info(f"Generated files in test_output: {files}")
    if "General_Schedule.pdf" in files or "General_Schedule.txt" in files:
        logger.info("EXPORT PASS: General Schedule generated.")
    else:
        logger.error("EXPORT FAIL: General Schedule missing.")

def run_suite():
    print("=== HorariosNextGen Verification Suite ===")
    
    # 1. Component Audit
    components = {
        "Solver": "core.solver",
        "Exporter": "core.exporter",
        "LegalEngine": "core.legal_engine",
        "AIAssistant": "core.ai_assistant"
    }
    print("\n[Component Status]")
    for name, module in components.items():
        try:
            __import__(module)
            print(f"✅ {name}: OK")
        except ImportError as e:
            print(f"❌ {name}: Missing ({e})")

    # 2. Dependency Audit
    print("\n[Optional Dependencies]")
    libs = ["reportlab", "pypdf", "ortools", "llama_cpp"]
    for lib in libs:
        try:
            __import__(lib)
            print(f"✅ {lib}: Installed")
        except ImportError:
            print(f"⚠️ {lib}: Not Installed (Will run in Mock Mode)")

    # 3. Solver Run
    print("\n[Solver Execution]")
    try:
        solver = ScheduleSolver()
        score = solver.solve()
        print(f"✅ Solver ran successfully. Quality Score: {score}")
    except Exception as e:
        print(f"❌ Solver Failed: {e}")

    # 4. Privacy & Export
    check_privacy()
    verify_export()

    print("\n=== Test Complete ===")

if __name__ == "__main__":
    run_suite()
