import os
import logging
from typing import List, Dict

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class LegalEngine:
    def __init__(self, regulations_path: str = "regulations/"):
        self.regulations_path = regulations_path
        self.knowledge_base = {} # Filename -> Text content
        self.has_pypdf = False

        try:
            import pypdf
            self.has_pypdf = True
        except ImportError:
            logger.warning("pypdf library not found. Legal Engine running in MOCK mode.")

        # Load existing docs on init
        self._load_documents()

    def _load_documents(self):
        """
        Loads and parses all PDFs in the regulations folder.
        """
        if not os.path.exists(self.regulations_path):
            os.makedirs(self.regulations_path, exist_ok=True)
            return

        for filename in os.listdir(self.regulations_path):
            if filename.endswith(".pdf"):
                path = os.path.join(self.regulations_path, filename)
                self.knowledge_base[filename] = self._extract_text(path)

    def _extract_text(self, path: str) -> str:
        """
        Extracts text from a single PDF.
        """
        if not self.has_pypdf:
            return "Mock Legal Text: Regulation content not available without pypdf."
        
        try:
            from pypdf import PdfReader
            reader = PdfReader(path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Failed to read {path}: {e}")
            return ""

    def get_relevant_articles(self, query: str) -> List[str]:
        """
        Returns relevant text chunks based on keywords in the query/conflict.
        """
        results = []
        
        # Simple keyword matching for prototype
        keywords = {
            "overload": ["horas lectivas", "carga horaria", "cupo"],
            "guardia": ["guardias", "periodos complementarios", "recreo"],
            "group": ["ratio", "aula materia", "agrupamiento"],
            "split": ["desdoble", "refuerzo"]
        }
        
        # Determine active keywords from query
        active_terms = []
        for key, terms in keywords.items():
            if key in query.lower() or any(term in query.lower() for term in terms):
                active_terms.extend(terms)

        # Search in knowledge base
        for doc_name, content in self.knowledge_base.items():
            # If mock, provide relevant mock citations
            if not self.has_pypdf:
                if "overload" in query.lower():
                    results.append(f"[{doc_name}] Art. 14: Máximo 20 horas lectivas semanales (Mock Citation).")
                elif "guardia" in query.lower():
                    results.append(f"[{doc_name}] Art. 22: Distribución de guardias de recreo (Mock Citation).")
                continue

            # Real search (simple sliding window or paragraph check)
            # Todo: Implement vector search for production
            lines = content.split('\n')
            for i, line in enumerate(lines):
                 if any(term in line.lower() for term in active_terms):
                     # Return context window
                     start = max(0, i-1)
                     end = min(len(lines), i+3)
                     snippet = "\n".join(lines[start:end])
                     results.append(f"[{doc_name}] ...{snippet}...")
                     if len(results) > 3: break # Limit info
            
        # Default fallback if nothing found
        if not results:
            results.append("No specific legal articles found for this issue in loaded documents.")

        return results[:3] # Return top 3 matches
