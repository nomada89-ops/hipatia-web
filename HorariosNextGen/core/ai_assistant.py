import os
import json
import logging
from typing import List, Dict, Optional

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

from legal_engine import LegalEngine

class LocalAssistant:
    def __init__(self, model_path: str = "models/model.gguf"):
        self.model_path = model_path
        self.llm = None
        self.simulation_mode = False
        self.legal_engine = LegalEngine() # Initialize Legal Brain
        
        try:
            from llama_cpp import Llama
            if os.path.exists(model_path):
                logger.info(f"Loading local LLM from {model_path}...")
                self.llm = Llama(
                    model_path=model_path,
                    n_ctx=2048,
                    n_threads=4,
                    verbose=False
                )
            else:
                logger.warning(f"Model file not found at {model_path}. Switching to SIMULATION MODE.")
                self.simulation_mode = True
        except ImportError:
            logger.warning("llama-cpp-python library not found. Switching to SIMULATION MODE.")
            self.simulation_mode = True

    def analyze_conflicts(self, conflict_report_path: str = "conflict_report.json") -> Dict:
        """
        Reads the conflict report and generates advice.
        """
        if not os.path.exists(conflict_report_path):
            logger.error(f"Conflict report not found: {conflict_report_path}")
            return {}

        with open(conflict_report_path, 'r') as f:
            try:
                data = json.load(f)
                conflicts = data.get("conflicts", [])
            except json.JSONDecodeError:
                logger.error("Invalid JSON in conflict report.")
                return {}

        if not conflicts:
            return {"status": "No conflicts to analyze."}

        advice_results = {}
        
        for i, conflict_msg in enumerate(conflicts):
            # Retrieve Legal Context
            legal_context = self.legal_engine.get_relevant_articles(conflict_msg)
            
            advice = self._generate_advice(conflict_msg, legal_context)
            # Use hashed key or cleaner ID if available
            advice_results[f"conflict_{i+1}"] = {
                "issue": conflict_msg,
                "legal_context": legal_context,
                "expert_advice": advice
            }
            
        return advice_results

    def _generate_advice(self, conflict_msg: str, legal_context: List[str]) -> List[str]:
        """
        Generates 3 solutions using the LLM or Simulation, informed by legal context.
        """
        legal_text = "\n".join(legal_context)
        
        system_prompt = (
            "You are an Expert in Educational Legislation and School Scheduling. "
            "Your goal is to resolve technical schedule conflicts complying with Spanish educational regulations. "
            "Refer to the provided Legal Context if relevant. "
            "For the given conflict, provide exactly 3 distinct, feasible solutions. "
            "Do not request external data. Keep it concise."
        )
        
        user_prompt = f"Legal Context:\n{legal_text}\n\nConflict: {conflict_msg}\nProvide 3 solutions."

        if self.simulation_mode:
            return self._simulate_intelligence(conflict_msg)

        # Real LLM Inference
        try:
            output = self.llm.create_chat_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=256,
                temperature=0.7
            )
            text = output['choices'][0]['message']['content']
            # Basic parsing to split into list (assuming LLM outputs numbered list or newlines)
            return [line.strip() for line in text.replace('*', '').split('\n') if line.strip() and len(line.strip()) > 5][:3]
        except Exception as e:
            logger.error(f"LLM Inference Error: {e}")
            return ["Error generating advice."]

    def _simulate_intelligence(self, conflict_msg: str) -> List[str]:
        """
        Fallback logic for testing without the heavy model.
        """
        # Simple heuristic response based on keywords
        solutions = []
        
        if "Teacher" in conflict_msg and "available slots" in conflict_msg:
             solutions = [
                 "1. [Regulatory] Check if the teacher's contract allows for extra hours (Complementary Hours) under current regional laws.",
                 "2. [Organizational] Verify if 'Guardia' duties can be reduced to fit the schedule.",
                 "3. [Administrative] Split the module between two teachers (Requires Department approval)."
             ]
        elif "Group" in conflict_msg:
             solutions = [
                 "1. [Space] Move one session to a different classroom (Aula materia) if blocked by room availability.",
                 "2. [Time] Utilize 7th hour slot if regulations permit for this educational stage (Bachillerato/FP).",
                 "3. [Curriculum] Check for elective subjects that can be parallelized (Simultaneity)."
             ]
        else:
             solutions = [
                 "1. Manual review of the constraints in the Solver configuration.",
                 "2. Relax soft constraints (windows) to allow more flexibility.",
                 "3. Verify data integrity in the XML source (Delphos Export)."
             ]
             
        return solutions

if __name__ == "__main__":
    # Test Run
    assistant = LocalAssistant()
    # Create a dummy report if not exists for testing
    if not os.path.exists("conflict_report.json"):
        dummy_data = {"conflicts": ["CRITICAL: Teacher 'Teacher_A1' has 35 sessions but only 30 slots available."]}
        with open("conflict_report.json", "w") as f:
            json.dump(dummy_data, f)
        print("Created dummy conflict_report.json")
    
    advice = assistant.analyze_conflicts()
    print(json.dumps(advice, indent=2))
