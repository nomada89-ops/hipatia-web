import hashlib
import logging
import os
import secrets
from typing import List, Dict, Optional, Tuple
from xml.etree import ElementTree as ET
from models import Teacher, Group, Subject, Classroom, Session
import sqlite3
import re
import uuid

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class XMLImporter:
    def __init__(self, xml_path: str):
        self.xml_path = xml_path
        self.salt_file = ".privacy_salt"
        self.privacy_salt = self._load_or_create_salt()
        self.validation_errors: List[str] = []
        self.upgraded_subjects: List[str] = []
        
        # Internal temporary storage to link objects if needed
        self.parsed_teachers: Dict[str, Teacher] = {}
        self.parsed_groups: Dict[str, Group] = {}
        self.parsed_subjects: Dict[str, Subject] = {}
        self.parsed_sessions: List[Session] = []

    def _load_or_create_salt(self) -> str:
        """
        Loads the salt from a hidden local file or creates a new high-entropy salt.
        """
        if os.path.exists(self.salt_file):
            try:
                with open(self.salt_file, "r") as f:
                    return f.read().strip()
            except IOError:
                logger.error("Could not read salt file. Creating new one (Warning: Previous hashes will be invalid).")
        
        # Create new salt
        new_salt = secrets.token_hex(32)
        try:
            with open(self.salt_file, "w") as f:
                f.write(new_salt)
            logger.info(f"Created new privacy salt file: {self.salt_file}")
        except IOError as e:
            logger.error(f"Failed to write salt file: {e}")
        
        return new_salt

    def _tokenize_name(self, original_name: str) -> str:
        """
        Anonymizes the name using SHA-256 and the local salt.
        Returns a formatted string 'Teacher_<hash>' 
        """
        raw = f"{original_name}{self.privacy_salt}".encode()
        hash_digest = hashlib.sha256(raw).hexdigest()[:12] # Shortened for readability, still secure enough for collisions in small set
        return f"Teacher_{hash_digest}"

    def check_hash(self, original_name: str, stored_hash: str) -> bool:
        """
        Verifies if a real name matches a stored hash without revealing the salt openly.
        Usage: importer.check_hash("User Name", "Teacher_a1b2...")
        """
        expected = self._tokenize_name(original_name)
        return expected == stored_hash

    def load_and_parse(self) -> Dict[str, List]:
        """
        Parses the Delphos Model 1 XML.
        """
        try:
            tree = ET.parse(self.xml_path)
            root = tree.getroot()
        except Exception as e:
            logger.error(f"Failed to parse XML: {e}")
            return {}

        # 1. Groups
        groups_list = self._parse_generic_list(root, "GRUPOS", self._map_group)
        for g in groups_list:
            self.parsed_groups[g.id] = g

        # 2. Subjects
        subjects_list = self._parse_generic_list(root, "MATERIAS", self._map_subject)
        for s in subjects_list:
            self.parsed_subjects[s.id] = s

        # 3. Teachers (With Privacy Tokenization)
        teachers_list = self._parse_generic_list(root, "DOCENTES", self._map_teacher)
        for t in teachers_list:
            self.parsed_teachers[t.id] = t

        # 4. Sessions (Using IDs mapped above)
        # Note: XML usually has 'HORARIOS' or 'TRAMOS' linking TeacherID -> GroupID -> SubjectID
        self.parsed_sessions = self._parse_generic_list(root, "HORARIOS", self._map_session)

        data = {
            "groups": list(self.parsed_groups.values()),
            "subjects": list(self.parsed_subjects.values()),
            "teachers": list(self.parsed_teachers.values()),
            "sessions": self.parsed_sessions
        }
        
        self._log_validation_summary()
        return data

    def save_to_db(self, db_path: str = "secure_data.db"):
        """
        Persists the parsed data into SQLite.
        """
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Schema Creation (Idempotent)
        cursor.execute('''CREATE TABLE IF NOT EXISTS teachers (
                            id TEXT PRIMARY KEY, 
                            name TEXT, 
                            department TEXT,
                            is_hashed INTEGER)''')
                            
        cursor.execute('''CREATE TABLE IF NOT EXISTS groups (
                            id TEXT PRIMARY KEY, 
                            name TEXT, 
                            short_name TEXT)''')
                            
        cursor.execute('''CREATE TABLE IF NOT EXISTS subjects (
                            id TEXT PRIMARY KEY, 
                            name TEXT, 
                            short_name TEXT, 
                            cod_curso TEXT,
                            is_guardia INTEGER,
                            is_split INTEGER)''')
                            
        cursor.execute('''CREATE TABLE IF NOT EXISTS sessions (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            day INTEGER,
                            start_time TEXT,
                            end_time TEXT,
                            teacher_id TEXT,
                            subject_id TEXT,
                            group_id TEXT,
                            classroom_id TEXT,
                            FOREIGN KEY(teacher_id) REFERENCES teachers(id),
                            FOREIGN KEY(subject_id) REFERENCES subjects(id))''') # Simplified relationships

        # Insert Teachers
        for t in self.parsed_teachers.values():
            cursor.execute("INSERT OR REPLACE INTO teachers (id, name, department, is_hashed) VALUES (?, ?, ?, ?)",
                           (t.id, t.name, t.department, 1 if t.is_hashed else 0))

        # Insert Groups
        for g in self.parsed_groups.values():
            cursor.execute("INSERT OR REPLACE INTO groups (id, name, short_name) VALUES (?, ?, ?)",
                           (g.id, g.name, g.short_name))
                           
        # Insert Subjects
        for s in self.parsed_subjects.values():
             cursor.execute("INSERT OR REPLACE INTO subjects (id, name, short_name, cod_curso, is_guardia, is_split) VALUES (?, ?, ?, ?, ?, ?)",
                           (s.id, s.name, s.short_name, s.cod_curso, 1 if s.is_guardia else 0, 1 if s.is_split else 0))

        # Insert Sessions (Bulk)
        # We clear old sessions for these imported entities or append? Usually clear if full import.
        # For safety in this prototype, we'll just append, user can clear DB if needed.
        for sess in self.parsed_sessions:
            # Flatten group_ids for simple SQL storage (one row per group link usually, or comma separated)
            # For strict relational, we'd do one row per group-session link.
            for g_id in sess.group_ids:
                cursor.execute("INSERT INTO sessions (day, start_time, end_time, teacher_id, subject_id, group_id, classroom_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                               (sess.day, sess.start_time, sess.end_time, sess.teacher_id, sess.subject_id, g_id, sess.classroom_id))

        conn.commit()
        conn.close()
        logger.info(f"Saved {len(self.parsed_teachers)} teachers, {len(self.parsed_groups)} groups, {len(self.parsed_subjects)} subjects, {len(self.parsed_sessions)} session records to database.")


    # --- Parsing Helpers ---

    def _get_val(self, node: ET.Element, key: str) -> Optional[str]:
        found = node.find(f".//salida[@dato='{key}']")
        if found is not None:
            return found.text
        return None

    def _parse_generic_list(self, root: ET.Element, seq_prefix: str, mapper_func) -> List:
        items = []
        container = root.find(f".//listasal[@seq='{seq_prefix}']")
        if container is None:
            return []
        for child in container.findall("listasal"):
            item = mapper_func(child)
            if item:
                items.append(item)
        return items

    # --- Mappers ---

    def _map_group(self, node: ET.Element) -> Optional[Group]:
        g_id = self._get_val(node, "CLAVE")
        name = self._get_val(node, "NOMBRE")
        if g_id and name:
            return Group(id=g_id, name=name)
        return None

    def _map_subject(self, node: ET.Element) -> Optional[Subject]:
        s_id = self._get_val(node, "CLAVE")
        name = self._get_val(node, "NOMBRE")
        if s_id and name:
            abbr = self._get_val(node, "ABREVIATURA")
            is_guardia = "GUARDIA" in name.upper()
            is_split = "DESDOBLE" in name.upper() or "(DES)" in name.upper()
            
            return Subject(id=s_id, name=name, short_name=abbr, is_guardia=is_guardia, is_split=is_split)
        return None

    def _map_teacher(self, node: ET.Element) -> Optional[Teacher]:
        t_id = self._get_val(node, "CLAVE")
        real_name = self._get_val(node, "NOMBRE") or self._get_val(node, "APELLIDOS_NOMBRE")
        
        if t_id and real_name:
            hashed_name = self._tokenize_name(real_name)
            return Teacher(id=t_id, name=hashed_name, is_hashed=True)
        return None

    def _map_session(self, node: ET.Element) -> Optional[Session]:
        # Mapping logic for HORARIOS / TRAMOS
        t_id = self._get_val(node, "CLAVE_DOCENTE")
        g_id = self._get_val(node, "CLAVE_GRUPO")
        s_id = self._get_val(node, "CLAVE_MATERIA")
        day_str = self._get_val(node, "DIA")
        tramo = self._get_val(node, "TRAMO") # e.g. "08:15-09:10"
        
        if t_id and s_id and day_str:
            # Parse day
            try:
                day = int(day_str)
            except:
                day = 1 # Fallback
                
            # Parse times
            start = "00:00"
            end = "00:00"
            if tramo and "-" in tramo:
                parts = tramo.split("-")
                if len(parts) == 2:
                    start, end = parts[0].strip(), parts[1].strip()

            return Session(
                day=day, 
                start_time=start, 
                end_time=end, 
                teacher_id=t_id, 
                subject_id=s_id,
                group_ids=[g_id] if g_id else []
            )
        return None

    def _log_validation_summary(self):
        if self.validation_errors:
            logger.warning(f"Found {len(self.validation_errors)} validation issues.")

if __name__ == "__main__":
    # Example usage for verification
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--xml", help="Path to XML file", default="tests/mock_delphos.xml")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    imp = XMLImporter(args.xml)
    data = imp.load_and_parse()
    
    print(f"Loaded: {len(data['teachers'])} Teachers, {len(data['groups'])} Groups")
    
    if not args.dry_run:
        imp.save_to_db()
        print("Data saved to secure_data.db")
    else:
        print("Dry Run: No data saved.")
