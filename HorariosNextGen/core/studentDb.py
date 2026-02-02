import sqlite3
import os
from typing import List, Dict, Optional

class StudentDB:
    def __init__(self, db_path: str = "secure_data.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initializes the student and backpack tables."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Table: Students
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS students (
                    id TEXT PRIMARY KEY,
                    groupId TEXT,
                    isNeae INTEGER DEFAULT 0,
                    name TEXT
                )
            """)
            
            # Table: Student Backpack (Pendientes)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS student_backpack (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    studentId TEXT,
                    subjectName TEXT,
                    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
                )
            """)
            
            conn.commit()

    def upsert_student(self, student_id: str, group_id: str, is_neae: bool, name: Optional[str], pending_subjects: List[str]):
        """Upserts a student and their pending subjects."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 1. Upsert Student
            cursor.execute("""
                INSERT INTO students (id, groupId, isNeae, name)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    groupId = excluded.groupId,
                    isNeae = excluded.isNeae,
                    name = COALESCE(excluded.name, students.name)
            """, (student_id, group_id, 1 if is_neae else 0, name))
            
            # 2. Reset Backpack (to avoid duplicates/old data)
            cursor.execute("DELETE FROM student_backpack WHERE studentId = ?", (student_id,))
            
            # 3. Insert New Backpack
            for subject in pending_subjects:
                cursor.execute("INSERT INTO student_backpack (studentId, subjectName) VALUES (?, ?)", (student_id, subject))
            
            conn.commit()

    def get_group_backpack_summary(self, group_id: str) -> Dict[str, int]:
        """Returns a count of pending subjects for a group."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT b.subjectName, COUNT(*) 
                FROM student_backpack b
                JOIN students s ON b.studentId = s.id
                WHERE s.groupId = ?
                GROUP BY b.subjectName
            """, (group_id,))
            return {row[0]: row[1] for row in cursor.fetchall()}

    def get_level_pending_alert(self, course_id: str, threshold: int = 15) -> List[Dict]:
        """Identifies subjects with more than X pendings in a level."""
        # Note: courseId is linked to group. In a real scenario, we'd need a groups table or metadata.
        # For now, we assume group IDs start with course identifier or we'd need more logic.
        pass
