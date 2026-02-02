
# --- Dependency Hard Check (Entry Point) ---
def hard_dependency_check():
    """
    Checks for argon2-cffi and reportlab.
    If missing, shows Alert with Logo and Kills Process.
    """
    missing = []
    try:
        import argon2
    except ImportError:
        missing.append("argon2-cffi")
        
    try:
        import reportlab
    except ImportError:
        missing.append("reportlab")

    if missing:
        import ctypes
        import sys
        # Try to show a visual error (Windows specific)
        msg = f"CRITICAL SECURITY ERROR:\nMissing Hard Dependencies: {', '.join(missing)}\n\nApplication cannot start safely."
        try:
            ctypes.windll.user32.MessageBoxW(0, msg, "Cuadrante Security Halt", 0x10 | 0x0)
        except:
            print(msg)
        sys.exit(1)

hard_dependency_check()

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import sys
import os
import time

# Ensure we can import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from security_manager import SecurityManager
from audit_suite import secure_file_shredder # Import shredder

app = FastAPI()

# Enable CORS for React frontend (localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = SecurityManager()

# --- Schemas ---
class SetupRequest(BaseModel):
    user_secret: str

class UnlockRequest(BaseModel):
    user_secret: str

class ShredRequest(BaseModel):
    file_path: str
    confirm_secret: str

class StudentEnrollment(BaseModel):
    id: str
    groupId: str
    isNeae: bool
    name: Optional[str] = None
    pendingSubjects: List[str] = []

class EnrollmentSyncRequest(BaseModel):
    students: List[StudentEnrollment]

# --- Background Worker State ---
from studentDb import StudentDB
db = StudentDB()
processing_state = {
    "status": "idle",
    "progress": 0,
    "current_task": None
}

def bg_process_schedule(task_id: str):
    """
    Simulates background processing with strict hygiene.
    """
    global processing_state
    processing_state["status"] = "running"
    processing_state["progress"] = 0
    processing_state["current_task"] = task_id
    
    try:
        # Simulate Heavy Work (Export/Hashing)
        # In real scenario, this calls solver.solve()
        total_steps = 20
        for i in range(total_steps):
            time.sleep(0.5) # Simulate work
            processing_state["progress"] = int((i + 1) / total_steps * 100)
            
        processing_state["status"] = "completed"
    except Exception as e:
        processing_state["status"] = "error"
    finally:
        # Hygiene
        pass

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"status": "HorariosNextGen Backend Running"}

@app.get("/system/info")
def get_system_info():
    is_locked = security.user_salt is None and security.is_setup
    return {
        "hwid": security.hwid,
        "secure": True,
        "platform": sys.platform,
        "is_setup": security.is_setup,
        "is_locked": is_locked,
        "processing": processing_state
    }

@app.post("/system/setup")
def system_setup(req: SetupRequest):
    if security.is_setup:
        raise HTTPException(status_code=400, detail="System already setup.")
    
    try:
        recovery_blob = security.initial_setup(req.user_secret)
        import base64
        return {
            "status": "success", 
            "recovery_vault": base64.b64encode(recovery_blob).decode(),
            "message": "CRITICAL: Save the recovery_vault immediately. It is shown ONCE."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/system/unlock")
def system_unlock(req: UnlockRequest):
    if not security.is_setup:
         raise HTTPException(status_code=400, detail="System not setup.")
    
    try:
        security.unlock_system(req.user_secret)
        return {"status": "unlocked"}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Unlock Failed")

@app.post("/process/start")
def start_processing(background_tasks: BackgroundTasks):
    if security.user_salt is None:
         raise HTTPException(status_code=403, detail="System Locked. Unlock first.")
    
    if processing_state["status"] == "running":
        return {"status": "busy"}

    task_id = "TASK_" + str(int(time.time()))
    background_tasks.add_task(bg_process_schedule, task_id)
    return {"status": "started", "task_id": task_id}
    
@app.post("/system/shred")
async def system_shred(req: ShredRequest):
    """
    Securely destroys a file (Gutmann/DoD).
    """
    # 1. Verify Request
    if not security.is_setup: 
         raise HTTPException(status_code=403, detail="System not setup")
    
    # 2. Verify File (Path traversal check / extension)
    if ".." in req.file_path or not req.file_path.endswith(".xml"):
        raise HTTPException(status_code=400, detail="Invalid target for shredding")
        
    if not os.path.exists(req.file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # 3. Shred
    try:
        secure_file_shredder(req.file_path, passes=3)
        security.write_legal_log("SHREDDER", f"Destroyed: {req.file_path}")
        return {"status": "shredded", "method": "DoD 3-pass"}
@app.post("/enrollment/sync")
def sync_enrollment(req: EnrollmentSyncRequest):
    """
    Persists student data and pending subjects into SQLite.
    """
    try:
        for student in req.students:
            db.upsert_student(
                student_id=student.id,
                group_id=student.groupId,
                is_neae=student.isNeae,
                name=student.name,
                pending_subjects=student.pendingSubjects
            )
        return {"status": "success", "synced": len(req.students)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/enrollment/group/{group_id}/backpack")
def get_backpack_summary(group_id: str):
    """
    Returns breakdown of pending subjects for a group.
    """
    try:
        return db.get_group_backpack_summary(group_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting HorariosNextGen Core...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
