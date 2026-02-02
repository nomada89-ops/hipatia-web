from pydantic import BaseModel, Field
from typing import Optional, List

# --- Data Models (Pydantic) ---

class Teacher(BaseModel):
    """
    Represents a teacher. 
    'original_name' is kept dynamically but NOT stored in the secure DB if privacy is enabled.
    'tokenized_id' is the hashed identifier for LOPD compliance.
    """
    id: str # Internal Code (e.g. DNI or Delphos ID)
    name: str # Tokenized Name (or Real Name if privacy disabled)
    department: Optional[str] = None
    is_hashed: bool = True # Tracks if the name is privacy-protected

class Subject(BaseModel):
    """
    Represents a subject/module (Materia).
    """
    id: str # Internal ID (CLAVE)
    name: str # Full Name (e.g. Matemáticas)
    short_name: Optional[str] = None # ABREVIATURA
    cod_curso: Optional[str] = None # CODIGO_CURSO (for grouping)
    
    # Upgrade Logic Flags
    is_guardia: bool = False
    is_split: bool = False # Desdoble
    original_code: Optional[str] = None # To track changes if name is normalized

class Group(BaseModel):
    """
    Represents a student group (e.g. 2DAM).
    """
    id: str
    name: str
    short_name: Optional[str] = None

class Classroom(BaseModel):
    """
    Represents a physical space (Aula).
    """
    id: str
    name: str

class Session(BaseModel):
    """
    Represents a single time slot in the schedule.
    """
    # id: str # Generated UUID usually, or derived from combined keys
    day: int # 1 = Monday, 5 = Friday
    start_time: str # HH:MM
    end_time: str # HH:MM
    teacher_id: str # Must match Teacher.id
    subject_id: str # Must match Subject.id
    group_ids: List[str] # A session can be for multiple groups
    classroom_id: Optional[str] = None
