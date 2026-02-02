import PyInstaller.__main__
import os
import shutil

def build():
    print("--- Starting Cuadrante V1 Final Build (PyInstaller) ---")
    
    # Cleaning previous builds
    if os.path.exists("dist"): shutil.rmtree("dist")
    if os.path.exists("build"): shutil.rmtree("build")

    # Define splash image (Prioritize image_7c8a7a.jpg)
    splash_path = "assets/splash.png"
    
    logo_candidates = ["image_7c8a7a.jpg", "public/Cuadrante.png"]
    found_logo = None
    for cand in logo_candidates:
         if os.path.exists(cand):
             found_logo = cand
             break
             
    if found_logo:
        # We should use this as splash. Note: splash usually requires image format.
        # PyInstaller splash supports png.
        splash_path = found_logo

    # Define main entry point
    entry_point = "core/main.py"
    
    # PyInstaller Arguments
    args = [
        entry_point,
        '--name=Cuadrante_V1_Final',
        '--onefile',
        '--windowed',  # No console
        f'--splash={splash_path}', 
        '--add-data=core/models.py;.', # Add dependencies explicitly if needed
        # Hidden imports for dynamic libraries often missed
        '--hidden-import=ortools',
        '--hidden-import=reportlab',
        '--hidden-import=pypdf',
        '--hidden-import=argon2', 
        '--hidden-import=_cffi_backend', # Critical for argon2-cffi
        '--hidden-import=cryptography',
        '--clean',
        '--log-level=INFO'
    ]
    
    # Note: Icon usually needs .ico. If image_7c8a7a.jpg is passed as icon it might fail or warn.
    # We will skip explicit icon argument if no .ico found to avoid build failure.
    if os.path.exists("assets/icon.ico"):
        args.append('--icon=assets/icon.ico')
    
    print(f"Running PyInstaller with args: {args}")
    
    try:
        PyInstaller.__main__.run(args)
        print("\n✅ Build Successful! Executable 'Cuadrante_V1_Final.exe' is in /dist directory.")
        
        # Prepare Shipping Folder
        ship_dir = "CUADRANTE_READY_TO_SHIP"
        if not os.path.exists(ship_dir): os.makedirs(ship_dir)
        
        # Copy Exe
        shutil.copy(os.path.join("dist", "Cuadrante_V1_Final.exe"), ship_dir)
        
        # Copy Manual (if generated)
        if os.path.exists("Manual_Cuadrante.pdf"):
             shutil.copy("Manual_Cuadrante.pdf", ship_dir)
             
        # Copy Audit Log (if exists)
        if os.path.exists("logs/audit_report.txt"):
             shutil.copy("logs/audit_report.txt", os.path.join(ship_dir, "Audit_Certification.txt"))
             
        print(f"🚀 PACKAGE READY IN: {ship_dir}")
        
    except Exception as e:
        print(f"\n❌ Build Failed: {e}")

if __name__ == "__main__":
    build()
